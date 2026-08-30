"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export function VerifiedBadge({
  size = "md",
  className,
  showTooltip = true,
}: VerifiedBadgeProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const sizeClasses = {
    sm: "w-5 h-5 min-w-[20px] min-h-[20px]",
    md: "w-6 h-6 min-w-[24px] min-h-[24px]",
    lg: "w-7 h-7 min-w-[28px] min-h-[28px]",
  };

  const pxSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  return (
    <div className="relative shrink-0 inline-flex items-center justify-center overflow-visible group/verified z-20">
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (showTooltip) setIsTooltipOpen(!isTooltipOpen);
        }}
        onMouseEnter={() => showTooltip && setIsTooltipOpen(true)}
        onMouseLeave={() => showTooltip && setIsTooltipOpen(false)}
        className={cn(
          "relative shrink-0 inline-flex items-center justify-center overflow-visible cursor-pointer transition-transform duration-200 hover:scale-105 select-none",
          sizeClasses[size],
          className
        )}
        title="Verified Feedm.ee Creator"
      >
        <img
          src="/verified-badge.svg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/verified-badge.png";
          }}
          alt="Verified Badge"
          width={pxSizes[size]}
          height={pxSizes[size]}
          className="w-full h-full object-contain shrink-0 overflow-visible"
        />
      </div>

      {/* Refactored Mobile & Desktop Tooltip */}
      {showTooltip && isTooltipOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 max-w-[200px] w-max text-center text-xs bg-slate-900 text-emerald-400 border border-emerald-500/30 font-bold rounded-md shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150 flex items-center justify-center gap-1.5 pointer-events-none whitespace-normal break-words">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Verified Feedm.ee Creator</span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-emerald-500/30 rotate-45" />
        </div>
      )}
    </div>
  );
}
