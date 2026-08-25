"use client";

import React, { useState } from "react";
import { X, Building2, Send, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  username?: string;
}

export function BusinessContactModal({
  open,
  onOpenChange,
  userEmail = "",
  username = "",
}: BusinessContactModalProps) {
  const [name, setName] = useState(username || "");
  const [email, setEmail] = useState(userEmail || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feed_user_id: username || "business_inquiry",
          name: name || "Business Interest",
          email,
          notes: `[Business Plan Early Access Request] ${message}`,
        }),
      }).catch(() => {});

      setIsSubmitted(true);
    } catch (err) {
      console.error("[BusinessContactModal Error]:", err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-zinc-200 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            onOpenChange(false);
            setIsSubmitted(false);
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full p-2 transition cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {isSubmitted ? (
          <div className="py-6 space-y-4 w-full">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              Request Received!
            </h3>
            <p className="text-xs sm:text-sm font-medium text-zinc-600 leading-relaxed">
              Our enterprise team will reach out to <strong>{email}</strong> shortly to set up your Business account.
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                setIsSubmitted(false);
              }}
              className="w-full h-11 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer mt-2"
            >
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <div className="w-full text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 border border-teal-200 shadow-sm shrink-0">
                <Building2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                  Upgrade to Business
                </h3>
                <span className="inline-block bg-teal-100 text-teal-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border border-teal-200">
                  Early Access
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-teal-950 text-xs font-semibold leading-relaxed">
              Business plans are currently in early access. Contact us to set up your account.
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Name / Company</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name or Company Name"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">How many feeds or team members do you need?</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. 5 feeds for client accounts..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer gap-2 transition"
              >
                {isSubmitting ? (
                  <span>Sending Request...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Contact Sales</span>
                  </>
                )}
              </Button>
            </form>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <Shield className="h-3.5 w-3.5 text-teal-600" />
              <span>Dedicated Account Manager &amp; Custom SLA</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
