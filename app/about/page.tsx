import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Film, Zap, Target, BarChart3, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Feedme | Reimagining Bio Links for Video Creators",
  description: "Feedme turns static link-in-bio pages into dynamic, high-converting video feeds and lead generation engines.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 text-zinc-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Our Story &amp; Mission</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-950 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Reimagining Bio Links for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">Video Creators</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            Feedme turns static link-in-bio pages into dynamic, high-converting video feeds and lead generation engines. Built for creators who refuse to let their best Reels disappear in the feed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/pricing">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-11 px-6 rounded-xl shadow-md gap-2">
                <span>Explore Plans</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="font-extrabold text-xs h-11 px-6 rounded-xl border-zinc-200 text-zinc-800 hover:bg-zinc-100">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-zinc-200/80 shadow-xl shadow-black/5 space-y-8">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight">
                Why We Built Feedme
              </h2>
              <p className="text-sm md:text-base font-medium text-zinc-600 leading-relaxed">
                In 2026, text-only link-in-bio lists are obsolete. Creators spend hours producing high-quality vertical videos on Instagram Reels, TikTok, and YouTube Shorts, only for algorithm feeds to push them out of sight within 24 hours.
              </p>
              <p className="text-sm md:text-base font-medium text-zinc-600 leading-relaxed">
                Feedme gives creators an interactive, vertical video feed homepage. Visitors experience full-screen reel playback, embedded lead forms, and instant promo deals — directly from a single handle URL.
              </p>
            </div>

            {/* THREE PILLARS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
              {/* Pillar 1 */}
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0 border border-emerald-200">
                  <Film className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">Engagement First</h3>
                <p className="text-xs font-medium text-zinc-600 leading-relaxed">
                  Immersive TikTok &amp; Reels style vertical video playback. Captivate visitors instantly with your best content instead of static links.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black shrink-0 border border-blue-200">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">Direct Lead Capture</h3>
                <p className="text-xs font-medium text-zinc-600 leading-relaxed">
                  Capture subscriber emails and phone leads straight from your bio feed with integrated CRM form management.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="flex flex-col gap-3 p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0 border border-amber-200">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">Seamless Analytics</h3>
                <p className="text-xs font-medium text-zinc-600 leading-relaxed">
                  Track page views, reel plays, link clicks, and conversion rates with privacy-first analytics and Meta/TikTok pixel tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BADGE & RESELLER */}
        <section className="max-w-5xl mx-auto px-6 py-8 pb-16">
          <div className="rounded-2xl bg-emerald-900 text-white p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-bold text-white">256-Bit SSL Encrypted Processing</h4>
                <p className="text-xs text-emerald-200 font-medium mt-0.5">
                  Subscriptions, invoicing, and payment compliance are securely processed with bank-grade encryption.
                </p>
              </div>
            </div>
            <Link href="/register">
              <Button className="bg-white text-emerald-950 hover:bg-emerald-100 font-black text-xs h-10 px-5 rounded-xl shrink-0 shadow-sm">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
