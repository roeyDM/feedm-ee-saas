import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveInMemoryEvent } from "@/lib/analytics-store";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { feed_id, username, event_type, item_id, link_url, link_title, reel_id, metadata } = body;

    if (!event_type || (!username && !feed_id)) {
      return NextResponse.json(
        { error: "Missing required event_type and username or feed_id" },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanUsername = username ? String(username).toLowerCase().trim() : "";
    const normalizedType = (event_type === "page_view" || event_type === "view") ? "view" : (event_type === "link_click" || event_type === "click") ? "click" : event_type;

    console.log(`[Analytics Track API] Event: "${normalizedType}" for feed_id: ${feed_id || "none"} username: @${cleanUsername || "none"}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let userId: string | null = body.user_id || null;
    let profData: { id: string; views_count: number; clicks_count: number } | null = null;
    let targetFeedId: string | null = feed_id || null;

    if (userId) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, views_count, clicks_count")
        .eq("id", userId)
        .maybeSingle();
      if (prof) profData = prof as any;
    } else if (cleanUsername) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, views_count, clicks_count")
        .ilike("username", cleanUsername)
        .maybeSingle();
      if (prof) {
        userId = prof.id;
        profData = prof as any;
      }
    }

    // Lookup feed_id from pages table if not supplied
    const { data: pageData } = await supabase
      .from("pages")
      .select("id, views, clicks")
      .or(`id.eq.${targetFeedId || "00000000-0000-0000-0000-000000000000"},username.eq.${cleanUsername},handle.eq.${cleanUsername}`)
      .maybeSingle();

    if (!targetFeedId && pageData?.id) {
      targetFeedId = pageData.id;
    }

    if (!targetFeedId) {
      targetFeedId = userId || profData?.id || null;
    }

    // 1. Insert into feed_analytics table
    if (targetFeedId) {
      try {
        await supabase.from("feed_analytics").insert({
          feed_id: targetFeedId,
          event_type: normalizedType,
          item_id: item_id || link_url || link_title || null,
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn("[Analytics Track API] feed_analytics insert note:", err?.message || err);
      }
    }

    // 2. Insert into analytics_events table & fallback store
    const insertPayload: any = {
      username: cleanUsername || "user",
      event_type: normalizedType,
      link_url: link_url || item_id || null,
      link_title: link_title || null,
      reel_id: reel_id || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };
    if (userId) insertPayload.user_id = userId;

    saveInMemoryEvent(insertPayload);
    try {
      await supabase.from("analytics_events").insert(insertPayload);
    } catch (e) {}

    // 3. Increment aggregate views & clicks in pages & profiles tables
    try {
      const pageViews = Number(pageData?.views || 0);
      const pageClicks = Number(pageData?.clicks || 0);
      const profViews = Number(profData?.views_count || 0);
      const profClicks = Number(profData?.clicks_count || 0);

      if (normalizedType === "view") {
        if (pageData?.id) {
          await supabase.from("pages").update({ views: pageViews + 1 }).eq("id", pageData.id);
        }
        if (userId || profData?.id) {
          await supabase.from("profiles").update({ views_count: profViews + 1 }).eq("id", userId || profData!.id);
        }
      } else if (normalizedType === "click") {
        if (pageData?.id) {
          await supabase.from("pages").update({ clicks: pageClicks + 1 }).eq("id", pageData.id);
        }
        if (userId || profData?.id) {
          await supabase.from("profiles").update({ clicks_count: profClicks + 1 }).eq("id", userId || profData!.id);
        }
      }
    } catch (e) {
      console.warn("[Analytics Track API] Counter update note:", e);
    }

    return NextResponse.json(
      { success: true, feed_id: targetFeedId, username: cleanUsername, event_type: normalizedType },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[Analytics Track API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
