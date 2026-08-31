"use client";

import React, { useState } from "react";
import { X, Mail, CheckCircle2, Send, HelpCircle } from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

export function SupportModal({ isOpen, onClose, defaultSubject = "" }: SupportModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject || "General Support Query");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    // Construct mailto fallback link for direct mail client dispatch
    const mailtoUrl = `mailto:support@feedm.ee?subject=${encodeURIComponent(
      `[Help Center] ${subject} - ${name || "Creator"}`
    )}&body=${encodeURIComponent(`From: ${name} (${email})\n\nMessage:\n${message}`)}`;

    window.open(mailtoUrl, "_blank");
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setName("");
    setEmail("");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative text-left text-slate-900 animate-in zoom-in-95 duration-200"
        dir="ltr"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Contact Feedm.ee Support</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                How can we assist you?
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Send us your message and our team will get back to you promptly.
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Topic / Category</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                >
                  <option value="General Support Query">General Support Query</option>
                  <option value="Didit KYC Verification">Didit KYC Verification</option>
                  <option value="Lemon Squeezy Billing">Lemon Squeezy Billing</option>
                  <option value="Design & Themes">Design &amp; Themes</option>
                  <option value="Video Reels & Media">Video Reels &amp; Media</option>
                  <option value="Analytics & Pixels">Analytics &amp; Pixels</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message Detail</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Message Dispatched!</h3>
            <p className="text-xs font-medium text-slate-600 max-w-xs mx-auto">
              Your support inquiry has been prepared for support@feedm.ee. Our engineering team will review it shortly.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
