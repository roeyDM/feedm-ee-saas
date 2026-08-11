"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobilePreview } from "@/components/mobile-preview";
import { DEMO_PROFILES } from "@/lib/demo-profiles";
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Quote,
  Film,
  MessageCircle,
  Tag,
  Calendar,
  Smartphone,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function ExamplesPage() {
  const [activeCategory, setActiveCategory] = useState<"All" | "Creators" | "E-commerce" | "Service Providers">("All");
  const [activeProfileId, setActiveProfileId] = useState<string>("alex-rivers");

  const activeProfile = DEMO_PROFILES[activeProfileId] || DEMO_PROFILES["alex-rivers"];

  const exampleList = Object.values(DEMO_PROFILES);
  const filteredExamples =
    activeCategory === "All"
      ? exampleList
      : exampleList.filter((item) => item.category === activeCategory);

  const handleSelectDemo = (profileId: string) => {
    setActiveProfileId(profileId);
    const demoEl = document.getElementById("demo-viewport-section");
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderBadgeIcon = (id: string) => {
    switch (id) {
      case "alex-rivers":
        return <Film className="h-3.5 w-3.5 text-[#00BC7D]" />;
      case "fitgym-studio":
        return <MessageCircle className="h-3.5 w-3.5 text-[#00BC7D]" />;
      case "aura-apparel":
        return <Tag className="h-3.5 w-3.5 text-[#00BC7D]" />;
      case "urban-bakery":
        return <Calendar className="h-3.5 w-3.5 text-[#00BC7D]" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-[#00BC7D]" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-emerald-50/20 to-sky-50/30 text-zinc-900 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="pt-28 pb-20">
        {/* ─── 1. HERO SECTION ───────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 border border-zinc-200/80 shadow-sm px-4 py-1.5 text-xs font-bold text-zinc-800 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-[#00BC7D] animate-pulse" />
            <span>Showcase &amp; Inspiration Gallery</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl leading-tight">
            Built for Modern Creators <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              &amp; Visual Brands
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-zinc-600 sm:text-lg leading-relaxed">
            Discover how creators, e-commerce stores, and service businesses use FeedM's 5-page video snap reels to showcase products and capture qualified leads.
          </p>
        </section>

        {/* ─── 2. DYNAMIC INTERACTIVE DEMO VIEWPORT ─────────────────────── */}
        <section id="demo-viewport-section" className="relative mx-auto max-w-6xl px-6 pt-10 pb-12">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 border border-emerald-300 px-3.5 py-1 text-[11px] font-black text-emerald-950">
              <Smartphone className="h-3.5 w-3.5 text-[#00BC7D]" />
              <span>Interactive Profile Preview • Live Demo Viewport</span>
            </div>

            <h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">
              Testing Demo Profile: <span className="text-[#00BC7D]">{activeProfile.name}</span> (@{activeProfile.handle})
            </h2>
            <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-lg mx-auto">
              Select any profile tab below to switch the interactive mobile viewport live.
            </p>
          </div>

          {/* Quick Profile Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {exampleList.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setActiveProfileId(prof.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  activeProfileId === prof.id
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                    : "bg-white/90 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <img src={prof.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                <span>{prof.name}</span>
              </button>
            ))}
          </div>

          {/* Interactive Mobile Viewport */}
          <div className="flex justify-center items-center">
            <MobilePreview
              key={activeProfile.id}
              profileName={activeProfile.name}
              username={activeProfile.handle}
              bio={activeProfile.bio}
              avatarUrl={activeProfile.avatar}
              customHexColor={activeProfile.themeColor}
              socialLinks={[]}
              customLinks={activeProfile.links}
              reels={activeProfile.reels}
              leadForm={activeProfile.leadForm}
              isDemoMode={true}
            />
          </div>
        </section>

        {/* ─── 3. CATEGORY FILTERS ───────────────────────────────────────── */}
        <section className="relative mx-auto max-w-5xl px-6 pt-10 pb-6 flex justify-center">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 border border-zinc-200/80 shadow-sm backdrop-blur-md">
            {(["All", "Creators", "E-commerce", "Service Providers"] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === category
                    ? "bg-[#00BC7D] text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* ─── 4. SHOWCASE CARDS GRID ────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredExamples.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border bg-white/90 p-7 shadow-xl shadow-zinc-900/5 backdrop-blur-md transition-all flex flex-col justify-between ${
                  activeProfileId === item.id ? "border-[#00BC7D] ring-2 ring-[#00BC7D]/20" : "border-zinc-200/90 hover:border-emerald-300"
                }`}
              >
                <div>
                  {/* Header: Avatar + Name + Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                      />
                      <div>
                        <h3 className="text-lg font-black text-zinc-950">{item.name}</h3>
                        <p className="text-xs font-bold text-[#00BC7D]">feedm.ee/{item.handle}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-black text-[#00BC7D] uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs font-medium text-zinc-600 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Clean Badge & Demo CTA */}
                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200/60">
                    {renderBadgeIcon(item.id)}
                    <span>{item.badgeLabel}</span>
                  </div>

                  <button
                    onClick={() => handleSelectDemo(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-[#00BC7D] hover:text-white px-3.5 py-1.5 rounded-full transition shadow-xs cursor-pointer"
                  >
                    <span>View Interactive Demo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. FEATURED CREATOR CASE STUDY SECTION ─────────────────────── */}
        <section className="relative mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-3xl border border-zinc-200/90 bg-white/90 p-8 sm:p-10 shadow-xl shadow-zinc-900/5 backdrop-blur-md relative overflow-hidden text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 border border-emerald-300 px-3.5 py-1 text-[11px] font-black text-emerald-950">
              <Sparkles className="h-3.5 w-3.5 text-[#00BC7D] animate-pulse" />
              <span>Interactive Profile Preview • Creator Case Study</span>
            </div>

            <Quote className="h-8 w-8 text-emerald-400/50 mx-auto mb-3" />
            <blockquote className="text-base sm:text-xl font-bold text-zinc-900 leading-relaxed max-w-2xl mx-auto">
              "By featuring vertical video snap reels directly above my bio links, my audience engages significantly more before booking a strategy consultation."
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                alt="Alex Rivers"
                className="h-10 w-10 rounded-full object-cover border-2 border-emerald-400"
              />
              <div className="text-left">
                <div className="text-xs font-black text-zinc-950">Alex Rivers</div>
                <div className="text-[11px] font-semibold text-zinc-500">Featured Creator Case Study (@alexrivers)</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. BOTTOM CTA BANNER ───────────────────────────────────────── */}
        <section className="relative mx-auto max-w-5xl px-6 pt-6 pb-12">
          <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-10 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Start Building Your Video Bio Page
              </h2>
              <p className="text-xs font-semibold text-zinc-400 max-w-lg mx-auto">
                Select your package and launch your 5-page snap reel in less than 60 seconds.
              </p>
              <div className="pt-2">
                <Link
                  href="/pricing"
                  style={{ backgroundColor: "#00BC7D" }}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-white hover:opacity-90 shadow-lg shadow-[#00BC7D]/30 transition cursor-pointer"
                >
                  <span>Explore Plans &amp; Pricing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
