"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogoIconOnly } from "@/components/logo";
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const getURL = () => {
        let url =
          process?.env?.NEXT_PUBLIC_SITE_URL ??
          process?.env?.NEXT_PUBLIC_VERCEL_URL ??
          "https://feedm.ee";
        url = url.includes("http") ? url : `https://${url}`;
        url = url.endsWith("/") ? url : `${url}/`;
        return `${url}reset-password`;
      };

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getURL(),
      });

      if (resetErr) {
        if (resetErr.message?.toLowerCase().includes("rate limit")) {
          setError("Email rate limit reached. Please wait a few minutes before trying again.");
        } else {
          setError(resetErr.message);
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-2 relative select-none">
      <div className="pointer-events-none absolute top-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[120px]" />

      <div className="relative w-full max-w-sm my-auto">
        <div className="mb-4 flex flex-col items-center text-center">
          <Link href="/" className="mb-2 flex items-center justify-center p-1.5 rounded-2xl bg-white shadow-sm border border-zinc-200/80 hover:scale-105 transition-transform">
            <LogoIconOnly />
          </Link>
          <h1 className="text-xl font-black text-zinc-950 tracking-tight">Reset Your Password</h1>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">
            Enter your account email to receive a password reset link.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 sm:p-6 shadow-xl shadow-zinc-900/5 backdrop-blur-md">
          {success ? (
            <div className="text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Check Your Email</h3>
              <p className="text-xs font-medium text-zinc-600">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Account Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs sm:text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-60 cursor-pointer mt-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Send Reset Link <Send className="h-3.5 w-3.5" /></>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
