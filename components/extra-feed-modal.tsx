"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Sparkles, Plus, CheckCircle2, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExtraFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType?: string;
  userEmail?: string;
  username?: string;
}

export function ExtraFeedModal({
  isOpen,
  onClose,
  planType = "free",
  userEmail = "",
  username = "",
}: ExtraFeedModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isProOrBusiness = planType === "pro" || planType === "business" || planType === "super_admin";

  const VARIANT_MONTHLY = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_EXTRA_FEED_MONTHLY || "1279130";
  const VARIANT_ANNUAL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_EXTRA_FEED_ANNUAL || "1999882";

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const targetVariantId = billingCycle === "annual" ? VARIANT_ANNUAL : VARIANT_MONTHLY;

    try {
      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: targetVariantId,
          userEmail,
          username,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error("[ExtraFeedModal] Checkout Error:", err);
      setErrorMsg(err.message || "Checkout error. Redirecting to pricing...");
      setTimeout(() => {
        window.location.href = `/pricing?variant=${targetVariantId}`;
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-zinc-200 space-y-6 animate-in zoom-in-95 duration-200 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition p-1.5 rounded-full hover:bg-zinc-100 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* CASE A: USER IS ON FREE OR PERSONAL PLAN */}
        {!isProOrBusiness ? (
          <div className="space-y-5 text-center pt-2">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 shadow-sm">
              <Zap className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
                Unlock Additional Feeds
              </h3>
              <p className="text-xs md:text-sm font-medium text-zinc-600 leading-relaxed max-w-sm mx-auto">
                Multiple feeds are available on the <strong>Pro plan</strong>. Upgrade to Pro to manage additional video feeds for your brand or clients.
              </p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Manage multiple custom handle URLs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>3 Video Reels &amp; Lead Capture per Feed</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Remove FeedM.ee branding</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/pricing">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 rounded-xl shadow-md gap-2 cursor-pointer">
                  <span>Upgrade to Pro</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        ) : (
          /* CASE B: USER IS ON PRO / BUSINESS PLAN */
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                  Add Extra Video Feed
                </h3>
                <p className="text-xs font-medium text-zinc-500 leading-snug">
                  Expand your reach. Add a standalone video feed to your Pro account.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Billing Cycle Switcher Toggle */}
            <div className="flex items-center justify-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center",
                  billingCycle === "monthly"
                    ? "bg-white text-zinc-950 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Monthly ($11.99/mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center relative",
                  billingCycle === "annual"
                    ? "bg-white text-zinc-950 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                <span>Annual ($9.99/mo)</span>
                <span className="ml-1 rounded-full bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 uppercase">
                  Save 17%
                </span>
              </button>
            </div>

            {/* Selected Pricing Card */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    {billingCycle === "annual" ? "Annual Feed Add-on" : "Monthly Feed Add-on"}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {billingCycle === "annual" ? "$9.99 / month (billed annually at $119.88)" : "$11.99 / month (cancel anytime)"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-950">
                    {billingCycle === "annual" ? "$9.99" : "$11.99"}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block">/ mo</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-xs text-emerald-900 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>1 Additional Video Feed Handle</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Full Pro features &amp; lead capture included</span>
                </div>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 rounded-xl shadow-md gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="animate-pulse">Preparing Checkout...</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add Extra Feed</span>
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
