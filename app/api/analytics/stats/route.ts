import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "30d";
    const usernameParam = searchParams.get("username");

    const daysCount = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    const startDateISO = startDate.toISOString();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let userId: string | null = null;
    let cleanUsername: string | null = usernameParam ? usernameParam.toLowerCase().trim() : null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("id", user.id)
          .maybeSingle();

        if (prof && !cleanUsername && prof.username) {
          cleanUsername = prof.username.toLowerCase().trim();
        }
      }
    }

    if (!userId && cleanUsername) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, username")
        .ilike("username", cleanUsername)
        .maybeSingle();

      if (prof) {
        userId = prof.id;
      }
    }

    let totalViews = 0;
    let totalClicks = 0;
    let reelPlays = 0;
    let formOpens = 0;
    let leadSubmits = 0;
    let dailyData: { day: string; views: number; clicks: number }[] = [];
    let topLinks: { name: string; clicks: number; percentage: number }[] = [];

    // Query feed_analytics table directly
    if (userId) {
      let query = supabase
        .from("feed_analytics")
        .select("*")
        .eq("feed_id", userId)
        .order("created_at", { ascending: false });

      if (timeframe !== "all") {
        query = query.gte("created_at", startDateISO);
      }

      const { data: events } = await query;

      if (events && events.length > 0) {
        const isPageView = (t: string) => t === "page_view" || t === "view" || t === "video_view";
        const isClick = (t: string) => ["click", "link_click", "social_click", "call_click", "whatsapp_click", "share"].includes(t);

        totalViews = events.filter((e) => isPageView(e.event_type)).length;
        totalClicks = events.filter((e) => isClick(e.event_type)).length;
        reelPlays = events.filter((e) => e.event_type === "video_view" || e.event_type === "reel_play").length;
        formOpens = events.filter((e) => e.event_type === "form_submit" || e.event_type === "form_open").length;

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
            if (isPageView(ev.event_type)) dayMap[key].views += 1;
            if (isClick(ev.event_type)) dayMap[key].clicks += 1;
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

        const clickRows = events.filter((e) => isClick(e.event_type));
        const linkMap: Record<string, number> = {};
        clickRows.forEach((ev) => {
          const label = ev.item_id || "Outbound Link";
          linkMap[label] = (linkMap[label] || 0) + 1;
        });

        const totalLinkClicks = clickRows.length || 1;
        topLinks = Object.entries(linkMap)
          .map(([name, clicks]) => ({
            name,
            clicks,
            percentage: Math.round((clicks / totalLinkClicks) * 100),
          }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 5);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        totalClicks,
        reelPlays,
        formOpens,
        leadSubmits,
        dailyData,
        topLinks,
      },
    });
  } catch (err: any) {
    console.error("[Analytics Stats API Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
