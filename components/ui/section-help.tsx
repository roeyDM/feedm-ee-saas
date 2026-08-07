"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface SectionHelpProps {
  text: string;
}

export function SectionHelp({ text }: SectionHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1.5 align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label="Help info"
        className="p-0.5 rounded-full text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer focus:outline-none"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isOpen && (
        <div 
          className="absolute left-0 bottom-full mb-2 z-50 w-64 bg-slate-900 text-slate-200 text-[11px] font-medium p-2.5 rounded-xl border border-slate-700 shadow-xl animate-in fade-in duration-150 select-none pointer-events-none"
        >
          {text}
        </div>
      )}
    </div>
  );
}
