"use client";

import React, { useState } from "react";
import { Zap, Check, X, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  onActivateTrial?: () => void;
}

export function UpgradeModal({
  open,
  onOpenChange,
  title = "Upgrade to Pro",
  subtitle = "Unlock 3 Vertical Video Reels, Page 5 Lead Form, Custom Domain, and White-Label Branding.",
  onActivateTrial,
}: UpgradeModalProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const monthlyVariantId =
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID ||
    process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY ||
    process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID ||
    "1996077";
  const yearlyVariantId =
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID ||
    process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY ||
    process.env.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID ||
    "1996078";

  const handleUpgrade = async () => {
    setIsCheckoutLoading(true);
    setErrorMsg(null);
    const selectedVariantId = billingInterval === "yearly" ? yearlyVariantId : monthlyVariantId;

    try {
      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariantId, planType: "pro" }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      } else {
        const errorDetail = data?.error || "Unable to start checkout session. Please contact support if this persists.";
        setErrorMsg(errorDetail);
      }
    } catch (err: any) {
      console.error("[Checkout Exception]:", err);
      setErrorMsg("Unable to connect to checkout service. Please check your connection and try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-zinc-200 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full p-2 transition cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon Header */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-emerald-400 shadow-xl shadow-zinc-950/10 mb-4 relative">
          <Zap className="h-7 w-7 stroke-[2.5] fill-current" />
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-zinc-600 mt-2 leading-relaxed">
          {subtitle}
        </p>

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="w-full mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 text-left animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Clean Monthly / Yearly Toggle Switch */}
        <div className="my-5 flex items-center justify-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80 w-full">
          <button
            type="button"
            onClick={() => setBillingInterval("monthly")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
              billingInterval === "monthly"
                ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/60"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Monthly ($15/mo)
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval("yearly")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              billingInterval === "yearly"
                ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/60"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <span>Yearly ($12/mo)</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded-md">
              Save 20%
            </span>
          </button>
        </div>

        {/* Pro Feature Checklist */}
        <div className="mb-5 w-full rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4 text-left">
          <span className="text-[11px] font-black text-zinc-800 uppercase tracking-wider block mb-2.5">
            Included in Pro Plan:
          </span>
          <ul className="space-y-2 text-xs font-semibold text-zinc-700">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>3 Vertical Video Reels (Pages 2–4)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Unlimited Lead Capture &amp; CRM Export</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Marketing Pixels (Meta, TikTok, Google)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>100% White-Label Branding Removal</span>
            </li>
          </ul>
        </div>

        {/* Primary CTA Button */}
        <Button
          onClick={handleUpgrade}
          disabled={isCheckoutLoading}
          className="w-full h-12 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 cursor-pointer gap-2 transition hover:scale-[1.01]"
        >
          {isCheckoutLoading ? (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin" /> Redirecting to Checkout...
            </span>
          ) : (
            <>
              <span>
                {billingInterval === "yearly"
                  ? "Upgrade to Pro — $12/mo ($144/yr)"
                  : "Upgrade to Pro — $15/mo"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {/* Secondary CTA: Continue with Free Plan */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="w-full mt-2.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
        >
          Continue with Free Plan
        </button>

        {/* Trust Guarantee Micro-copy */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Secure Checkout powered by Lemon Squeezy</span>
        </div>
      </div>
    </div>
  );
}
