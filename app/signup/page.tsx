"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleParam = searchParams.get("handle") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (handleParam) {
      setUsername(handleParam.toLowerCase().replace(/[^a-z0-9_]/g, ""));
    }
  }, [handleParam]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      setError("Username can only contain lowercase letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    // Dynamic redirect URL — works on localhost AND Netlify production
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { username, display_name: username },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // If user auto-confirmed (no email verification required), redirect immediately
    if (data.session) {
      router.push("/dashboard");
    } else {
      // Email confirmation pending
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-zinc-200/80 bg-white/90 p-10 shadow-xl backdrop-blur-md text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-black text-zinc-900 mb-2">Check your inbox!</h2>
          <p className="text-sm font-medium text-zinc-600">
            We've sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            account and get started.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
          >
            Go to Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4">
      {/* Background orbs */}
      <div className="pointer-events-none absolute top-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-lg shadow-emerald-500/20 mb-3">
            <Film className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
            Join FeedM<span className="text-emerald-600">.ee</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-500 mt-1">
            Claim your creator handle and launch your page in minutes
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-md">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Your Creator Handle</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="yourname"
                  maxLength={30}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-8 pr-4 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
              {username && (
                <p className="text-[11px] font-semibold text-emerald-600">
                  feedm.ee/{username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Create Free Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] font-medium text-zinc-400">
            By signing up you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-xs font-semibold text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-bold text-zinc-400">Loading...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
