"use client";

import React, { useState } from "react";
import { Zap, Check, X, ArrowRight, ShieldCheck, Sparkles, AlertCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLemonSqueezyVariantId, buildLemonSqueezyCheckoutUrl } from "@/lib/plans-config";
import { supabase } from "@/lib/supabase";
import { useFeatureAccess } from "@/hooks/use-feature-access";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlan?: "personal" | "pro" | "business";
  title?: string;
  subtitle?: string;
  onActivateTrial?: () => void;
}

export function UpgradeModal({
  open,
  onOpenChange,
  targetPlan = "pro",
  title,
  subtitle,
  onActivateTrial,
}: UpgradeModalProps) {
  const { currentPlan } = useFeatureAccess();
  
  // Deduplicate available cards based on active plan & target feature requirements
  const isTargetProOnly = targetPlan === "pro";
  const showPersonalCard = currentPlan === "free" && !isTargetProOnly;
  const showProCard = (currentPlan === "free" || currentPlan === "personal");
  const showBusinessCard = currentPlan === "pro" || targetPlan === "business";

  const defaultSelected = showPersonalCard ? "personal" : showBusinessCard ? "business" : "pro";
  const [selectedPlan, setSelectedPlan] = useState<"personal" | "pro" | "business">(defaultSelected);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize internal selectedPlan when targetPlan or currentPlan changes
  React.useEffect(() => {
    if (currentPlan === "personal") {
      setSelectedPlan("pro");
    } else if (currentPlan === "pro") {
      setSelectedPlan("business");
    } else if (targetPlan) {
      setSelectedPlan(targetPlan);
    }
  }, [targetPlan, currentPlan]);

  if (!open) return null;

  const isPersonal = selectedPlan === "personal";

  const modalTitle = title || "Explore FeedM.ee Creator Plans";
  const modalSubtitle =
    subtitle ||
    "Upgrade from Free to unlock custom handles, traffic analytics, video reels, and lead capture.";

  const handleUpgrade = async (overridePlan?: "personal" | "pro") => {
    const planToCheckout = overridePlan || selectedPlan;
    setIsCheckoutLoading(true);
    setErrorMsg(null);
    const variantId = getLemonSqueezyVariantId(planToCheckout, billingInterval) || (planToCheckout === "personal" ? "2052878" : "2049606");

    let activeUserId: string | undefined = undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) activeUserId = user.id;

      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          planType: planToCheckout,
          billingInterval,
          userId: user?.id,
          userEmail: user?.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      } else {
        console.warn("[Checkout API Fallback]: Direct redirect to Lemon Squeezy checkout link");
        const fallbackUrl = buildLemonSqueezyCheckoutUrl(variantId, activeUserId, planToCheckout);
        window.location.href = data.url || fallbackUrl;
      }
    } catch (err: any) {
      console.warn("[Checkout API Exception Fallback]: Direct redirect to Lemon Squeezy checkout link", err);
      const fallbackUrl = buildLemonSqueezyCheckoutUrl(variantId, activeUserId, planToCheckout);
      window.location.href = fallbackUrl;
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-zinc-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full p-2 transition cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon Header */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-emerald-400 shadow-xl shadow-zinc-950/10 mb-3 relative shrink-0">
          <Sparkles className="h-7 w-7 stroke-[2.5]" />
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
          {modalTitle}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-zinc-600 mt-1.5 leading-relaxed max-w-md">
          {modalSubtitle}
        </p>

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="w-full mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 text-left animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Clean Monthly / Yearly Toggle Switch */}
        <div className="my-4 flex items-center justify-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setBillingInterval("monthly")}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition cursor-pointer ${
              billingInterval === "monthly"
                ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/60"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval("yearly")}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
              billingInterval === "yearly"
                ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/60"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <span>Yearly</span>
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-md">
              Save 25%
            </span>
          </button>
        </div>

        {/* Side-by-Side Plan Comparison Cards */}
        <div className={`grid grid-cols-1 ${showPersonalCard && showProCard ? "sm:grid-cols-2" : "max-w-md mx-auto"} gap-4 w-full my-2 text-left`}>
          
          {/* PERSONAL PLAN CARD */}
          {showPersonalCard && (
            <div
              onClick={() => setSelectedPlan("personal")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === "personal"
                  ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-md"
                  : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Personal</span>
                  {selectedPlan === "personal" && (
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-black text-zinc-950">
                    {billingInterval === "yearly" ? "$6" : "$8"}
                  </span>
                  <span className="text-xs font-bold text-zinc-500">/ month</span>
                </div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-3">
                  Ideal for creators wanting clean branding &amp; handle.
                </p>

                <ul className="space-y-1.5 text-xs font-semibold text-zinc-700 border-t border-zinc-200/60 pt-2.5">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Custom Feed Handle URL</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Traffic &amp; Click Analytics</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Remove FeedM.ee Branding</span>
                  </li>
                </ul>
              </div>

              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan("personal");
                  handleUpgrade("personal");
                }}
                disabled={isCheckoutLoading}
                className="w-full mt-4 h-9 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm cursor-pointer gap-1"
              >
                <span>Upgrade to Personal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* PRO PLAN CARD */}
          {showProCard && (
            <div
              onClick={() => setSelectedPlan("pro")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                selectedPlan === "pro"
                  ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/30 shadow-md"
                  : "border-emerald-300 bg-white hover:border-emerald-400 shadow-xs"
              }`}
            >
              {/* Recommended Badge */}
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                Most Popular ⭐
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Pro Growth</span>
                  {selectedPlan === "pro" && (
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-black text-zinc-950">
                    {billingInterval === "yearly" ? "$12" : "$15"}
                  </span>
                  <span className="text-xs font-bold text-zinc-500">/ month</span>
                </div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-3">
                  For serious creators &amp; visual brands.
                </p>

                <ul className="space-y-1.5 text-xs font-semibold text-zinc-700 border-t border-zinc-200/60 pt-2.5">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Everything in Personal +</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>3 Vertical Video Reels</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Lead Form &amp; CRM Export</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Meta, TikTok &amp; Google Pixels</span>
                  </li>
                </ul>
              </div>

              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan("pro");
                  handleUpgrade("pro");
                }}
                disabled={isCheckoutLoading}
                className="w-full mt-4 h-9 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 cursor-pointer gap-1"
              >
                <span>Upgrade to Pro 🚀</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

        </div>

        {/* Secondary CTA: Continue with Current Plan */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="w-full mt-2 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
        >
          {currentPlan === "personal"
            ? "Continue with Personal Plan"
            : currentPlan === "pro"
            ? "Continue with Pro Plan"
            : currentPlan === "business"
            ? "Continue with Business Plan"
            : "Continue with Free Plan"}
        </button>

        {/* Trust Guarantee Micro-copy */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Secure Checkout powered by Lemon Squeezy</span>
        </div>
      </div>
    </div>
  );
}
