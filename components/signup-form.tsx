"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, checkUsernameAvailability, sanitizeHandleInput } from "@/lib/supabase";
import {
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export interface SignupFormProps {
  plan?: string;
  billing?: string;
  initialHandle?: string;
  onSuccess?: () => void;
}

export function SignupForm({
  plan = "free",
  billing = "monthly",
  initialHandle = "",
  onSuccess,
}: SignupFormProps) {
  const router = useRouter();

  const rawPlan = (plan || "free").toLowerCase();
  const isFreePlan = rawPlan === "free" || rawPlan === "starter" || !plan;

  const [name, setName] = useState("");
  const [handle, setHandle] = useState(() => sanitizeHandleInput(initialHandle));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Availability checking state
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleStatus, setHandleStatus] = useState<{ available: boolean; reason?: string } | null>(null);

  useEffect(() => {
    if (initialHandle) {
      setHandle(sanitizeHandleInput(initialHandle));
    }
  }, [initialHandle]);

  // Debounced handle check
  useEffect(() => {
    const clean = sanitizeHandleInput(handle);
    if (!clean || clean.length < 3) {
      setHandleStatus(null);
      setCheckingHandle(false);
      return;
    }

    setCheckingHandle(true);
    const timer = setTimeout(async () => {
      const result = await checkUsernameAvailability(clean);
      setHandleStatus(result);
      setCheckingHandle(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [handle]);

  const badgeText = isFreePlan
    ? "⚡ Create Your Free Page in Minutes • No Credit Card Required"
    : rawPlan === "personal"
    ? "⚡ 7-Day Personal Trial Included • No Credit Card Required"
    : "⚡ 7-Day Pro Trial Included • No Credit Card Required";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanHandle = sanitizeHandleInput(handle);

    if (!cleanHandle || cleanHandle.length < 3) {
      setError("Please enter a valid handle (at least 3 characters).");
      setLoading(false);
      return;
    }

    if (handleStatus && !handleStatus.available) {
      setError(handleStatus.reason || "This handle is not available.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      const formattedName = name || (cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1));

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            name: formattedName,
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
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        await supabase.from("profiles").upsert(
          {
            id: user.id,
            username: cleanHandle,
            name: formattedName,
            plan: isFreePlan ? "FREE" : rawPlan.toUpperCase(),
            payment_status: "active",
            avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${cleanHandle}`,
            updated_at: now.toISOString(),
          },
          { onConflict: "id" }
        );
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/dashboard?welcome=true&plan=${isFreePlan ? "free" : rawPlan}`);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Plan Badge */}
      <div className="mb-5 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-emerald-300 shadow-xs px-4 py-1.5 text-xs font-black text-emerald-950 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse shrink-0" />
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white/95 p-7 sm:p-8 shadow-2xl shadow-zinc-900/5 backdrop-blur-md">
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
                onChange={(e) => setHandle(sanitizeHandleInput(e.target.value))}
                placeholder="username"
                maxLength={30}
                className={`w-full rounded-xl border bg-zinc-50 py-2.5 pl-24 pr-9 text-sm font-bold text-emerald-950 placeholder-zinc-400 focus:outline-none focus:ring-2 ${
                  handleStatus
                    ? handleStatus.available
                      ? "border-emerald-500 focus:ring-emerald-500/30"
                      : "border-rose-500 focus:ring-rose-500/30"
                    : "border-zinc-200 focus:ring-emerald-500/40 focus:border-emerald-500"
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingHandle ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                ) : handleStatus ? (
                  handleStatus.available ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600" />
                  )
                ) : null}
              </div>
            </div>

            {/* Handle Availability Feedback */}
            {checkingHandle ? (
              <p className="text-[11px] font-semibold text-zinc-400">Checking availability...</p>
            ) : handleStatus ? (
              handleStatus.available ? (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  ✓ feedm.ee/{handle} is available!
                </p>
              ) : (
                <p className="text-[11px] font-bold text-rose-600">
                  ✕ {handleStatus.reason || "Handle unavailable"}
                </p>
              )
            ) : null}
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

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={loading || (handleStatus ? !handleStatus.available : false)}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Your Account...</span>
              </>
            ) : isFreePlan ? (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Create Account &amp; Start Trial</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature Bullet Points (Lower Section) */}
        <div className="mt-6 border-t border-zinc-100 pt-5 space-y-2 text-xs text-zinc-600 font-medium">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2.5">
            {isFreePlan ? "Included in Starter Free Plan:" : "Included in Pro Trial:"}
          </p>
          {isFreePlan ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Instant Setup — Live in under 60 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Unlimited Bio Links</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Custom Subdomain (feedm.ee/you)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Unlimited Bandwidth</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Cancel or switch plans anytime in 1-click</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Instant Setup — Live in under 60 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Full access to video reels &amp; custom themes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Lead capture forms &amp; CRM routing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Cancel or switch plans anytime in 1-click</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Login Link */}
      <p className="mt-6 text-center text-xs font-semibold text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-emerald-600 hover:text-emerald-700 underline underline-offset-4">
          Sign In Here
        </Link>
      </p>

      {/* Terms Disclaimer */}
      <p className="mt-3 text-center text-[11px] font-medium text-zinc-500">
        By registering, you agree to our{" "}
        <Link
          href="/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
        >
          Terms of Service
        </Link>
        {isFreePlan ? " and Privacy Policy." : " and billing terms."}
      </p>
    </div>
  );
}
