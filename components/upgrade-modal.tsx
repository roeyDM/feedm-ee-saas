"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Check, X, ArrowRight, ShieldCheck, Lock, Unlock, Sparkles, CheckCircle2 } from "lucide-react";
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
  title = "Unlock Pro Features 🚀",
  subtitle = "Get 3 Vertical Video Reels, Lead Capture, and Remove Branding.",
  onActivateTrial,
}: UpgradeModalProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  if (!open) return null;

  const handleActivate = () => {
    setIsActivating(true);

    // Save offline trial session state to localStorage
    if (typeof window !== "undefined") {
      const trialEndDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now
      localStorage.setItem("feedmee_subscription_tier", "pro");
      localStorage.setItem("feedmee_trial_active", "true");
      localStorage.setItem("feedmee_trial_end", String(trialEndDate));
    }

    setTimeout(() => {
      setIsActivating(false);
      setActivated(true);

      if (onActivateTrial) {
        onActivateTrial();
      }

      // Automatically close modal after 1.5s
      setTimeout(() => {
        setActivated(false);
        onOpenChange(false);
      }, 1500);
    }, 600);
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

        {activated ? (
          /* Real-time Lock Unlock Animation & Confetti Feedback State */
          <div className="py-6 flex flex-col items-center animate-in zoom-in-90 duration-300">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 mb-4 animate-bounce">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-300 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
              Pro Trial Unlocked! 🚀
            </h3>
            <p className="text-xs font-bold text-emerald-700 mt-2 max-w-xs leading-relaxed bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              ✨ 3 Video Reels, Lead Forms & White-Label Branding are now fully active!
            </p>
          </div>
        ) : (
          /* Normal Upgrade Modal Form */
          <>
            {/* Icon Header */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 mb-4 relative">
              {isActivating ? (
                <Unlock className="h-8 w-8 stroke-[2.5] animate-pulse" />
              ) : (
                <Zap className="h-8 w-8 stroke-[2.5] fill-current" />
              )}
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-2 leading-relaxed">
              {subtitle}
            </p>

            {/* Pro Feature Checklist */}
            <div className="my-5 w-full rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 text-left">
              <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider block mb-2.5">
                Included in 7-Day Free Trial:
              </span>
              <ul className="space-y-2 text-xs font-bold text-zinc-800">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>3 Vertical Video Reels (Pages 2–4)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Page 5 Built-in Lead Capture Form</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>100% White-label (Remove FeedM.ee Branding)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Custom Domain Integration</span>
                </li>
              </ul>
            </div>

            {/* Offline Mock Activate Trial Button */}
            <Button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full h-12 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 cursor-pointer gap-2 transition hover:scale-[1.01]"
            >
              {isActivating ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" /> Unlocking Pro Features...
                </span>
              ) : (
                <>
                  <span>Activate 7-Day Free Trial (No Card Needed)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Trust Guarantee Micro-copy */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Offline Instant Mock Trial • No credit card required</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
