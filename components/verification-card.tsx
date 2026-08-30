"use client";

import React, { useState } from "react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Sparkles, AlertCircle, RefreshCw, TrendingUp, ShieldAlert, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLemonSqueezyCheckoutUrl } from "@/lib/plans-config";
import { supabase } from "@/lib/supabase";

interface VerificationCardProps {
  planType: "free" | "personal" | "pro" | "business";
  isSuperAdmin?: boolean;
  name: string;
  username: string;
  avatarUrl?: string;
  verificationStatus: "UNVERIFIED" | "PAID_PENDING_KYC" | "VERIFIED" | "REJECTED";
  isVerifiedBadgeActive: boolean;
  onStatusChange: (status: "UNVERIFIED" | "PAID_PENDING_KYC" | "VERIFIED" | "REJECTED") => void;
  onBadgeToggle: (active: boolean) => void;
  onUpgradeClick: () => void;
}

export function VerificationCard({
  planType,
  isSuperAdmin = false,
  name,
  username,
  avatarUrl,
  verificationStatus,
  isVerifiedBadgeActive,
  onStatusChange,
  onBadgeToggle,
  onUpgradeClick,
}: VerificationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isProOrSuperAdmin = planType === "pro" || planType === "business" || isSuperAdmin;

  // Handle Lemon Squeezy $14.99 Verification Checkout (Variant ID: 1323098)
  const handleBuyVerification = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isProOrSuperAdmin) {
      alert("The Verified Badge is exclusive to PRO subscribers. Please upgrade your plan.");
      onUpgradeClick();
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const activeUserId = user?.id || "guest";

    // Correct URL structure with mandatory /checkout/
    const storeSlug = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_SLUG || "pay.feedm.ee";
    const variantId = process.env.LEMONSQUEEZY_VARIANT_VERIFICATION_FEE || "1323098";

    let targetUrl = "";
    if (storeSlug.includes(".")) {
      targetUrl = `https://${storeSlug}/checkout/buy/${variantId}?checkout[custom][user_id]=${activeUserId}`;
    } else {
      targetUrl = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=${activeUserId}`;
    }

    console.log("Redirecting to Correct Lemon Checkout URL:", targetUrl);
    window.location.href = targetUrl;
  };

  // Launch Didit KYC Session (Official Didit v3 Endpoint)
  const handleStartKYC = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isProOrSuperAdmin) {
      alert("The Verified Badge is exclusive to PRO subscribers. Please upgrade your plan.");
      onUpgradeClick();
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "6aa990b0-7c2c-4493-9c3e-dd3012ed36c8";
      const res = await fetch("/api/verification/didit/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok || !data.session_url) {
        const errDetail = data.error || JSON.stringify(data);
        alert("Didit Error: " + errDetail);
        setErrorMsg("Didit Error: " + errDetail);
        return;
      }

      window.location.assign(data.session_url);
    } catch (err: any) {
      const netErr = "Network error launching Didit: " + err.message;
      alert(netErr);
      setErrorMsg(netErr);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none flex-1 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden text-left" dir="ltr">
      
      {/* Decorative Light Glow Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Live Preview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        
        {/* Left Info Header */}
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Verified Creator Badge
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed pt-1">
            Stand out, protect your identity, and build instant trust with your audience.
          </p>
        </div>

        {/* Right Live Interactive Hero Preview Card (Light Theme) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 px-5 flex items-center gap-3.5 shadow-xs shrink-0">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/40" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-base">
                {(name || username || "C").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900">{name || "Creator Name"}</span>
              <VerifiedBadge size="md" showTooltip={true} />
            </div>
            <span className="text-xs font-bold text-emerald-700">@{username || "handle"}</span>
          </div>
        </div>

      </div>

      {/* Value Proposition Feature Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50/90 border border-slate-200/80 p-4 sm:p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Identity Protection</span>
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Guard your brand against impersonation.
          </p>
        </div>

        <div className="bg-slate-50/90 border border-slate-200/80 p-4 sm:p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Higher Engagement</span>
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Verified profiles gain higher link clicks and trust.
          </p>
        </div>

        <div className="bg-slate-50/90 border border-slate-200/80 p-4 sm:p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
            <Award className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Exclusive Creator Status</span>
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Official recognition within Feedm.ee.
          </p>
        </div>
      </div>

      {/* Dynamic Action States Container */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        
        {/* STATE 1: FREE / PERSONAL USER (Locked) */}
        {!isProOrSuperAdmin && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Exclusive PRO Feature</h4>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Upgrade to a PRO plan to unlock official identity verification and badge access.
                </p>
              </div>
            </div>
            <Button
              onClick={onUpgradeClick}
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs h-11 px-6 rounded-xl shrink-0 cursor-pointer shadow-sm gap-2"
            >
              <span>Upgrade to PRO to Get Verified</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* STATE 2: PRO USER - UNVERIFIED ($14.99 Purchase CTA - Variant ID 1323098) */}
        {isProOrSuperAdmin && verificationStatus === "UNVERIFIED" && (
          <>
            <div>
              <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Official Identity Verification ($14.99 One-Time)</h4>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Securely confirm your identity via Didit KYC and receive a permanent verified badge for your profile.
              </p>
            </div>
            <Button
              onClick={handleBuyVerification}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-11 px-6 rounded-xl shrink-0 cursor-pointer shadow-sm gap-2"
            >
              {isLoading ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Get Verified ($14.99 One-Time)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        )}

        {/* STATE 3: PRO USER - PAID_PENDING_KYC (Launch Didit Session) */}
        {isProOrSuperAdmin && verificationStatus === "PAID_PENDING_KYC" && (
          <>
            <div>
              <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Payment Confirmed! Complete Identity Check</h4>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Click the button below to upload your legal ID and complete face verification via Didit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleStartKYC}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-11 px-6 rounded-xl shrink-0 cursor-pointer shadow-sm gap-2"
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Start Identity Verification</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onStatusChange("VERIFIED");
                  onBadgeToggle(true);
                }}
                variant="outline"
                className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-[11px] h-11 rounded-xl"
              >
                Fast Approve (Dev)
              </Button>
            </div>
          </>
        )}

        {/* STATE 4: PRO USER - VERIFIED (Badge Active Switch Toggle) */}
        {isProOrSuperAdmin && verificationStatus === "VERIFIED" && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                  <span>Account Verified Successfully!</span>
                  <VerifiedBadge size="sm" />
                </h4>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Your verified badge is active and displayed on your profile and video reels.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-700">Show Verified Badge on Profile &amp; Video Reels</span>
              <button
                type="button"
                onClick={() => onBadgeToggle(!isVerifiedBadgeActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVerifiedBadgeActive ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isVerifiedBadgeActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </>
        )}

      </div>

      {/* Error Message Feedback */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dev Mode Quick State Switcher for Local Preview (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 text-emerald-600" />
            <span>Dev Local State Simulator:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onStatusChange("UNVERIFIED")}
              className={`px-2 py-0.5 rounded border transition ${
                verificationStatus === "UNVERIFIED" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              Unverified
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("PAID_PENDING_KYC")}
              className={`px-2 py-0.5 rounded border transition ${
                verificationStatus === "PAID_PENDING_KYC" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              Paid Pending KYC
            </button>
            <button
              type="button"
              onClick={() => {
                onStatusChange("VERIFIED");
                onBadgeToggle(true);
              }}
              className={`px-2 py-0.5 rounded border transition ${
                verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              Verified Active
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
