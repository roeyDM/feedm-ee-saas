"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogoIconOnly } from "@/components/logo";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight, ShieldCheck, KeyRound, UserPlus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Magic Link & Non-Existent User State
  const [magicLinkSuccess, setMagicLinkSuccess] = useState(false);
  const [nonExistentUserEmail, setNonExistentUserEmail] = useState<string | null>(null);

  // 2FA Interception State
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMagicLinkSuccess(false);
    setNonExistentUserEmail(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("user_not_found") || msg.includes("user not found") || msg.includes("email not found")) {
        setError("No account found with this email. Please check your spelling or sign up.");
      } else if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        try {
          const { data: prof } = await supabase.from("profiles").select("id").eq("email", email.toLowerCase().trim()).maybeSingle();
          if (!prof) {
            setError("No account found with this email. Please check your spelling or sign up.");
          } else {
            setError("Incorrect password. Please try again or click 'Forgot Password?' to reset.");
          }
        } catch (e) {
          setError("Incorrect password. Please try again or click 'Forgot Password?' to reset.");
        }
      } else {
        setError(error.message || "Invalid login credentials. Please try again.");
      }
      setLoading(false);
      return;
    }

    // Check if account strictly has VERIFIED 2FA factor enabled
    try {
      const { data: mfaFactors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = mfaFactors?.totp?.find((f) => f.status === "verified");

      if (verifiedFactor) {
        setFactorId(verifiedFactor.id);
        setRequires2FA(true);
        setLoading(false);
        console.log("[2FA UI Active]: Rendering 2FA Verification Form from file: app/login/page.tsx");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.warn("MFA Check warning:", err);
      router.push("/dashboard");
    }
  };

  const handleSendEmailCode = async () => {
    setIsSendingEmail(true);
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
        body: JSON.stringify({ action: "send", email }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to send email code.");
      }

      setEmailNotice("Verification code sent to your email inbox!");
    } catch (err: any) {
      console.error("[Send Email Code Error]:", err);
      setError("Failed to send email code. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotice(null);
    setLoading(true);

    const cleanCode = totpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError("Please enter a valid 6-digit verification code.");
      setLoading(false);
      return;
    }

    let verifiedSuccess = false;

    // 1. Try TOTP authenticator code first
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
    } catch (err) {
      console.warn("[2FA TOTP verify note]:", err);
    }

    // 2. Try Email OTP verification if TOTP failed
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
          body: JSON.stringify({ action: "verify", code: cleanCode, email }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          verifiedSuccess = true;
        }
      } catch (emailErr) {
        console.warn("[2FA Email verify note]:", emailErr);
      }
    }

    if (verifiedSuccess) {
      window.location.href = "/dashboard";
    } else {
      setError("Invalid verification code. Please check your authenticator app or email inbox.");
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email || !email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    setLoading(true);
    setError(null);
    setMagicLinkSuccess(false);
    setNonExistentUserEmail(null);

    try {
      const cleanEmail = email.toLowerCase().trim();

      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (!prof) {
        setNonExistentUserEmail(cleanEmail);
        setLoading(false);
        return;
      }

      const { error: magicErr } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (magicErr) {
        setError(magicErr.message);
      } else {
        setMagicLinkSuccess(true);
      }
    } catch (err: any) {
      setError("Failed to send Magic Link. Please try again.");
    } finally {
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
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
            {requires2FA ? "Two-Factor Authentication" : <>Welcome back to FeedM<span className="text-emerald-600">.ee</span></>}
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-zinc-500 mt-0.5">
            {requires2FA
              ? "Enter 6-digit code from authenticator app or email."
              : "Sign in to manage your video link-in-bio & creator tools"}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-5 sm:p-6 shadow-xl shadow-zinc-900/5 backdrop-blur-md">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {emailNotice && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{emailNotice}</span>
            </div>
          )}

          {magicLinkSuccess && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Magic Link sent! Check your inbox to sign in with 1-click.</span>
            </div>
          )}

          {nonExistentUserEmail && (
            <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>No account found with this email address.</span>
              </div>
              <Link
                href={`/signup?email=${encodeURIComponent(nonExistentUserEmail)}`}
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black py-2 shadow-sm transition cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Free Account</span>
              </Link>
            </div>
          )}

          {requires2FA ? (
            /* 2FA Verification View */
            <form onSubmit={handleVerify2FA} className="space-y-3">
              <div className="p-2.5 rounded-2xl bg-violet-50 border border-violet-200 text-violet-950 flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0" />
                <p className="text-[11px] font-semibold leading-tight">
                  Two-Factor Protection Active. Enter TOTP code or email verification code.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Verification Code</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-center text-base tracking-widest font-mono font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
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

              {/* Email Fallback Link Directly in Form */}
              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={isSendingEmail}
                className="mt-4 text-sm text-emerald-600 hover:underline font-medium block text-center w-full cursor-pointer disabled:opacity-50"
              >
                {isSendingEmail ? "Sending code..." : "Didn't receive a code? Send code to my email"}
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
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-700">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-9 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 font-medium"
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

              {/* Standard Password Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-60 cursor-pointer mt-4"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Log In to Creator Studio <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              {/* Instant Magic Link Fallback */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer disabled:opacity-50"
                >
                  Send Instant Magic Link (1-Click Login)
                </button>
              </div>
            </form>
          )}

          {/* Bottom Signup Navigation */}
          {!requires2FA && (
            <div className="mt-4 pt-3 border-t border-zinc-100 text-center">
              <p className="text-xs font-semibold text-zinc-500">
                Don&apos;t have a creator feed yet?{" "}
                <Link href="/pricing" className="font-extrabold text-emerald-600 hover:underline cursor-pointer">
                  Create Free Account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
