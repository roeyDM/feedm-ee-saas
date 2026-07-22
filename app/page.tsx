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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [handle, setHandle] = useState("");
  const router = useRouter();

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      router.push(`/signup?handle=${encodeURIComponent(handle.trim())}`);
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

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-md shadow-emerald-500/20">
              <Film className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-zinc-950 tracking-tight">
              FeedM<span className="text-emerald-600">.ee</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden sm:inline-block text-xs font-bold text-zinc-600 hover:text-emerald-600 transition mr-1">
              Pricing
            </Link>
            <Link href="/alexrivers" className="hidden sm:inline-block text-xs font-bold text-zinc-600 hover:text-zinc-950 transition mr-2">
              View Creator Demo
            </Link>
            <Link href="/login" className="text-xs font-bold text-zinc-700 hover:text-emerald-600 transition px-2 py-1">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs rounded-xl shadow-md transition duration-300">
                Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-6 pt-16 pb-12 text-center lg:pt-28 lg:pb-20">
        
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
        <form onSubmit={handleClaim} className="mx-auto mt-10 max-w-md">
          <div className="relative flex items-center rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow-xl shadow-emerald-950/5 backdrop-blur-md transition focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <span className="pl-4 text-sm font-extrabold text-zinc-400 select-none">
              feedm.ee/
            </span>
            <input
              type="text"
              placeholder="yourhandle"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              className="flex-1 bg-transparent py-2 px-1 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl px-5 h-11 text-xs shrink-0 shadow-sm"
            >
              Claim Your Feed
            </Button>
          </div>
          <p className="mt-3 text-xs font-semibold text-zinc-500">
            Custom Hex Color Picker • 3 Reel Snap Pages • Business Lead Form
          </p>
        </form>

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

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 py-10 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Film className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold text-zinc-950">FeedM.ee</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/pricing" className="hover:text-zinc-950">Pricing</Link>
            <span>•</span>
            <span>© {new Date().getFullYear()} FeedM.ee. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
