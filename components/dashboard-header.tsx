"use client";

import React from "react";
import Link from "next/link";
import { Film, Eye, ExternalLink, Save, Loader2, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanType } from "@/lib/supabase";

interface DashboardHeaderProps {
  username: string;
  planType?: PlanType;
  onSave?: () => void;
  isSaving?: boolean;
}

export function DashboardHeader({ username, planType = "free", onSave, isSaving = false }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Brand Logo & Plan Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition duration-300">
              <Film className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black text-zinc-950 tracking-tight">
                FeedM<span className="text-emerald-600">.ee</span>
              </span>
              <span className="block text-[10px] font-extrabold text-zinc-400 leading-none">
                Creator Studio
              </span>
            </div>
          </Link>

          {/* Plan Badge */}
          <Link href="/pricing" className="hidden md:inline-block">
            {planType === "free" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800 border border-amber-300 hover:bg-amber-200 transition">
                <Sparkles className="h-3 w-3 text-amber-600" /> Free Plan — Upgrade
              </span>
            ) : planType === "pro" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                <Zap className="h-3 w-3 text-emerald-600 fill-current" /> Pro Plan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-black text-cyan-800 border border-cyan-300">
                <Zap className="h-3 w-3 text-cyan-600 fill-current" /> Business Plan
              </span>
            )}
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="hidden sm:inline-block text-xs font-bold text-zinc-600 hover:text-emerald-600 transition px-2">
            Pricing
          </Link>

          <Link href={`/${username}`} target="_blank" className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition">
            <span>feedm.ee/{username}</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Link>

          {/* Save Button */}
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm gap-1.5 px-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          )}

          <Link href={`/${username}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 text-xs font-bold gap-1.5"
            >
              <Eye className="h-4 w-4" /> View Live
            </Button>
          </Link>
        </div>

      </div>
    </header>
  );
}
