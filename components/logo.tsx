import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  wordmarkClassName?: string;
  showText?: boolean;
}

export function Logo({ className = "", wordmarkClassName = "text-xl text-zinc-950", showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img 
        src="/feedm-icon.svg" 
        alt="FeedM.ee Icon"
        className="h-[36px] w-[36px] object-contain shrink-0" 
      />
      {showText && (
        <span className={cn("font-black tracking-tight", wordmarkClassName)}>
          FeedM<span className="text-[#00CBB0]">.ee</span>
        </span>
      )}
    </div>
  );
}
