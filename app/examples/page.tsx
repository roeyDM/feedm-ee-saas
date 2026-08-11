"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Quote,
  Star,
  Film,
  ShoppingBag,
  Briefcase,
  Users,
} from "lucide-react";

interface ExampleCard {
  id: string;
  name: string;
  handle: string;
  category: "Creators" | "E-commerce" | "Service Providers";
  avatar: string;
  description: string;
  stats: string;
  tags: string[];
}

const EXAMPLES: ExampleCard[] = [
  {
    id: "alex-rivers",
    name: "Alex Rivers Media",
    handle: "alexrivers",
    category: "Creators",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    description: "Digital content creator using 3 vertical video reels to promote masterclass courses and book 1-on-1 strategy sessions.",
    stats: "+40% Link Conversion",
    tags: ["Video Reels", "Masterclass CTA", "Leadform"],
  },
  {
    id: "fitgym-studio",
    name: "FitGym Studio",
    handle: "fitgym",
    category: "Service Providers",
    avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
    description: "Personal training studio capturing trial workout session leads directly into WhatsApp with instant 1-click messaging.",
    stats: "+65% Lead Inquiries",
    tags: ["WhatsApp Routing", "1-Tap Call", "CRM Sync"],
  },
  {
    id: "aura-apparel",
    name: "Aura Apparel",
    handle: "aurastyle",
    category: "E-commerce",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop",
    description: "Sustainable fashion label showcasing new collection video drops with interactive promo deal popups.",
    stats: "2.4x Deal Redemption",
    tags: ["Product Tags", "Promo Popups", "Bio Links"],
  },
  {
    id: "urban-bakery",
    name: "Urban Cafe & Bakery",
    handle: "urbancafe",
    category: "E-commerce",
    avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop",
    description: "Artisanal coffee shop & bakery collecting catering and event booking leads directly from TikTok & Instagram bio links.",
    stats: "120+ Monthly Leads",
    tags: ["Custom Domain", "Event Booking", "WhatsApp"],
  },
];

export default function ExamplesPage() {
  const [activeCategory, setActiveCategory] = useState<"All" | "Creators" | "E-commerce" | "Service Providers">("All");

  const filteredExamples =
    activeCategory === "All"
      ? EXAMPLES
      : EXAMPLES.filter((item) => item.category === activeCategory);

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
            Discover how creators, e-commerce stores, and service businesses use FeedM's 5-page video snap reels to double link engagement and capture qualified leads.
          </p>
        </section>

        {/* ─── 2. CATEGORY FILTERS ───────────────────────────────────────── */}
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

        {/* ─── 3. SHOWCASE CARDS GRID ────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredExamples.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-zinc-200/90 bg-white/90 p-7 shadow-xl shadow-zinc-900/5 backdrop-blur-md hover:border-emerald-300 transition-all flex flex-col justify-between"
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

                {/* Footer Stats & Demo CTA */}
                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{item.stats}</span>
                  </div>

                  <Link
                    href={`/features`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-zinc-800 hover:text-[#00BC7D] transition"
                  >
                    <span>View Interactive Demo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 4. TESTIMONIAL QUOTE SECTION ──────────────────────────────── */}
        <section className="relative mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-3xl border border-zinc-200/90 bg-white/90 p-8 sm:p-10 shadow-xl shadow-zinc-900/5 backdrop-blur-md relative overflow-hidden text-center">
            <Quote className="h-10 w-10 text-emerald-400/40 mx-auto mb-4" />
            <blockquote className="text-base sm:text-xl font-bold text-zinc-900 leading-relaxed max-w-2xl mx-auto">
              "FeedM increased my link conversion by 40% using video snap reels. My audience loves swiping through video previews before booking a strategy consultation."
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                alt="Alex Rivers"
                className="h-10 w-10 rounded-full object-cover border-2 border-emerald-400"
              />
              <div className="text-left">
                <div className="text-xs font-black text-zinc-950">Alex Rivers</div>
                <div className="text-[11px] font-semibold text-zinc-500">Founder at Rivers Media Studio (@alexrivers)</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. BOTTOM CTA BANNER ───────────────────────────────────────── */}
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
