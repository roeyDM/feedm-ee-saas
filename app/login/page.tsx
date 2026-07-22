"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);

    // Dynamic redirect URL — works on localhost AND Netlify
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      alert(`✅ Magic link sent to ${email}! Check your inbox.`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4">
      {/* Background orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-lg shadow-emerald-500/20 mb-3">
            <Film className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
            Welcome back to FeedM<span className="text-emerald-600">.ee</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-500 mt-1">
            Sign in to your Creator Studio
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

          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[11px] font-bold text-zinc-400">
              <span className="bg-white px-3">or use a Magic Link</span>
            </div>
          </div>

          {/* Magic Link Button */}
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-60"
          >
            <Mail className="h-4 w-4 text-emerald-600" /> Send Magic Link to Email
          </button>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-xs font-semibold text-zinc-500">
          Don't have an account?{" "}
          <Link href="/signup" className="font-bold text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
