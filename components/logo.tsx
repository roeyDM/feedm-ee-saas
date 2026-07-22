import React from "react";
import { Play } from "lucide-react";

interface LogoProps {
  className?: string;
  wordmarkClassName?: string;
}

export function Logo({ className = "", wordmarkClassName = "text-xl" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-[32px] w-[40px] items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-md shadow-emerald-500/20">
        <Play className="h-4 w-4 text-white fill-white ml-0.5" />
      </div>
      <span className={`font-black text-zinc-950 tracking-tight ${wordmarkClassName}`}>
        FeedM<span className="text-emerald-600">.ee</span>
      </span>
    </div>
  );
}
