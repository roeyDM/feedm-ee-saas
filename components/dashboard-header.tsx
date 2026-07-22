"use client";

import React from "react";
import Link from "next/link";
import { Film, Eye, ExternalLink, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  username: string;
  onSave?: () => void;
  isSaving?: boolean;
}

export function DashboardHeader({ username, onSave, isSaving = false }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Brand Logo */}
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

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link href={`/${username}`} target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition">
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
