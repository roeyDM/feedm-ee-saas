import React from "react";

interface LogoProps {
  className?: string;
  wordmarkClassName?: string;
  showText?: boolean;
}

export function Logo({ className = "", wordmarkClassName = "text-xl", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img 
        src="/feedm-icon.svg" 
        alt="FeedM.ee Icon"
        className="h-[36px] w-[36px] object-contain shrink-0" 
      />
      {showText && (
        <span className={`font-black text-zinc-950 tracking-tight ${wordmarkClassName}`}>
          FeedM<span className="text-[#00CBB0]">.ee</span>
        </span>
      )}
    </div>
  );
}
