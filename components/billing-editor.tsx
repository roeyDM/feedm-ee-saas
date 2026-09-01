"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/upgrade-modal";
import { ChangePlanModal } from "@/components/change-plan-modal";
import { PlanType, supabase } from "@/lib/supabase";
import { checkAndApplyTrialDowngrade, getRemainingTrialDays, isUserSuperAdmin } from "@/lib/auth-guards";

import { useFeatureAccess } from "@/hooks/use-feature-access";

interface BillingEditorProps {
  planType: PlanType;
  setPlanType: (plan: PlanType) => void;
  username: string;
}

export function BillingEditor({ planType: initialPlanType, setPlanType, username }: BillingEditorProps) {
  const { currentPlan } = useFeatureAccess(initialPlanType);
  const activePlan = currentPlan || (initialPlanType || "free").toLowerCase();

  const [loadingPortal, setLoadingPortal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("active");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardLastFour, setCardLastFour] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<string | null>("monthly");
  const [nextBillingAt, setNextBillingAt] = useState<string | null>(null);
  const [subscriptionStartAt, setSubscriptionStartAt] = useState<string | null>(null);
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | null>(null);

  // Fetch real profile billing & trial details from Supabase
  useEffect(() => {
    async function loadBillingProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (profile.customer_portal_url || profile.lemon_squeezy_customer_portal_url) {
            setCustomerPortalUrl(profile.customer_portal_url || profile.lemon_squeezy_customer_portal_url);
          }
          if (profile.card_brand) setCardBrand(profile.card_brand);
          if (profile.card_last_four) setCardLastFour(profile.card_last_four);
          if (profile.billing_interval) setBillingInterval(profile.billing_interval);
          if (profile.next_billing_at) setNextBillingAt(profile.next_billing_at);
          if (profile.subscription_start_at) setSubscriptionStartAt(profile.subscription_start_at);
          if (profile.updated_at) setProfileUpdatedAt(profile.updated_at);

          const checked = await checkAndApplyTrialDowngrade(profile);
          if (checked.is_super_admin === true) {
            setIsSuperAdmin(true);
            setPlanType("pro");
            setSubscriptionStatus("active");
          } else {
            if (checked.plan) setPlanType(checked.plan.toLowerCase() as PlanType);
            setSubscriptionStatus(checked.payment_status || checked.subscription_status || "active");
            setTrialEndsAt(checked.trial_ends_at || null);
          }
        }
      } catch (err) {
        console.warn("[Billing Profile Fetch Note]:", err);
      }
    }
    loadBillingProfile();
  }, [username]);

  // Lemon Squeezy Customer Portal Redirect Handler
  const handleOpenLemonPortal = async () => {
    setLoadingPortal(true);
    setNoticeMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/billing/portal", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {})
        }
      });
      
      const data = await res.json();
      const portalUrl = data.url || customerPortalUrl || "https://app.lemonsqueezy.com/my-orders";
      window.open(portalUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      console.error("Portal error:", err);
      setNoticeMsg("Unable to open billing portal. Please try again.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const isYearly = billingInterval === "yearly" || billingInterval === "annual";
  const intervalLabel = isYearly ? "Yearly" : "Monthly";

  const formattedPlanName =
    isSuperAdmin
      ? "Super Admin Access (Unrestricted Pro)"
      : activePlan === "pro"
      ? `Pro Growth Plan (${intervalLabel})`
      : activePlan === "personal"
      ? `Personal Creator Plan (${intervalLabel})`
      : activePlan === "business"
      ? `Business Agency Plan (${intervalLabel})`
      : "Starter Free Plan";

  const activePlanPrice = isSuperAdmin
    ? "$0 / month (Admin)"
    : activePlan === "pro"
    ? isYearly ? "$12 / mo ($144/yr)" : "$15 / month"
    : activePlan === "personal"
    ? isYearly ? "$6 / mo ($72/yr)" : "$8 / month"
    : activePlan === "business"
    ? isYearly ? "$29 / mo ($348/yr)" : "$35 / month"
    : "$0 / month";

  const remainingDays = getRemainingTrialDays(trialEndsAt);

  const getNextRenewalDate = () => {
    if (subscriptionStatus === "trialing" && trialEndsAt) {
      return `Trial ends in ${remainingDays} ${remainingDays === 1 ? "day" : "days"}`;
    }
    if (nextBillingAt) {
      return `Renews on ${new Date(nextBillingAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (trialEndsAt) {
      return `Renews on ${new Date(trialEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (activePlan !== "free" || isSuperAdmin) {
      const baseDate = subscriptionStartAt
        ? new Date(subscriptionStartAt)
        : profileUpdatedAt
        ? new Date(profileUpdatedAt)
        : new Date();
      
      const renewDate = new Date(baseDate.getTime());
      if (isYearly) {
        renewDate.setFullYear(renewDate.getFullYear() + 1);
      } else {
        renewDate.setMonth(renewDate.getMonth() + 1);
      }
      
      while (renewDate.getTime() < Date.now()) {
        if (isYearly) {
          renewDate.setFullYear(renewDate.getFullYear() + 1);
        } else {
          renewDate.setMonth(renewDate.getMonth() + 1);
        }
      }
      
      return `Renews on ${renewDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "Free Forever";
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">Settings &amp; Billing Management</h2>
        </div>
        <p className="text-xs font-semibold text-zinc-500">
          Manage your FeedM.ee subscription, active plan entitlements, payment receipts, and customer billing portal.
        </p>
      </div>

      {/* Notice Notification Banner */}
      {noticeMsg && (
        <div className="bg-zinc-900 text-white rounded-2xl p-4 text-xs font-bold shadow-md flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{noticeMsg}</span>
          </div>
          <button
            onClick={() => setNoticeMsg(null)}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: Current Active Subscription Card */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-2xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                activePlan !== "free" || isSuperAdmin
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
              }`}
            >
              {activePlan !== "free" || isSuperAdmin ? (
                <Zap className="h-6 w-6 fill-current" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black text-zinc-900">{formattedPlanName}</span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                    isSuperAdmin
                      ? "bg-purple-100 text-purple-800 border-purple-200"
                      : subscriptionStatus === "active" || subscriptionStatus === "paid"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : subscriptionStatus === "trialing"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  {isSuperAdmin ? "Super Admin" : subscriptionStatus}
                </span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80">
                  {activePlanPrice}
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-500 mt-1">
                {isSuperAdmin
                  ? "Bypass mode active • Unrestricted full access to all features"
                  : activePlan === "pro"
                  ? "Growth toolkit • Unlimited leads & full analytics suite"
                  : activePlan === "personal"
                  ? "Personal creator toolkit • 3 Video reels & custom domain"
                  : "Basic Features & Limited Slots"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {activePlan === "free" && !isSuperAdmin ? (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                <span>Upgrade Plan</span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setShowChangePlanModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 text-emerald-200" />
                  <span>Change Plan</span>
                </Button>
                <Button
                  onClick={handleOpenLemonPortal}
                  disabled={loadingPortal}
                  variant="outline"
                  className="border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto h-9"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{loadingPortal ? "Opening Portal..." : "Manage Subscription"}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Subscription Info & Renewals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50/80 rounded-2xl p-4 border border-zinc-200/60">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider font-mono">Payment Method</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                {cardBrand && cardLastFour
                  ? `${cardBrand.toUpperCase()} ending in ${cardLastFour}`
                  : activePlan !== "free" || isSuperAdmin
                  ? "Card on File via Lemon Squeezy"
                  : "No Card Required (Free)"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
              {subscriptionStatus === "trialing" ? "Trial Days Left" : "Renewal / Expiration"}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{getNextRenewalDate()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Payment Status</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                {isSuperAdmin
                  ? "Super Admin Entitlement"
                  : subscriptionStatus === "active" || subscriptionStatus === "paid"
                  ? "Active Subscription"
                  : subscriptionStatus === "trialing"
                  ? "Active Free Trial"
                  : "Account in Good Standing"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={handleOpenLemonPortal}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Self-Serve Billing Portal</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Receipts & Order Portal Action Card */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-700" />
            <h3 className="text-base font-extrabold text-zinc-950">Invoices, Receipts &amp; Payment Portal</h3>
          </div>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
            Secure Checkout
          </span>
        </div>

        <p className="text-xs text-zinc-600 font-medium">
          All subscription invoices, tax receipts, and payment method updates are processed securely via Customer Billing Portal.
        </p>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-zinc-950">Order History &amp; Invoices</h4>
              <p className="text-[11px] text-zinc-500 font-medium">View all receipts and update payment details in 1-click</p>
            </div>
          </div>

          <Button
            onClick={handleOpenLemonPortal}
            className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Orders &amp; Receipts</span>
          </Button>
        </div>
      </div>

      {/* Upgrade Modal Component */}
      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={(open) => setShowUpgradeModal(open)}
        />
      )}
      
      {/* Change Plan Modal Component */}
      {showChangePlanModal && (
        <ChangePlanModal
          open={showChangePlanModal}
          onOpenChange={(open) => setShowChangePlanModal(open)}
        />
      )}
    </div>
  );
}
