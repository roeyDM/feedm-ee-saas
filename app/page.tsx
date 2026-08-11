"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film,
  ArrowRight,
  Sparkles,
  Palette,
  Tag,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FaqAccordion, HOMEPAGE_FAQS } from "@/components/faq-accordion";

import { validateHandle, checkUsernameAvailability, sanitizeHandleInput } from "@/lib/supabase";

export default function Home() {
  const [handle, setHandle] = useState("");
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleStatus, setHandleStatus] = useState<{ available: boolean; reason?: string } | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const clean = sanitizeHandleInput(handle);
    if (!clean) {
      setHandleStatus(null);
      return;
    }

    setCheckingHandle(true);
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailability(clean);
      setHandleStatus(res);
      setCheckingHandle(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [handle]);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeHandleInput(handle);
    if (clean) {
      const validation = validateHandle(clean);
      if (!validation.valid) {
        alert(validation.reason);
        return;
      }
      router.push(`/signup?handle=${encodeURIComponent(clean)}`);
    } else {
      router.push("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-emerald-50/30 to-sky-50/40 text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden relative">
      {/* Soft Background Pastel Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[45%] aspect-square rounded-full bg-[#bad1cb]/40 blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[40%] aspect-square rounded-full bg-[#fde68a]/35 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[20%] w-[45%] aspect-square rounded-full bg-[#e0f2fe]/50 blur-[130px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-6 pt-28 pb-12 text-center lg:pt-36 lg:pb-20">
        
        {/* Glow Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 border border-zinc-200/80 shadow-sm px-4 py-1.5 text-xs font-bold text-zinc-800 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>The 5-Page Vertical Snap Bio Reel Platform</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl md:text-7xl leading-tight">
          Your videos are your bio. <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Make them interactive.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-zinc-600 sm:text-lg md:text-xl leading-relaxed">
          Transform your link-in-bio into a 5-page vertical snap reel. Combine Linktree custom coupon links, 3 full-screen video reels with WhatsApp buttons, and a lead contact form.
        </p>

        {/* Claim Handle Bar */}
        <form onSubmit={handleClaim} className="mx-auto mt-10 max-w-lg space-y-3">
          <div className="relative flex items-center rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow-xl shadow-emerald-950/5 backdrop-blur-md transition focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <span className="pl-4 text-sm font-extrabold text-zinc-400 select-none">
              feedm.ee/
            </span>
            <input
              type="text"
              placeholder="yourhandle"
              value={handle}
              onChange={(e) => setHandle(sanitizeHandleInput(e.target.value))}
              className="flex-1 bg-transparent py-2 px-1 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl px-5 h-11 text-xs shrink-0 shadow-sm gap-1.5 cursor-pointer"
            >
              <span>Claim My Feed</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Dynamic Handle Availability Feedback Badge */}
          {handle.trim().length > 0 && (() => {
            const clean = sanitizeHandleInput(handle);
            const validation = validateHandle(clean);
            if (!validation.valid) {
              return (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold animate-in fade-in zoom-in-95 duration-200 shadow-2xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span>⚠️ {validation.reason}</span>
                </div>
              );
            }

            if (checkingHandle) {
              return (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold animate-in fade-in zoom-in-95 duration-200 shadow-2xs">
                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-zinc-400 border-t-zinc-800"></span>
                  <span>Checking feedm.ee/{clean}...</span>
                </div>
              );
            }

            if (handleStatus && !handleStatus.available) {
              return (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold animate-in fade-in zoom-in-95 duration-200 shadow-2xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span>❌ <strong>feedm.ee/{clean}</strong> is taken or unavailable ({handleStatus.reason}).</span>
                </div>
              );
            }

            return (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-in fade-in zoom-in-95 duration-200 shadow-2xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>🟢 <strong>feedm.ee/{clean}</strong> is available! Claim now to unlock 7 days of Pro Features.</span>
              </div>
            );
          })()}

          {/* Trust Badge / Micro-copy */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-extrabold text-zinc-600 bg-white/70 backdrop-blur-xs py-2 px-4 rounded-xl border border-zinc-200/70 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>⚡ 7-Day Pro Trial Included • No Credit Card Required • Keep Your Handle Forever</span>
          </div>
        </form>

        {/* Value Proposition Banner */}
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-4.5 shadow-sm flex items-center gap-4 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              Zero Risk Guarantee <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Permanent Link</span>
            </h4>
            <p className="text-xs font-semibold text-zinc-700 mt-0.5 leading-relaxed">
              Your link never breaks. Even if your 7-day Pro trial ends, your <strong>feedm.ee/{handle.trim() || "yourhandle"}</strong> link stays live on your bio forever.
            </p>
          </div>
        </div>

      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white/60 backdrop-blur-md border-t border-zinc-200/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl font-black text-zinc-950 tracking-tight sm:text-3xl">
              Everything you need for a 1:1 Social Reel Profile
            </h2>
            <p className="text-sm font-medium text-zinc-600 mt-2">
              Designed for visual creators, influencers, and brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-700 mb-6">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Linktree Links + Coupons</h3>
              <p className="text-xs font-medium text-zinc-600 mt-2 leading-relaxed">
                Page 1 features custom links with discount badges (e.g., "10% OFF code: ALEX10") to boost sales conversions.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-700 mb-6">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">3 Vertical Snap Video Reels</h3>
              <p className="text-xs font-medium text-zinc-600 mt-2 leading-relaxed">
                Pages 2 to 4 deliver full-screen snap video reels with likes counter, share, and direct WhatsApp &amp; Call buttons.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100/70 text-cyan-700 mb-6">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Custom Hex Color Engine</h3>
              <p className="text-xs font-medium text-zinc-600 mt-2 leading-relaxed">
                Choose presets like Sage Green (#bad1cb) or type any exact Hex code to style your profile background dynamically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Homepage FAQ Section */}
      <FaqAccordion
        badge="Frequently Asked Questions"
        title="Got Questions? We Have Answers."
        subtitle="Learn how FeedM.ee transforms your link-in-bio into an interactive vertical video experience."
        items={HOMEPAGE_FAQS}
      />

      {/* Landing Page Footer */}
      <Footer />

    </div>
  );
}
