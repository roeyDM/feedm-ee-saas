"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  Percent,
  PlayCircle,
  Inbox,
  Sparkles,
  Lock,
  Globe,
  Calendar,
  Filter,
  BarChart3,
  Signal,
  Activity,
  RefreshCw,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { SectionHelp } from "@/components/ui/section-help";

interface AnalyticsManagerProps {
  planType?: "free" | "personal" | "pro" | "business";
  activeTier?: "free" | "personal" | "pro";
  onTierChange?: (tier: "free" | "personal" | "pro") => void;
  username?: string;
}

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  reelPlays: number;
  formOpens: number;
  leadsCount: number;
  dailyData: { day: string; views: number; clicks: number }[];
  topLinks: { name: string; clicks: number; percentage: number }[];
  reelEngagement: { title: string; plays: number; finishRate: string }[];
  trafficSources: { source: string; percent: number; count: number; color: string }[];
}

function ElegantEmptyState({
  icon: Icon,
  title,
  description,
  minHeight = "h-48",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  minHeight?: string;
}) {
  return (
    <div className={`w-full ${minHeight} flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-zinc-50/60 border border-zinc-100/90`}>
      <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-2xs">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="text-xs font-black text-zinc-950">{title}</h4>
      <p className="text-[11px] text-zinc-500 max-w-sm mt-1 font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function AnalyticsManager({
  planType: initialPlan = "free",
  activeTier: controlledTier,
  onTierChange,
  username: propUsername,
}: AnalyticsManagerProps) {
  // Local state for draft tier switcher preview
  const [internalTier, setInternalTier] = useState<"free" | "personal" | "pro">(
    initialPlan === "pro" || initialPlan === "business"
      ? "pro"
      : initialPlan === "personal"
      ? "personal"
      : "free"
  );

  const activeTier = controlledTier || internalTier;

  const handleTierChange = (tier: "free" | "personal" | "pro") => {
    setInternalTier(tier);
    if (onTierChange) onTierChange(tier);
  };

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    reelPlays: 0,
    formOpens: 0,
    leadsCount: 0,
    dailyData: [],
    topLinks: [],
    reelEngagement: [],
    trafficSources: [],
  });

  // Fetch strictly REAL data from Supabase
  const fetchRealAnalytics = async () => {
    setLoading(true);
    try {
      let leadsCount = 0;
      let totalViews = 0;
      let totalClicks = 0;
      let reelPlays = 0;
      let formOpens = 0;
      let dailyData: { day: string; views: number; clicks: number }[] = [];
      let topLinks: { name: string; clicks: number; percentage: number }[] = [];

      // 1. Determine active creator username, user_id, and fetch profile counts
      const { data: { user } } = await supabase.auth.getUser();
      let activeUsername = propUsername ? propUsername.toLowerCase().trim() : "";
      let activeUserId = user?.id || null;
      let profileCounts = { views: 0, clicks: 0 };

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, username, views_count, clicks_count")
          .eq("id", user.id)
          .maybeSingle();

        if (prof) {
          if (!activeUsername && prof.username) activeUsername = prof.username.toLowerCase().trim();
          profileCounts = {
            views: prof.views_count || 0,
            clicks: prof.clicks_count || 0,
          };
          activeUserId = prof.id;
        }

        const leadsRes = await supabase
          .from("leads")
          .select("id, created_at", { count: "exact" })
          .or(`user_id.eq.${user.id},user_id.is.null`);

        if (leadsRes.count !== null && leadsRes.count !== undefined) {
          leadsCount = leadsRes.count;
        } else if (leadsRes.data) {
          leadsCount = leadsRes.data.length;
        }
      }

      // 2. Fetch Real Analytics Events (views, clicks, reel_play, form_open) with time-range filtering
      try {
        const daysCount = dateRange === "7d" ? 7 : dateRange === "90d" ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysCount);
        const startDateISO = startDate.toISOString();

        let eventsQuery = supabase
          .from("analytics_events")
          .select("*")
          .gte("created_at", startDateISO)
          .order("created_at", { ascending: false });

        if (activeUserId && activeUsername) {
          eventsQuery = eventsQuery.or(`user_id.eq.${activeUserId},username.eq.${activeUsername}`);
        } else if (activeUserId) {
          eventsQuery = eventsQuery.eq("user_id", activeUserId);
        } else if (activeUsername) {
          eventsQuery = eventsQuery.eq("username", activeUsername);
        }

        const { data: events, error: eventsErr } = await eventsQuery;

        if (eventsErr) {
          console.warn("[Analytics Fetch Note]: analytics_events query message:", eventsErr.message);
        }

        if (events && events.length > 0) {
          totalViews = events.filter((e) => e.event_type === "page_view").length;
          totalClicks = events.filter((e) => e.event_type === "link_click").length;
          reelPlays = events.filter((e) => e.event_type === "reel_play").length;
          formOpens = events.filter((e) => e.event_type === "form_open").length;

          // Compute daily time-series data
          const daysCount = dateRange === "7d" ? 7 : dateRange === "90d" ? 90 : 30;
          const dayMap: Record<string, { views: number; clicks: number }> = {};

          for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
            dayMap[key] = { views: 0, clicks: 0 };
          }

          events.forEach((ev) => {
            if (!ev.created_at) return;
            const key = new Date(ev.created_at).toISOString().split("T")[0];
            if (dayMap[key]) {
              if (ev.event_type === "page_view") dayMap[key].views += 1;
              if (ev.event_type === "link_click") dayMap[key].clicks += 1;
            }
          });

          const maxViews = Math.max(...Object.values(dayMap).map((d) => d.views), 1);
          const maxClicks = Math.max(...Object.values(dayMap).map((d) => d.clicks), 1);

          dailyData = Object.entries(dayMap).map(([dateStr, counts]) => {
            const dateObj = new Date(dateStr);
            const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return {
              day: label,
              views: Math.round((counts.views / maxViews) * 100) || (counts.views > 0 ? 10 : 0),
              clicks: Math.round((counts.clicks / maxClicks) * 100) || (counts.clicks > 0 ? 10 : 0),
            };
          });

          // Compute Top Links
          const linkClickEvents = events.filter((e) => e.event_type === "link_click");
          const linkMap: Record<string, number> = {};
          linkClickEvents.forEach((ev) => {
            const label = ev.link_title || ev.link_url || "Outbound Link";
            linkMap[label] = (linkMap[label] || 0) + 1;
          });

          const totalLinkClicks = linkClickEvents.length || 1;
          topLinks = Object.entries(linkMap)
            .map(([name, clicks]) => ({
              name,
              clicks,
              percentage: Math.round((clicks / totalLinkClicks) * 100),
            }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5);
        }
      } catch (err) {
        console.warn("[Analytics Events Fetch Warning]:", err);
      }

      // 3. Fall back to profile accumulator counters if event count is 0
      if (totalViews === 0 && profileCounts.views > 0) totalViews = profileCounts.views;
      if (totalClicks === 0 && profileCounts.clicks > 0) totalClicks = profileCounts.clicks;

      console.log(`[Analytics Fetch Success] @${activeUsername || "user"} (id: ${activeUserId}) views: ${totalViews}, clicks: ${totalClicks}, leads: ${leadsCount}`);

      setAnalyticsData({
        totalViews,
        totalClicks,
        reelPlays,
        formOpens,
        leadsCount,
        dailyData,
        topLinks,
        reelEngagement: [],
        trafficSources: [],
      });
    } catch (err) {
      console.error("[Real Analytics Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealAnalytics();
  }, [dateRange, propUsername]);

  const { totalViews, totalClicks, reelPlays, formOpens, leadsCount, dailyData, topLinks, reelEngagement, trafficSources } = analyticsData;
  const ctr = totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : "0.0%";
  const convRate = totalViews > 0 ? `${((leadsCount / totalViews) * 100).toFixed(1)}%` : "0.0%";

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
                <h2 className="text-base font-extrabold text-zinc-950 tracking-tight flex items-center gap-1.5">
                  Analytics &amp; Insights
                  <SectionHelp text="Real Supabase performance metrics and live visitor signals" />
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeTier === "free" ? "Free Plan" : activeTier === "personal" ? "Personal Plan" : "Pro Plan"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium hidden md:block">Real Supabase performance metrics and live signals</p>
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

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRealAnalytics}
              disabled={loading}
              className="h-8 px-2.5 rounded-xl border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="p-6 space-y-8">
          {/* ======================================================== */}
          {/* TOP METRICS GRID (Strictly Real Data) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Page Views (All Tiers) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  Total Views
                  <SectionHelp text="Total page impressions recorded on your public profile." />
                </span>
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-950">{totalViews.toLocaleString()}</span>
                <span className="text-xs font-medium text-zinc-400">Live Views</span>
              </div>
            </div>

            {/* 2. Link Clicks (All Tiers) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  Total Link Clicks
                  <SectionHelp text="Total number of outbound clicks across all links and buttons." />
                </span>
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                  <MousePointerClick className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-950">{totalClicks.toLocaleString()}</span>
                <span className="text-xs font-medium text-zinc-400">Live Clicks</span>
              </div>
            </div>

            {/* 3. CTR % (All Tiers) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  Click Rate (CTR)
                  <SectionHelp text="Percentage of page views that resulted in at least one link click." />
                </span>
                <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-950">{ctr}</span>
                <span className="text-xs font-medium text-zinc-400">Calculated</span>
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
                  <span className="text-xs font-medium text-zinc-400">Reel Plays</span>
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
          {/* MAIN VISUAL CHART / ELEGANT EMPTY STATE */}
          {/* ======================================================== */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-zinc-950">Daily Traffic Overview</h3>
                <p className="text-xs text-zinc-500 font-medium">Comparison of total page views vs outbound clicks</p>
              </div>
              {totalViews > 0 && (
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
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400 gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                <p className="text-xs font-bold text-zinc-600">Fetching live Supabase analytics...</p>
              </div>
            ) : dailyData.length > 0 && totalViews > 0 ? (
              /* Real Chart Rendering when events exist */
              <div className="pt-6 pb-2">
                <div className="h-48 w-full flex items-end justify-between gap-3 sm:gap-6 border-b border-zinc-100 pb-2">
                  {dailyData.map((d, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div style={{ height: `${d.views}%` }} className="w-full max-w-[28px] bg-emerald-500 rounded-t-lg" />
                        <div style={{ height: `${d.clicks}%` }} className="w-full max-w-[28px] bg-blue-500 rounded-t-lg" />
                      </div>
                      <span className="text-[11px] font-extrabold text-zinc-500">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Elegant Creative Empty State */
              <ElegantEmptyState
                icon={Signal}
                title="Awaiting First Signal"
                description="Your feed is live and ready. Share your FeedM.ee link to capture your first views."
                minHeight="h-52"
              />
            )}
          </div>

          {/* ======================================================== */}
          {/* TIER 1 LOCK TEASER BANNER (Only on Free Tier) */}
          {/* ======================================================== */}
          {activeTier === "free" && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/30">
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
                onClick={() => handleTierChange("personal")}
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
                {topLinks.length > 0 ? (
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
                ) : (
                  <ElegantEmptyState
                    icon={MousePointerClick}
                    title="Awaiting First Signal"
                    description="Your feed is live and ready. Share your FeedM.ee link to capture your first views."
                    minHeight="h-44"
                  />
                )}
              </div>

              {/* Video Reels Engagement */}
              <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-zinc-950">Video Reels Performance</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">3 Reels Active</span>
                </div>
                {reelEngagement.length > 0 ? (
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
                ) : (
                  <ElegantEmptyState
                    icon={PlayCircle}
                    title="No Plays Recorded Yet"
                    description="Visitors haven't watched your video reels in this timeframe."
                    minHeight="h-44"
                  />
                )}
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
                onClick={() => handleTierChange("pro")}
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
                    <span className="text-4xl font-black text-white">{leadsCount}</span>
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
                    <span className="text-xs font-bold text-zinc-400">Live Rate</span>
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

                  {trafficSources.length > 0 ? (
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
                  ) : (
                    <ElegantEmptyState
                      icon={Globe}
                      title="Gathering Referral Data"
                      description="Once visitors arrive from external links, top sources will display here."
                      minHeight="h-44"
                    />
                  )}
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

                  {totalViews > 0 || leadsCount > 0 ? (
                    <div className="space-y-3 pt-2">
                      {[
                        { step: "1. Page Visit", value: totalViews, percent: 100 },
                        { step: "2. Video Play", value: reelPlays, percent: totalViews > 0 ? Math.round((reelPlays / totalViews) * 100) : 0 },
                        { step: "3. Form Opened", value: formOpens, percent: totalViews > 0 ? Math.round((formOpens / totalViews) * 100) : 0 },
                        { step: "4. Lead Submitted", value: leadsCount, percent: totalViews > 0 ? Math.round((leadsCount / totalViews) * 100) : 0 },
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
                  ) : (
                    <ElegantEmptyState
                      icon={Activity}
                      title="Your Funnel is Ready"
                      description="No contact submissions yet. Incoming leads will appear here automatically."
                      minHeight="h-44"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
