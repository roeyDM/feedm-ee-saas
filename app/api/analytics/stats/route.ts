import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getInMemoryEvents } from "@/lib/analytics-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "30d";
    const usernameParam = searchParams.get("username");

    // Determine cutoff date
    const daysCount = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    const startDateISO = startDate.toISOString();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Try reading auth header if available
    let userId: string | null = null;
    let cleanUsername: string | null = usernameParam ? usernameParam.toLowerCase().trim() : null;
    let profileFallback = { views: 0, clicks: 0 };

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, username, views_count, clicks_count")
          .eq("id", user.id)
          .maybeSingle();

        if (prof) {
          if (!cleanUsername && prof.username) cleanUsername = prof.username.toLowerCase().trim();
          profileFallback = {
            views: prof.views_count || 0,
            clicks: prof.clicks_count || 0,
          };
        }
      }
    }

    // Fallback if no auth token in header: look up profile by usernameParam
    if (!userId && cleanUsername) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, username, views_count, clicks_count")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (prof) {
        userId = prof.id;
        profileFallback = {
          views: prof.views_count || 0,
          clicks: prof.clicks_count || 0,
        };
      }
    }

    let totalViews = 0;
    let totalClicks = 0;
    let reelPlays = 0;
    let formOpens = 0;
    let leadSubmits = 0;
    let dailyData: { day: string; views: number; clicks: number }[] = [];
    let topLinks: { name: string; clicks: number; percentage: number }[] = [];

    // Query analytics_events table
    let query = supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDateISO)
      .order("created_at", { ascending: false });

    if (userId && cleanUsername) {
      query = query.or(`user_id.eq.${userId},username.eq.${cleanUsername}`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else if (cleanUsername) {
      query = query.eq("username", cleanUsername);
    }

    const { data: dbEvents, error } = await query;

    if (error) {
      console.warn("[Analytics Stats API Note]: analytics_events query error:", error.message);
    }

    // Merge DB events and in-memory fallback events
    const memoryEvents = getInMemoryEvents(cleanUsername || undefined, userId || undefined, startDateISO);
    const combinedEvents = [...(dbEvents || []), ...memoryEvents];

    // Deduplicate by ID if needed
    const eventMap = new Map<string, any>();
    combinedEvents.forEach((ev) => {
      if (ev.id) eventMap.set(ev.id, ev);
    });
    const events = Array.from(eventMap.values());

    if (events && events.length > 0) {
      totalViews = events.filter((e) => e.event_type === "page_view").length;
      totalClicks = events.filter((e) => e.event_type === "link_click").length;
      reelPlays = events.filter((e) => e.event_type === "reel_play").length;
      formOpens = events.filter((e) => e.event_type === "form_open").length;
      leadSubmits = events.filter((e) => e.event_type === "lead_submit").length;

      // Group daily data by day
      const dayMap: Record<string, { views: number; clicks: number }> = {};
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
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

    // Profile table counter fallbacks if analytics_events returns 0
    if (totalViews === 0 && profileFallback.views > 0) totalViews = profileFallback.views;
    if (totalClicks === 0 && profileFallback.clicks > 0) totalClicks = profileFallback.clicks;

    const ctr = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(1)) : 0;
    const convRate = totalViews > 0 ? Number(((leadSubmits / totalViews) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      timeframe,
      username: cleanUsername,
      stats: {
        totalViews,
        totalClicks,
        reelPlays,
        formOpens,
        leadSubmits,
        ctr: `${ctr}%`,
        convRate: `${convRate}%`,
        dailyData,
        topLinks,
      },
    });
  } catch (err: any) {
    console.error("[Analytics Stats API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
