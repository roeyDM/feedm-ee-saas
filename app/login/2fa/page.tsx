"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogoIconOnly } from "@/components/logo";
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle2, Loader2, ArrowRight, Mail } from "lucide-react";

export default function TwoFactorPage() {
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Mount Check: Fetch session email & verify TOTP status
  useEffect(() => {
    async function checkAuthAndFactors() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }

        if (user.email) setUserEmail(user.email);

        const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
        const verifiedFactor = factors?.totp?.find((f) => f.status === "verified");

        if (factorError || !verifiedFactor) {
          console.warn("[2FA Emergency Fail-Safe]: No verified 2FA factor found. Granting standard dashboard access.");
          window.location.href = "/dashboard";
        }
      } catch (err) {
        console.warn("[2FA Emergency Fail-Safe Exception]: Granting standard access.", err);
        window.location.href = "/dashboard";
      }
    }

    checkAuthAndFactors();
  }, []);

  const handleSendEmailOtp = async () => {
    setEmailSending(true);
    setError(null);
    setEmailNotice(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch("/api/auth/2fa-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: "send", email: userEmail }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to send email OTP code.");
      }

      setEmailNotice(json.message || "A 6-digit verification code was sent to your email address.");
    } catch (err: any) {
      console.error("[Email OTP Send Error]:", err);
      setError(err.message || "Failed to send email verification code.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailNotice(null);
    setLoading(true);

    const cleanCode = totpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError("Please enter a valid 6-digit verification code.");
      setLoading(false);
      return;
    }

    let verifiedSuccess = false;

    // 1. First, attempt Authenticator TOTP verification if factor exists
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factors?.totp?.find((f) => f.status === "verified");

      if (verifiedFactor) {
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id });
        if (!challengeError) {
          const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId: verifiedFactor.id,
            challengeId: challenge.id,
            code: cleanCode,
          });

          if (!verifyError) {
            verifiedSuccess = true;
          }
        }
      }
    } catch (totpErr) {
      console.warn("[2FA TOTP verify note]:", totpErr);
    }

    // 2. If TOTP didn't pass, attempt Email OTP verification via API
    if (!verifiedSuccess) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || "";

        const res = await fetch("/api/auth/2fa-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ action: "verify", code: cleanCode, email: userEmail }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          verifiedSuccess = true;
        }
      } catch (emailVerifyErr) {
        console.warn("[2FA Email OTP verify note]:", emailVerifyErr);
      }
    }

    if (verifiedSuccess) {
      window.location.href = "/dashboard";
    } else {
      setError("Invalid verification code. Please check your authenticator app or email inbox.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-2 relative select-none">
      <div className="pointer-events-none absolute top-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[120px]" />

      <div className="relative w-full max-w-sm my-auto">
        <div className="mb-4 sm:mb-5 flex flex-col items-center text-center">
          <Link href="/" className="mb-2 flex items-center justify-center p-1.5 rounded-2xl bg-white shadow-sm border border-zinc-200/80 hover:scale-105 transition-transform">
            <LogoIconOnly />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">Two-Factor Authentication</h1>
          <p className="text-[11px] sm:text-xs font-semibold text-zinc-500 mt-0.5">
            Enter the 6-digit code from your authenticator app or email.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 sm:p-6 shadow-xl shadow-zinc-900/5 backdrop-blur-md space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {emailNotice && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{emailNotice}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-3">
            <div className="p-2.5 rounded-2xl bg-violet-50 border border-violet-200 text-violet-950 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0" />
              <p className="text-[11px] font-semibold leading-tight">
                Two-Factor Protection Active. Enter TOTP code or email verification code.
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

            {/* Email Fallback Option */}
            <div className="text-center pt-1">
              <button
                type="button"
                disabled={emailSending}
                onClick={handleSendEmailOtp}
                className="text-xs font-bold text-violet-600 hover:text-violet-700 underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{emailSending ? "Sending code to email..." : "Didn't receive a code? Send one-time verification code to my email"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 pt-2 border-t border-zinc-100">
              <Link href="/login" className="hover:text-zinc-900 transition">
                Back to Login
              </Link>
              <button
                type="button"
                onClick={() => { window.location.href = "/dashboard"; }}
                className="text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                Bypass to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
