"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Rocket,
  Palette,
  Link2,
  ShieldCheck,
  CreditCard,
  BarChart3,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Mail,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { HelpHeader } from "@/components/help-center/help-header";
import { SupportModal } from "@/components/help-center/support-modal";
import {
  HELP_CATEGORIES,
  HELP_ARTICLES,
  searchArticles,
} from "@/lib/help-center-data";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "getting-started": <Rocket className="w-6 h-6 text-emerald-600" />,
  "design-customization": <Palette className="w-6 h-6 text-purple-600" />,
  "links-and-content": <Link2 className="w-6 h-6 text-blue-600" />,
  "verification": <ShieldCheck className="w-6 h-6 text-teal-600" />,
  "billing-subscriptions": <CreditCard className="w-6 h-6 text-amber-600" />,
  "analytics-pixels": <BarChart3 className="w-6 h-6 text-pink-600" />,
};

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const searchResults = searchArticles(searchQuery);
  const popularArticles = HELP_ARTICLES.filter((a) => a.popular);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Dynamic Header */}
      <HelpHeader />

      {/* ── Hero Search Banner ── */}
      <section className="relative overflow-visible bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50 border-b border-slate-200/80 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Feedm.ee Knowledge Base</span>
          </div>

          <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-base font-medium text-slate-600 max-w-xl mx-auto">
            Search our comprehensive guides, tutorials, and feature documentations for everything Feedm.ee.
          </p>

          {/* Instant Search Bar Container with Strict High Z-Index & Elevation */}
          <div className="relative max-w-2xl mx-auto mt-6 z-30">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles (e.g. KYC verification, pixels, domain, themes)..."
                className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-md transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown (z-50 Overlay ABOVE categories) */}
            {searchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 text-left max-h-96 overflow-y-auto animate-in fade-in duration-150">
                {searchResults.length > 0 ? (
                  <div className="p-2 divide-y divide-slate-100">
                    {searchResults.map((art) => (
                      <Link
                        key={art.slug}
                        href={`/help/${art.categorySlug}/${art.slug}`}
                        className="block p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {art.title}
                          </h4>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">
                          {art.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs sm:text-sm font-bold text-slate-500">
                    No articles found matching &quot;{searchQuery}&quot;. Try searching for &quot;verification&quot;, &quot;reels&quot;, or &quot;analytics&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── Main Content Grid ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12 sm:space-y-14 flex-1 w-full">
        
        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Browse Categories</span>
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Explore documentation organized by feature area.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {HELP_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/help/${cat.slug}`}
                className="group bg-white border border-slate-200/90 hover:border-emerald-500/80 rounded-3xl p-5 sm:p-6 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    {CATEGORY_ICONS[cat.slug] || <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                    <span>{cat.name}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </h3>

                  <p className="text-xs font-medium text-slate-600 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>{cat.articleCount} Articles</span>
                  <span className="text-emerald-600 group-hover:underline">Explore &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Articles Section */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Popular Articles</span>
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Frequently requested guides and setup walkthroughs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((art) => (
              <Link
                key={art.slug}
                href={`/help/${art.categorySlug}/${art.slug}`}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all flex items-start justify-between group hover:shadow-md"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {art.categorySlug.replace("-", " ")}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors pt-0.5">
                    {art.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1">
                    {art.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Still Need Assistance Banner */}
        <section className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Direct Support</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Still need assistance?</h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-lg">
              Our engineering team is ready to assist you with verification, custom setup, or account inquiries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSupportModalOpen(true)}
            className="shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support Team</span>
          </button>
        </section>

      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
