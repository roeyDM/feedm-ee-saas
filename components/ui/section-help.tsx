"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";

interface SectionHelpProps {
  text: string;
}

export function SectionHelp({ text }: SectionHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 260;
      let left = rect.left + rect.width / 2 - popoverWidth / 2;
      if (left < 16) left = 16;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }
      setCoords({
        top: rect.top,
        left: left,
      });
    }
  };

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => setIsOpen(false);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <span className="inline-flex items-center ml-1.5 align-middle">
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePopover}
        aria-label="Help info"
        className="p-0.5 rounded-full text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer focus:outline-none"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && mounted && coords && createPortal(
        <div className="fixed inset-0 z-[9999] pointer-events-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          {/* Popover Card */}
          <div
            style={{
              position: "fixed",
              top: Math.max(12, coords.top - 8),
              left: coords.left,
              transform: "translateY(-100%)",
            }}
            className="w-[260px] bg-slate-900 text-slate-100 text-xs font-medium p-3 rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-[10000] pointer-events-auto"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="leading-relaxed text-slate-200">{text}</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded-lg shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
