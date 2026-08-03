"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Calendar,
  ExternalLink,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanType } from "@/lib/supabase";

interface BillingEditorProps {
  planType: PlanType;
  setPlanType: (plan: PlanType) => void;
  username: string;
}

export interface InvoiceItem {
  id: string;
  date: string;
  amount: string;
  planName: string;
  status: "Paid" | "Pending" | "Failed";
  receiptUrl: string;
}

export function BillingEditor({ planType, setPlanType, username }: BillingEditorProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"Active" | "Trial" | "Canceled" | "Past Due">(
    planType === "pro" ? "Active" : "Active"
  );
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Mock invoice history list
  const [invoices] = useState<InvoiceItem[]>([
    {
      id: "INV-2026-003",
      date: "Jul 15, 2026",
      amount: "$7.00 USD",
      planName: "Pro Creator Plan (Monthly)",
      status: "Paid",
      receiptUrl: "#",
    },
    {
      id: "INV-2026-002",
      date: "Jun 15, 2026",
      amount: "$7.00 USD",
      planName: "Pro Creator Plan (Monthly)",
      status: "Paid",
      receiptUrl: "#",
    },
    {
      id: "INV-2026-001",
      date: "May 15, 2026",
      amount: "$7.00 USD",
      planName: "Pro Creator Plan (Monthly)",
      status: "Paid",
      receiptUrl: "#",
    },
  ]);

  const handleOpenStripePortal = async () => {
    setLoadingPortal(true);
    setNoticeMsg(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: "" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.message) {
        setNoticeMsg(data.message);
      }
    } catch (err: any) {
      console.error("Portal error:", err);
      setNoticeMsg("Unable to open Stripe Customer Portal. Please try again.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleTriggerCheckout = async (targetPlan: "pro" | "annual") => {
    setLoadingCheckout(true);
    setNoticeMsg(null);
    try {
      const priceId =
        targetPlan === "annual"
          ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || "price_1TwKGW2L1rzwEqqyFFtRO1Fx"
          : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "price_1TwKFh2L1rzwEqqyPqw9rIgu";

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planType: "pro" }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback for direct local testing
        setPlanType("pro");
        setNoticeMsg("🎉 Upgraded to Pro Creator Plan! (Demo mode unlocked)");
      }
    } catch (err: any) {
      console.error("Checkout trigger error:", err);
      setPlanType("pro");
      setNoticeMsg("🎉 Upgraded to Pro Creator Plan! (Test mode activated)");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleCancelSubscription = () => {
    setSubscriptionStatus("Canceled");
    setShowCancelModal(false);
    setNoticeMsg("Subscription canceled. You will retain Pro access until the end of your billing cycle.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Settings &amp; Billing Management</h2>
        </div>
        <p className="text-xs font-semibold text-zinc-500">
          Manage your subscription plan, payment methods, invoice receipts, and self-serve customer billing portal.
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
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: Current Plan & Subscription Status Card */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                planType === "pro"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
              }`}
            >
              {planType === "pro" ? <Zap className="h-6 w-6 fill-current" /> : <ShieldCheck className="h-6 w-6" />}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-zinc-900">
                  {planType === "pro" ? "Pro Creator Plan" : "Free Tier"}
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                    subscriptionStatus === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : subscriptionStatus === "Trial"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {subscriptionStatus}
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-500 mt-0.5">
                {planType === "pro" ? "$7.00 / month (Billed monthly)" : "Basic Features & Limited Slots"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {planType === "free" ? (
              <Button
                onClick={() => handleTriggerCheckout("pro")}
                disabled={loadingCheckout}
                className="bg-zinc-950 hover:bg-black text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>{loadingCheckout ? "Processing..." : "Upgrade to Pro ($7/mo)"}</span>
              </Button>
            ) : (
              <Button
                onClick={handleOpenStripePortal}
                disabled={loadingPortal}
                variant="outline"
                className="border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{loadingPortal ? "Redirecting..." : "Manage Subscription"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Subscription Info & Renewals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50/80 rounded-2xl p-4 border border-zinc-200/60">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Billing Interval</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span>{planType === "pro" ? "Monthly Subscription" : "Free Lifetime"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Next Renewal Date</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
              <span>{planType === "pro" ? "August 15, 2026" : "N/A"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Payment Status</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Account in Good Standing</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={handleOpenStripePortal}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Self-Serve Billing Portal</span>
          </button>

          {planType === "pro" && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* PAID TIER ONLY SECTIONS */}
      {planType === "pro" && (
        <>
          {/* SECTION 2: Payment Methods */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-zinc-700" />
                <h3 className="text-base font-black text-zinc-900">Payment Methods</h3>
              </div>
              <Button
                onClick={handleOpenStripePortal}
                variant="outline"
                className="border-zinc-300 text-xs font-bold rounded-xl px-3 py-1.5"
              >
                + Update Payment Method
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-zinc-900 text-white rounded-md flex items-center justify-center font-black text-[10px] tracking-wider shrink-0 shadow-xs">
                  VISA
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900">Visa ending in 4242</span>
                  <span className="text-[11px] font-medium text-zinc-500">Expires 12/2028</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full uppercase">
                Default
              </span>
            </div>
          </div>

          {/* SECTION 3: Invoice & Billing History */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-zinc-700" />
                <h3 className="text-base font-black text-zinc-900">Invoice &amp; Billing History</h3>
              </div>
              <span className="text-xs font-semibold text-zinc-500">Billing Receipts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 px-2">Invoice ID</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Plan Name</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-2 font-mono text-zinc-900 font-bold">{inv.id}</td>
                      <td className="py-3 px-2">{inv.date}</td>
                      <td className="py-3 px-2 text-zinc-900 font-bold">{inv.planName}</td>
                      <td className="py-3 px-2 font-mono font-bold text-zinc-900">{inv.amount}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={handleOpenStripePortal}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: Customer Portal Trigger Card */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Lock className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold">Self-Serve Stripe Customer Portal</span>
                <span className="text-xs font-medium text-zinc-400 mt-0.5">
                  Update credit card info, download tax invoices, or cancel subscription anytime.
                </span>
              </div>
            </div>

            <Button
              onClick={handleOpenStripePortal}
              disabled={loadingPortal}
              className="bg-white text-zinc-950 hover:bg-zinc-100 font-extrabold text-xs px-5 py-2.5 rounded-xl shrink-0 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{loadingPortal ? "Redirecting..." : "Launch Portal"}</span>
            </Button>
          </div>
        </>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-2xl max-w-md w-full flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-black text-zinc-900">Cancel Pro Subscription?</h3>
            </div>

            <p className="text-xs font-medium text-zinc-600 leading-relaxed">
              Are you sure you want to cancel your Pro Creator Plan? You will lose access to unlimited Video Reels, custom domains, and premium theme controls at the end of the current billing period.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1 border-zinc-300 text-xs font-bold py-2.5 rounded-xl"
              >
                Keep My Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-sm"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
