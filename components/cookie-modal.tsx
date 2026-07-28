"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CookieModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookieModal({ open, onOpenChange }: CookieModalProps) {
  const [preferences, setPreferences] = useState({
    performance: true,
    functional: true,
    advertising: true,
  });

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem("feedmee_cookie_preferences");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      } catch (e) {
        console.error("Error parsing cookie preferences", e);
      }
    }
  }, [open]);

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem("feedmee_cookie_preferences", JSON.stringify(prefs));
    setPreferences(prefs);
    onOpenChange(false);
  };

  const handleSave = () => {
    savePreferences(preferences);
  };

  const handleAcceptAll = () => {
    savePreferences({
      performance: true,
      functional: true,
      advertising: true,
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      performance: false,
      functional: false,
      advertising: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white p-0 overflow-hidden border-zinc-200">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-100">
          <DialogTitle className="text-xl font-bold text-zinc-900">
            Customize Your Cookie Choices
          </DialogTitle>
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            We use cookies to improve your experience, analyze traffic, and personalize content. 
            You can manage your preferences below.
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
          <CookieToggleItem 
            title="Strictly Necessary Cookies"
            description="Essential for the website to function properly. Cannot be disabled."
            alwaysOn
            checked={true}
            onChange={() => {}}
          />
          <CookieToggleItem 
            title="Performance Cookies"
            description="Helps us understand how visitors interact with the website by collecting reporting information anonymously."
            checked={preferences.performance}
            onChange={(val) => setPreferences({ ...preferences, performance: val })}
          />
          <CookieToggleItem 
            title="Functional Cookies"
            description="Enables the website to provide enhanced functionality and personalization."
            checked={preferences.functional}
            onChange={(val) => setPreferences({ ...preferences, functional: val })}
          />
          <CookieToggleItem 
            title="Advertising Cookies"
            description="Used to deliver advertisements more relevant to you and your interests."
            checked={preferences.advertising}
            onChange={(val) => setPreferences({ ...preferences, advertising: val })}
          />
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row gap-2 justify-end">
          <button 
            onClick={handleRejectAll}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition"
          >
            Reject All
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition"
          >
            Save My Choices
          </button>
          <button 
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-black transition"
          >
            Accept All
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CookieToggleItem({ 
  title, 
  description, 
  alwaysOn = false, 
  checked, 
  onChange 
}: { 
  title: string; 
  description: string; 
  alwaysOn?: boolean; 
  checked: boolean; 
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-bold text-zinc-900">{title}</h4>
        <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      </div>
      <div className="pt-1">
        {alwaysOn ? (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            Always On
          </span>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              checked ? "bg-emerald-500" : "bg-zinc-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                checked ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        )}
      </div>
    </div>
  );
}
