"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogoIconOnly } from "@/components/logo";
import { Film, Mail, Lock, User, Sparkles, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPlan = (searchParams.get("plan") || "pro").toLowerCase();
  const plan = rawPlan === "personal" ? "personal" : rawPlan === "free" ? "free" : "pro";
  const billing = searchParams.get("billing") || "monthly";

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const badgeText =
    plan === "free"
      ? "⚡ Create Your Free Page in Minutes • No Credit Card Required"
      : plan === "personal"
      ? "⚡ 7-Day Personal Trial Included • No Credit Card Required"
      : "⚡ 7-Day Pro Trial Included • No Credit Card Required";

  const planTitle =
    plan === "free"
      ? "Starter Free Plan"
      : plan === "personal"
      ? "Personal Creator Plan"
      : "Pro Growth Plan";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_-]/g, "").trim();

    if (!cleanHandle) {
      setError("Please enter a valid handle name for your feed.");
      setLoading(false);
      return;
    }

    try {
      // 1. Check if handle is already taken in Supabase profiles
      const { data: existingProf } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", cleanHandle)
        .maybeSingle();

      if (existingProf) {
        setError(`Handle @${cleanHandle} is already registered. Please choose another.`);
        setLoading(false);
        return;
      }

      // 2. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username: cleanHandle,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const user = authData.user;
      if (user) {
        // 3. Provision profile record in Supabase
        const isFree = plan === "free";
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const profileData = {
          id: user.id,
          username: cleanHandle,
          name: name || cleanHandle,
          plan_type: plan,
          subscription_status: isFree ? "active" : "trialing",
          trial_ends_at: isFree ? null : trialEnd,
          avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${cleanHandle}`,
          updated_at: now.toISOString(),
        };

        const { error: profErr } = await supabase.from("profiles").upsert(profileData);
        if (profErr) {
          console.warn("[Registration Profile Note]:", profErr.message);
        }
      }

      router.push(`/dashboard?welcome=true&plan=${plan}`);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/60 via-emerald-50/40 to-sky-50/50 px-4 py-12 text-zinc-900 font-sans relative overflow-hidden">
      {/* Background Pastel Orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-5%] w-[45%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[45%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[130px]" />

      <div className="relative w-full max-w-md z-10">
        {/* Dynamic Plan Badge */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-emerald-300 shadow-sm px-4 py-1.5 text-xs font-bold text-emerald-950 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span>{badgeText}</span>
          </div>
        </div>

        {/* Header Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-3 flex items-center justify-center p-2 rounded-2xl bg-white shadow-sm border border-zinc-200/80 hover:scale-105 transition-transform">
            <LogoIconOnly />
          </Link>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight sm:text-3xl">
            Claim Your FeedM<span className="text-emerald-600">.ee</span> Page
          </h1>
          <p className="text-xs font-semibold text-zinc-600 mt-1">
            Setting up your account for <span className="font-extrabold text-emerald-700">{planTitle}</span> ({billing})
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white/95 p-8 shadow-2xl shadow-zinc-900/5 backdrop-blur-md">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Desired Handle */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700">Desired Handle URL</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-zinc-400 select-none">feedm.ee/@</span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="username"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-24 pr-4 text-sm font-bold text-emerald-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
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
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Your Feed...</span>
                </>
              ) : (
                <>
                  <span>Create Account &amp; Start Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Included Features Summary */}
          <div className="mt-6 border-t border-zinc-100 pt-5 space-y-2 text-xs text-zinc-600 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Instant Setup — Live in under 60 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full access to 3 Video Reels &amp; custom themes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Cancel or switch plans anytime in 1-click</span>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-xs font-semibold text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-extrabold text-emerald-600 hover:text-emerald-700 underline underline-offset-4">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
