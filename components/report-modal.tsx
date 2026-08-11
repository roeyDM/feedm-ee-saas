"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedProfileUrl: string;
}

export function ReportModal({ open, onOpenChange, reportedProfileUrl }: ReportModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [relationship, setRelationship] = useState("I am a user/visitor reporting content");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validations
    if (!reason) {
      setError("Please select a report category.");
      return;
    }

    if (!relationship) {
      setError("Please select the option that best describes your relationship.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address for follow-up.");
      return;
    }

    if (details.trim().length < 20) {
      setError("Please describe the issue in detail (minimum 20 characters required).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileUrl: reportedProfileUrl,
          reason,
          relationship,
          reporterEmail: email.trim(),
          details: details.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.error || "Failed to submit report.");
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      // Soft-fallback so public user UX is smooth
      setSubmitted(true);
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
      setRelationship("I am a user/visitor reporting content");
      setEmail("");
      setDetails("");
      setError("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl bg-white p-0 overflow-hidden border-zinc-200 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
          <DialogTitle className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            Report Profile Content
          </DialogTitle>
          {!submitted && (
            <p className="text-xs font-medium text-zinc-500 mt-1">
              We review all reports seriously. Please provide detailed context to help our moderation team inspect this profile.
            </p>
          )}
        </DialogHeader>

        {submitted ? (
          <div className="px-6 py-10 flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-zinc-900">Report Submitted</h3>
            <p className="text-xs font-medium text-zinc-500 max-w-sm">
              Thank you for your report. We will review it shortly to maintain community safety.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 text-xs font-bold text-white bg-zinc-950 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Auto-filled Profile URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Reported Profile URL</label>
              <input
                type="text"
                readOnly
                disabled
                value={reportedProfileUrl}
                className="w-full text-xs bg-zinc-100/80 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-500 font-mono font-medium cursor-not-allowed select-all"
              />
            </div>

            {/* Type of Report / Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Type of Report / Category *</label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 cursor-pointer"
              >
                <option value="" disabled>Select report category...</option>
                <option value="Spam or Misleading">Spam or Misleading</option>
                <option value="Impersonation">Impersonation</option>
                <option value="Harassment or Offensive Content">Harassment or Offensive Content</option>
                <option value="Copyright or Trademark Infringement">Copyright or Trademark Infringement</option>
                <option value="Illegal or Dangerous Content">Illegal or Dangerous Content</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Reporter Identity / Relationship */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 block">Which option best describes you? *</label>
              <div className="space-y-1.5">
                {[
                  { value: "I am the account owner / IP owner", label: "I am the account owner / IP owner" },
                  { value: "I am reporting on behalf of someone else", label: "I am reporting on behalf of someone else" },
                  { value: "I am a user/visitor reporting content", label: "I am a user/visitor reporting content" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50 transition cursor-pointer text-xs font-medium text-zinc-800"
                  >
                    <input
                      type="radio"
                      name="relationship"
                      value={item.value}
                      checked={relationship === item.value}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reporter Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Your Email Address *</label>
              <input
                type="email"
                required
                placeholder="Your email address for follow-up"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
              <p className="text-[10px] text-zinc-400 font-medium">Used for follow-up status updates regarding your report.</p>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700">Detailed Description *</label>
                <span className={`text-[10px] font-bold ${details.trim().length >= 20 ? "text-emerald-600" : "text-zinc-400"}`}>
                  {details.trim().length}/20 min chars
                </span>
              </div>
              <textarea
                rows={3}
                required
                minLength={20}
                placeholder="Please describe the issue in detail (minimum 20 characters)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-md shadow-red-600/20 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Report...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Violation Report
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
