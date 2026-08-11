"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogoIconOnly } from "@/components/logo";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA Interception State
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if account has 2FA TOTP enabled (via DB profile, user metadata, or Supabase MFA)
    try {
      const user = authData?.user;
      let is2FAActive = false;

      if (user?.user_metadata?.totp_enabled || user?.app_metadata?.totp_enabled) {
        is2FAActive = true;
      }

      const { data: mfaFactors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = mfaFactors?.totp?.find((f) => f.status === "verified");

      if (verifiedFactor) {
        is2FAActive = true;
        setFactorId(verifiedFactor.id);
      }

      if (is2FAActive) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.warn("MFA Check warning:", err);
      router.push("/dashboard");
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      setError("Invalid code. Please try again.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (factorId) {
        const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
        if (challengeErr) throw challengeErr;

        const { error: verifyErr } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challengeData.id,
          code: totpCode.trim(),
        });

        if (verifyErr) throw verifyErr;
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("2FA Verification Error:", err);
      setError("Invalid code. Please try again.");
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email first to receive a Magic Link.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      alert(`Magic Link sent to ${email}! Check your inbox.`);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-2 relative select-none">
      {/* Background orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[120px]" />

      <div className="relative w-full max-w-sm my-auto">
        {/* Logo & Header */}
        <div className="mb-4 sm:mb-5 flex flex-col items-center text-center">
          <Link href="/" className="mb-2 flex items-center justify-center p-1.5 rounded-2xl bg-white shadow-sm border border-zinc-200/80 hover:scale-105 transition-transform">
            <LogoIconOnly />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
            {requires2FA ? "Two-Factor Authentication" : <>Welcome back to FeedM<span className="text-emerald-600">.ee</span></>}
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-zinc-500 mt-0.5">
            {requires2FA
              ? "Enter the 6-digit verification code from your authenticator app."
              : "Sign in to your Creator Studio"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 sm:p-6 shadow-xl shadow-zinc-900/5 backdrop-blur-md">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {requires2FA ? (
            /* 2FA Verification View */
            <form onSubmit={handleVerify2FA} className="space-y-3">
              <div className="p-2.5 rounded-2xl bg-violet-50 border border-violet-200 text-violet-950 flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0" />
                <p className="text-[11px] font-semibold leading-tight">
                  Two-Factor Protection Active. Enter TOTP code from authenticator app.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm tracking-widest font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Verify &amp; Log In <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-center text-[11px] font-bold text-zinc-500 hover:text-zinc-900 transition pt-1 cursor-pointer"
              >
                Back to Password Login
              </button>
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Email Address</label>
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

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-9 text-xs sm:text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-60 cursor-pointer mt-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {!requires2FA && (
            <>
              {/* Divider */}
              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-[10px] sm:text-[11px] font-bold text-zinc-400">
                  <span className="bg-white px-2.5">or use a Magic Link</span>
                </div>
              </div>

              {/* Magic Link Action */}
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              >
                Send Instant Magic Link
              </button>
            </>
          )}
        </div>

        {/* Footer link */}
        <p className="mt-3 text-center text-xs font-semibold text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
            Create Free Feed
          </Link>
        </p>
      </div>
    </div>
  );
}
