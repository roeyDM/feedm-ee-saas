"use client";

import React, { useState } from "react";
import { Zap, Check, X, ArrowRight, ShieldCheck, CreditCard, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLemonSqueezyVariantId, buildLemonSqueezyCheckoutUrl } from "@/lib/plans-config";
import { supabase } from "@/lib/supabase";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { DowngradeConfirmDialog } from "@/components/downgrade-confirm-dialog";

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePlanModal({ open, onOpenChange }: ChangePlanModalProps) {
  const { currentPlan } = useFeatureAccess();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [downgradeTarget, setDowngradeTarget] = useState<"free" | "personal" | "pro">("free");

  if (!open) return null;

  const planTiers = [
    {
      id: "free",
      name: "Starter Free",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      yearlyNote: "Free forever",
      monthlyNote: "Free forever",
      level: 0,
      description: "Essential tools for launching your personal feed link.",
      features: [
        "Basic Bio Link",
        "Standard Analytics",
        "Up to 5 Links",
      ],
    },
    {
      id: "personal",
      name: "Personal",
      monthlyPrice: "$8",
      yearlyPrice: "$6",
      yearlyNote: "Billed annually at $72/yr",
      monthlyNote: "Billed monthly at $8/mo",
      level: 1,
      description: "For creators ready to remove branding and elevate style.",
      features: [
        "Remove Watermark",
        "Video Reels",
        "Custom Themes & Fonts",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: "$15",
      yearlyPrice: "$12",
      yearlyNote: "Billed annually at $144/yr",
      monthlyNote: "Billed monthly at $15/mo",
      level: 2,
      popular: true,
      description: "High-octane growth tools, verified badge & lead capture.",
      features: [
        "Verified Badge",
        "Lead Capture CRM",
        "Marketing Pixels",
        "Priority Support",
      ],
    },
    {
      id: "business",
      name: "Business",
      monthlyPrice: "$35",
      yearlyPrice: "$29",
      yearlyNote: "Billed annually at $348/yr",
      monthlyNote: "Billed monthly at $35/mo",
      level: 3,
      description: "Multi-seat management & dedicated scale infrastructure.",
      features: [
        "Dedicated Account Support",
        "High Limits",
        "Custom Analytics & Branding",
      ],
    },
  ];

  const currentLevel = planTiers.find((p) => p.id === currentPlan)?.level || 0;

  const handleUpgrade = async (targetPlan: "personal" | "pro" | "business") => {
    setIsCheckoutLoading(true);
    const variantId =
      getLemonSqueezyVariantId(targetPlan, billingCycle) ||
      (targetPlan === "personal"
        ? billingCycle === "yearly" ? "2052896" : "2052878"
        : targetPlan === "pro"
        ? billingCycle === "yearly" ? "2049607" : "2049606"
        : billingCycle === "yearly" ? "1996084" : "1996082");

    let activeUserId: string | undefined = undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) activeUserId = user.id;

      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          planType: targetPlan,
          billingInterval: billingCycle,
          userId: user?.id,
          userEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      } else {
        const fallbackUrl = buildLemonSqueezyCheckoutUrl(variantId, activeUserId, targetPlan);
        window.location.href = fallbackUrl;
      }
    } catch (err) {
      const fallbackUrl = buildLemonSqueezyCheckoutUrl(variantId, activeUserId, targetPlan);
      window.location.href = fallbackUrl;
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleActionClick = (targetId: string, targetLevel: number) => {
    if (targetLevel > currentLevel) {
      handleUpgrade(targetId as "personal" | "pro" | "business");
    } else if (targetLevel < currentLevel) {
      setDowngradeTarget(targetId as "free" | "personal" | "pro");
      setShowDowngradeDialog(true);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
        onClick={() => onOpenChange(false)}
      >
        <div 
          className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="p-6 sm:px-8 sm:py-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                    Change Your Subscription Plan
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Upgrade to unlock growth features or switch tiers seamlessly.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-center sm:self-auto">
              {/* Billing Cycle Toggle */}
              <div className="flex items-center bg-zinc-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    billingCycle === "monthly"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <span>Yearly</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Save up to 25%
                  </span>
                </button>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="p-6 sm:p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {planTiers.map((tier) => {
                const isCurrent = tier.id === currentPlan;
                const isUpgrade = tier.level > currentLevel;
                const isDowngrade = tier.level < currentLevel;
                const price = billingCycle === "yearly" ? tier.yearlyPrice : tier.monthlyPrice;
                const note = billingCycle === "yearly" ? tier.yearlyNote : tier.monthlyNote;

                return (
                  <div 
                    key={tier.id}
                    className={`flex flex-col p-5 rounded-2xl border transition-all relative ${
                      isCurrent 
                        ? "border-emerald-500 bg-emerald-50/40 shadow-lg ring-2 ring-emerald-500/30" 
                        : tier.popular
                        ? "border-teal-400 bg-white shadow-md ring-1 ring-teal-300/40"
                        : "border-zinc-200 bg-white hover:border-zinc-300 shadow-xs"
                    }`}
                  >
                    {/* Top Badges */}
                    {isCurrent ? (
                      <div className="mb-3 inline-flex self-start items-center gap-1 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>YOUR ACTIVE PLAN</span>
                      </div>
                    ) : tier.popular ? (
                      <div className="mb-3 inline-flex self-start items-center gap-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>Most Popular</span>
                      </div>
                    ) : (
                      <div className="mb-3 h-5" />
                    )}
                    
                    <div className="mb-3">
                      <h3 className="text-base font-black text-zinc-900 tracking-tight">{tier.name}</h3>
                      <p className="text-[11px] text-zinc-500 font-medium mt-0.5 line-clamp-2 min-h-[32px]">
                        {tier.description}
                      </p>
                    </div>

                    <div className="mb-4 pb-3 border-b border-zinc-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-zinc-950 tracking-tight">{price}</span>
                        {price !== "$0" && (
                          <span className="text-xs font-semibold text-zinc-500">/mo</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 block mt-0.5">
                        {note}
                      </span>
                    </div>

                    {/* Features List */}
                    <div className="flex-1 mb-6">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2.5">
                        Key Features:
                      </div>
                      <ul className="space-y-2">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs font-medium text-zinc-700 leading-snug">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <Button
                      disabled={isCurrent || isCheckoutLoading}
                      onClick={() => handleActionClick(tier.id, tier.level)}
                      className={`w-full mt-auto rounded-xl font-bold text-xs h-10 transition-all cursor-pointer ${
                        isCurrent 
                          ? "bg-zinc-200 text-zinc-500 cursor-not-allowed border border-zinc-200" 
                          : isUpgrade
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md"
                            : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {isCurrent 
                        ? "Current Plan" 
                        : isUpgrade
                          ? `Upgrade to ${tier.name}`
                          : `Downgrade to ${tier.name}`
                      }
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Assistance */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure payment encryption handled by Lemon Squeezy.
            </span>
            <span className="text-[11px] font-medium text-zinc-400">
              Need custom volume? <a href="mailto:sales@feedm.ee" className="text-emerald-700 font-bold hover:underline">Contact Enterprise Support</a>
            </span>
          </div>
        </div>
      </div>

      <DowngradeConfirmDialog 
        open={showDowngradeDialog} 
        onOpenChange={setShowDowngradeDialog}
        targetTier={downgradeTarget}
        currentTier={currentPlan as string}
        onConfirmed={() => {
          setShowDowngradeDialog(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
