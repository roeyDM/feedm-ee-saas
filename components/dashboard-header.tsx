"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Zap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanType } from "@/lib/supabase";

import { Logo } from "@/components/logo";

interface DashboardHeaderProps {
  username: string;
  planType?: PlanType;
  onSave?: () => void;
  isSaving?: boolean;
}

export function DashboardHeader({ username, planType = "free", onSave, isSaving = false }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
            <Logo showText={false} />
          </Link>
        </div>

        {/* Dynamic Announcement / Upsell Bar */}
        <div className="flex-1 flex justify-center px-4">
          <Link href="/pricing" className="group">
            {planType === "free" ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> 
                <span className="hidden sm:inline">Unlock custom domains & analytics.</span>
                <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">Upgrade to Pro</span>
                <ArrowRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            ) : planType === "pro" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/50 px-3 py-1 text-xs font-bold text-zinc-300 border border-zinc-700/50">
                <Zap className="h-3.5 w-3.5 text-emerald-400 fill-current" /> Pro Plan Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/50 px-3 py-1 text-xs font-bold text-cyan-300 border border-zinc-700/50">
                <Zap className="h-3.5 w-3.5 text-cyan-400 fill-current" /> Business Plan
              </span>
            )}
          </Link>
        </div>

        {/* Quick Actions (Save and View Live moved out) */}
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
