"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface DowngradeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTier: "free" | "personal" | "pro";
  currentTier: string;
  onConfirmed: () => void;
}

export function DowngradeConfirmDialog({
  open,
  onOpenChange,
  targetTier,
  currentTier,
  onConfirmed
}: DowngradeConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirmDowngrade = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ action: "downgrade", targetPlan: targetTier, userId: session?.user?.id }),
      });
      if (!res.ok) {
        throw new Error("Failed to process downgrade request");
      }
      onConfirmed();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" onClick={() => onOpenChange(false)}>
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-zinc-950">Confirm Downgrade</h2>
          <p className="text-sm text-zinc-500 font-medium mt-2">
            Are you sure you want to downgrade from <strong>{currentTier.toUpperCase()}</strong> to <strong>{targetTier.toUpperCase()}</strong>?
          </p>
        </div>

        <div className="p-6 bg-zinc-50 flex flex-col gap-4">
          <div className="text-sm text-zinc-700 font-medium">
            Upon your next billing cycle, you will lose access to:
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-zinc-600">
              <CheckCircle2 className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <span>Features specific to your current tier (e.g. advanced analytics, verified badge)</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-zinc-600">
              <CheckCircle2 className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <span>Your plan will remain active until the end of your current billing cycle.</span>
            </li>
          </ul>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl mt-2 border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleConfirmDowngrade}
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-zinc-900 shadow-sm"
            >
              {isSubmitting ? "Processing..." : "Yes, Downgrade My Plan"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              variant="outline"
              className="w-full h-10 rounded-xl font-bold text-xs border-zinc-200 text-zinc-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
