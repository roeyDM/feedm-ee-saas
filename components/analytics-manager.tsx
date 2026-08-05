"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  Percent,
  PlayCircle,
  Inbox,
  Sparkles,
  Lock,
  ArrowUpRight,
  Globe,
  Smartphone,
  Calendar,
  Filter,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsManagerProps {
  planType?: "free" | "personal" | "pro" | "business";
}

export function AnalyticsManager({ planType: initialPlan = "free" }: AnalyticsManagerProps) {
  // Local state for draft tier switcher preview
  const [activeTier, setActiveTier] = useState<"free" | "personal" | "pro">(
    initialPlan === "pro" || initialPlan === "business"
      ? "pro"
      : initialPlan === "personal"
      ? "personal"
      : "free"
  );

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  // Multipliers based on date range
  const rangeMultiplier = dateRange === "7d" ? 0.3 : dateRange === "90d" ? 2.6 : 1.0;

  // Calculated metrics
  const views = Math.round(1420 * rangeMultiplier);
  const clicks = Math.round(384 * rangeMultiplier);
  const ctr = "27.0%";
  const reelPlays = Math.round(942 * rangeMultiplier);
  const formOpens = Math.round(215 * rangeMultiplier);
  const leadsConverted = Math.round(48 * rangeMultiplier);
  const convRate = "22.3%";

  // Daily Chart Data for Views & Clicks
  const dailyData = [
    { day: "Mon", views: Math.round(120 * rangeMultiplier), clicks: Math.round(32 * rangeMultiplier) },
    { day: "Tue", views: Math.round(180 * rangeMultiplier), clicks: Math.round(48 * rangeMultiplier) },
    { day: "Wed", views: Math.round(140 * rangeMultiplier), clicks: Math.round(38 * rangeMultiplier) },
    { day: "Thu", views: Math.round(230 * rangeMultiplier), clicks: Math.round(62 * rangeMultiplier) },
    { day: "Fri", views: Math.round(290 * rangeMultiplier), clicks: Math.round(78 * rangeMultiplier) },
    { day: "Sat", views: Math.round(240 * rangeMultiplier), clicks: Math.round(64 * rangeMultiplier) },
    { day: "Sun", views: Math.round(220 * rangeMultiplier), clicks: Math.round(62 * rangeMultiplier) },
  ];

  const maxDailyViews = Math.max(...dailyData.map((d) => d.views));

  // Top Clicked Links
  const topLinks = [
    { name: "My Booking Calendar & Consultation", url: "calendly.com/me", clicks: Math.round(142 * rangeMultiplier), percentage: 37 },
    { name: "Latest Instagram Reel & Story", url: "instagram.com/p/...", clicks: Math.round(98 * rangeMultiplier), percentage: 25 },
    { name: "WhatsApp Direct Quick Chat", url: "wa.me/97250...", clicks: Math.round(84 * rangeMultiplier), percentage: 22 },
    { name: "Download Free PDF E-Book", url: "feedm.ee/ebook", clicks: Math.round(60 * rangeMultiplier), percentage: 16 },
  ];

  // Video Reel Engagement
  const reelEngagement = [
    { title: "Reel #1: Product Demo & Showcase", plays: Math.round(480 * rangeMultiplier), finishRate: "84%" },
    { title: "Reel #2: Client Case Study & Testimonial", plays: Math.round(290 * rangeMultiplier), finishRate: "72%" },
    { title: "Reel #3: Behind the Scenes & Setup", plays: Math.round(172 * rangeMultiplier), finishRate: "68%" },
  ];

  // Traffic Sources
  const trafficSources = [
    { source: "Instagram Bio Link", percent: 45, color: "bg-pink-500", count: Math.round(639 * rangeMultiplier) },
    { source: "TikTok Profile", percent: 28, color: "bg-zinc-900", count: Math.round(397 * rangeMultiplier) },
    { source: "Direct / Saved Link", percent: 14, color: "bg-emerald-500", count: Math.round(198 * rangeMultiplier) },
    { source: "Google / Web Search", percent: 8, color: "bg-blue-500", count: Math.round(113 * rangeMultiplier) },
    { source: "Facebook & Others", percent: 5, color: "bg-amber-500", count: Math.round(73 * rangeMultiplier) },
  ];

  return (
    <div className="w-full max-w-none flex-1 flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      {/* Top Card Wrapper */}
      <div className="w-full bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/50">
          {/* Left Title & Status */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-zinc-950 tracking-tight">Analytics &amp; Insights</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeTier === "free" ? "Free Plan" : activeTier === "personal" ? "Personal Plan" : "Pro Plan"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Real-time performance metrics and audience behavior</p>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200 shadow-2xs text-xs font-bold">
              <Calendar className="h-3.5 w-3.5 text-zinc-400 ml-2" />
              {(["7d", "30d", "90d"] as const).map((rng) => (
                <button
                  key={rng}
                  onClick={() => setDateRange(rng)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateRange === rng
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  {rng === "7d" ? "Last 7 Days" : rng === "30d" ? "Last 30 Days" : "Last 90 Days"}
                </button>
              ))}
            </div>

            {/* DRAFT PREVIEW TIER SWITCHER (Local Dev Preview) */}
            <div className="flex items-center gap-1 bg-amber-50/80 p-1 rounded-xl border border-amber-200 text-xs font-bold">
              <span className="text-[10px] text-amber-800 font-black px-2 uppercase tracking-wider">Preview Tier:</span>
              <button
                onClick={() => setActiveTier("free")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  activeTier === "free" ? "bg-amber-500 text-white shadow-xs" : "text-amber-900 hover:bg-amber-100"
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setActiveTier("personal")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  activeTier === "personal" ? "bg-amber-500 text-white shadow-xs" : "text-amber-900 hover:bg-amber-100"
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveTier("pro")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  activeTier === "pro" ? "bg-amber-500 text-white shadow-xs" : "text-amber-900 hover:bg-amber-100"
                }`}
              >
                Pro ⭐
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="p-6 space-y-8">
          {/* ======================================================== */}
          {/* TOP METRICS GRID (Dynamic based on Tier) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Page Views (All Tiers) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Total Views</span>
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-950">{views.toLocaleString()}</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="h-3 w-3" /> +14.2%
                </span>
              </div>
            </div>

            {/* 2. Link Clicks (All Tiers) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Total Link Clicks</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <MousePointerClick className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-950">{clicks.toLocaleString()}</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="h-3 w-3" /> +8.7%
                </span>
              </div>
            </div>

            {/* 3. CTR % (All Tiers) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Click Rate (CTR)</span>
                <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-950">{ctr}</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="h-3 w-3" /> +2.1%
                </span>
              </div>
            </div>

            {/* 4. Video Plays (Personal + Pro Only) */}
            {activeTier !== "free" ? (
              <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Video Plays</span>
                  <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-zinc-950">{reelPlays.toLocaleString()}</span>
                  <span className="text-xs font-bold text-zinc-400">3 Videos</span>
                </div>
              </div>
            ) : (
              /* Locked Placeholder Card for Free Tier */
              <div className="p-5 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 flex flex-col justify-between opacity-80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Video Plays</span>
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="my-2">
                  <span className="text-xs font-bold text-zinc-500">Available on Personal &amp; Pro</span>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* MAIN VISUAL CHART: DAILY VIEWS & CLICKS (All Tiers) */}
          {/* ======================================================== */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-zinc-950">Daily Traffic Overview</h3>
                <p className="text-xs text-zinc-500 font-medium">Comparison of total page views vs outbound clicks</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600">Page Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-zinc-600">Link Clicks</span>
                </div>
              </div>
            </div>

            {/* Custom SVG / Tailwind Bar Chart Representation */}
            <div className="pt-6 pb-2">
              <div className="h-48 w-full flex items-end justify-between gap-3 sm:gap-6 border-b border-zinc-100 pb-2">
                {dailyData.map((d, idx) => {
                  const viewHeight = Math.round((d.views / maxDailyViews) * 100);
                  const clickHeight = Math.round((d.clicks / maxDailyViews) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Views Bar */}
                        <div
                          style={{ height: `${viewHeight}%` }}
                          className="w-full max-w-[28px] bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all relative group-hover:shadow-md"
                          title={`${d.day}: ${d.views} views`}
                        />
                        {/* Clicks Bar */}
                        <div
                          style={{ height: `${clickHeight}%` }}
                          className="w-full max-w-[28px] bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all relative group-hover:shadow-md"
                          title={`${d.day}: ${d.clicks} clicks`}
                        />
                      </div>
                      <span className="text-[11px] font-extrabold text-zinc-500">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TIER 1 LOCK TEASER BANNER (Only on Free Tier) */}
          {/* ======================================================== */}
          {activeTier === "free" && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-zinc-900 to-zinc-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/30">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> Unlock Advanced Analytics
                </div>
                <h4 className="text-base font-black">Upgrade to Personal or Pro Plan</h4>
                <p className="text-xs text-zinc-300 font-medium max-w-xl">
                  Get full visibility into Video Reels plays, lead conversion tracking, top clicked links, traffic sources, and device demographics.
                </p>
              </div>
              <Button
                onClick={() => setActiveTier("personal")}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-xs h-11 px-6 rounded-xl shrink-0 shadow-lg cursor-pointer"
              >
                Upgrade Plan 🚀
              </Button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TIER 2 & TIER 3: PERSONAL + PRO SPECIFIC PANELS */}
          {/* ======================================================== */}
          {activeTier !== "free" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Clicked Links List */}
              <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-zinc-950">Top Outbound Links</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Ranked by Clicks</span>
                </div>
                <div className="space-y-3 pt-2">
                  {topLinks.map((link, i) => (
                    <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-zinc-900 truncate max-w-[240px]">{link.name}</span>
                        <span className="font-black text-emerald-600">{link.clicks} clicks</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                        <div style={{ width: `${link.percentage}%` }} className="bg-emerald-500 h-full rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Reels Engagement */}
              <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-zinc-950">Video Reels Performance</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">3 Reels Active</span>
                </div>
                <div className="space-y-3 pt-2">
                  {reelEngagement.map((reel, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                          #{i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-zinc-900">{reel.title}</p>
                          <span className="text-[10px] text-zinc-500 font-medium">Completion Rate: {reel.finishRate}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-zinc-900">{reel.plays} plays</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TIER 2 LOCK TEASER BANNER (Only on Personal Tier) */}
          {/* ======================================================== */}
          {activeTier === "personal" && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-zinc-800">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> Unlock Conversion Tracking
                </div>
                <h4 className="text-base font-black">Upgrade to Pro / Business Plan</h4>
                <p className="text-xs text-zinc-300 font-medium max-w-xl">
                  Unlock full Lead Conversion Funnel, Marketing Pixel Events (Meta, TikTok, Google), and detailed Traffic Sources breakdown!
                </p>
              </div>
              <Button
                onClick={() => setActiveTier("pro")}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-xs h-11 px-6 rounded-xl shrink-0 shadow-lg cursor-pointer"
              >
                Go Pro ⭐
              </Button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TIER 3: PRO / BUSINESS ADVANCED ENTERPRISE ANALYTICS */}
          {/* ======================================================== */}
          {activeTier === "pro" && (
            <div className="space-y-6 pt-2">
              {/* High Impact Lead Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-800/80 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">Total Leads Converted</span>
                    <Inbox className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-4xl font-black text-white">{leadsConverted}</span>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-full border border-emerald-700">
                      CRM Synced
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Lead Form Conversion Rate</span>
                    <Percent className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-4xl font-black text-emerald-400">{convRate}</span>
                    <span className="text-xs font-bold text-zinc-400">High Performing</span>
                  </div>
                </div>
              </div>

              {/* Traffic Sources & Conversion Funnel Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources Breakdown */}
                <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-600" /> Traffic Sources Breakdown
                    </h3>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      Pro Feature
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {trafficSources.map((src, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                          <span>{src.source}</span>
                          <span>{src.percent}% ({src.count} visits)</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${src.percent}%` }} className={`${src.color} h-full rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Funnel Progress */}
                <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2">
                      <Filter className="h-4 w-4 text-purple-600" /> Conversion Funnel Analysis
                    </h3>
                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                      Live Funnel
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { step: "1. Page Visit", value: views, percent: 100 },
                      { step: "2. Video Play", value: reelPlays, percent: Math.round((reelPlays / views) * 100) },
                      { step: "3. Form Opened", value: formOpens, percent: Math.round((formOpens / views) * 100) },
                      { step: "4. Lead Submitted", value: leadsConverted, percent: Math.round((leadsConverted / views) * 100) },
                    ].map((st, i) => (
                      <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-zinc-900">{st.step}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-zinc-950">{st.value}</span>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {st.percent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
