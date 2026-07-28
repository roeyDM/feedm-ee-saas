"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedProfileUrl: string;
}

export function ReportModal({ open, onOpenChange, reportedProfileUrl }: ReportModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason for reporting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: supabaseError } = await supabase.from("reports").insert([
        {
          profile_url: reportedProfileUrl,
          reason,
          reporter_email: email || null,
          details: details || null,
        },
      ]);

      if (supabaseError) throw supabaseError;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      // Fallback in case table doesn't exist or RLS blocks it (just show success to user for UX, or log it)
      // Usually you'd show the error, but if we don't know the exact schema, we might soft fail.
      setError(err.message || "Failed to submit report. Please try again later.");
      // Just simulate success if we want for now:
      // setSubmitted(true); 
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after closing animation
    setTimeout(() => {
      setSubmitted(false);
      setReason("");
      setEmail("");
      setDetails("");
      setError("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white p-0 overflow-hidden border-zinc-200">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-100">
          <DialogTitle className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Report Profile
          </DialogTitle>
          {!submitted && (
            <p className="text-sm text-zinc-500 mt-2">
              Please let us know why you are reporting this profile. We review all reports seriously.
            </p>
          )}
        </DialogHeader>

        {submitted ? (
          <div className="px-6 py-10 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-zinc-900">Report Submitted</h3>
            <p className="text-sm text-zinc-500 mt-2">
              Thank you for keeping our community safe. Our team will review your report shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-black transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Profile URL being reported</label>
              <input
                type="text"
                disabled
                value={reportedProfileUrl}
                className="w-full text-xs bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Reason for Report *</label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="" disabled>Select a reason...</option>
                <option value="Spam">Spam or Misleading</option>
                <option value="Intellectual Property">Intellectual Property / Copyright</option>
                <option value="Harassment">Harassment or Dangerous Content</option>
                <option value="Impersonation">Impersonation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Your Email (Optional)</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <p className="text-[10px] text-zinc-500">In case we need to follow up.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Additional Details</label>
              <textarea
                rows={3}
                placeholder="Please provide any extra context..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>

            {error && (
              <div className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
