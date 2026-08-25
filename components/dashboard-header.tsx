"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Zap, Sparkles, ArrowRight, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanType } from "@/lib/supabase";
import { getRemainingTrialDays } from "@/lib/auth-guards";
import { Logo } from "@/components/logo";

interface DashboardHeaderProps {
  username: string;
  planType?: PlanType;
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
  onSave?: () => void;
  isSaving?: boolean;
  onUpgradeClick?: () => void;
}

export function DashboardHeader({
  username,
  planType = "free",
  subscriptionStatus,
  trialEndsAt,
  onSave,
  isSaving = false,
  onUpgradeClick,
}: DashboardHeaderProps) {
  const remainingDays = getRemainingTrialDays(trialEndsAt);
  const isTrialActive = planType !== "free" && (subscriptionStatus === "trialing" || remainingDays > 0);
  const trialText = remainingDays > 1 ? `PRO TRIAL (${remainingDays} Days Left)` : remainingDays === 1 ? "PRO TRIAL (1 Day Left)" : "PRO TRIAL (Ends Today)";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between pl-4 lg:pl-6 pr-4 lg:pr-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
            <Logo showText={false} />
          </Link>
        </div>

        {/* Dynamic Status / Trial Bar in Top Header */}
        <div className="flex-1 flex justify-center px-4">
          {planType === "free" ? (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="group cursor-pointer bg-transparent border-0 p-0 text-left"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> 
                <span className="hidden sm:inline">Remove branding &amp; unlock advanced analytics.</span>
                <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">Upgrade to Personal</span>
                <ArrowRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ) : planType === "personal" ? (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="group cursor-pointer bg-transparent border-0 p-0 text-left"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> 
                <span className="hidden sm:inline">Unlock Marketing Pixels, Leads CRM &amp; Video Storage.</span>
                <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">Upgrade to Pro</span>
                <ArrowRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ) : planType === "pro" ? (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="group cursor-pointer bg-transparent border-0 p-0 text-left"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 hover:border-teal-500/30 transition-all">
                <Building2 className="h-3.5 w-3.5 text-teal-400" /> 
                <span className="hidden sm:inline">Need multi-account management &amp; custom domain integration?</span>
                <span className="font-bold text-white group-hover:text-teal-200 transition-colors">Upgrade to Business</span>
                <ArrowRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ) : isTrialActive ? (
            <div className="inline-flex items-center gap-2.5 rounded-full bg-amber-950/80 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/40 shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span>{trialText}</span>
              <button
                type="button"
                onClick={onUpgradeClick}
                className="rounded bg-amber-400/20 hover:bg-amber-400/30 px-2 py-0.5 text-[9px] font-black uppercase text-amber-200 border border-amber-400/30 shrink-0 cursor-pointer transition-colors"
              >
                Keep Pro
              </button>
            </div>
          ) : null}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link href={`/${username}`} target="_blank" className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition">
            <span>feedm.ee/{username}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
