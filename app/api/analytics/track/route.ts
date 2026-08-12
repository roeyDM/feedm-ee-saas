import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveInMemoryEvent } from "@/lib/analytics-store";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const isValidUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log("[Analytics Ingest Request]:", body);

    const { feed_id, username, event_type, item_id, link_url, link_title, reel_id, metadata } = body;

    if (!event_type || (!username && !feed_id)) {
      return NextResponse.json(
        { error: "Missing required event_type and username or feed_id" },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanUsername = username ? String(username).toLowerCase().trim() : "";
    const normalizedType = (event_type === "page_view" || event_type === "view") ? "view" : (event_type === "link_click" || event_type === "click") ? "click" : event_type;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

    // Supabase Service Role Admin Client to bypass RLS limits
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let userId: string | null = isValidUUID(body.user_id) ? body.user_id : null;
    let profData: { id: string; views_count: number; clicks_count: number } | null = null;
    let targetFeedId: string | null = isValidUUID(feed_id) ? feed_id : null;

    // Lookup profile by user_id or username
    if (userId) {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id, views_count, clicks_count")
        .eq("id", userId)
        .maybeSingle();
      if (prof) profData = prof as any;
    } else if (cleanUsername) {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id, views_count, clicks_count")
        .ilike("username", cleanUsername)
        .maybeSingle();
      if (prof) {
        userId = prof.id;
        profData = prof as any;
      }
    }

    // Lookup feed_id from pages table if not valid UUID
    let pageData: any = null;
    const lookupHandle = cleanUsername || (feed_id && !isValidUUID(feed_id) ? String(feed_id).toLowerCase().trim() : "");

    if (lookupHandle) {
      const { data: page } = await supabaseAdmin
        .from("pages")
        .select("id, user_id, views, clicks")
        .or(`username.eq.${lookupHandle},handle.eq.${lookupHandle}`)
        .maybeSingle();
      if (page) pageData = page;
    } else if (targetFeedId) {
      const { data: page } = await supabaseAdmin
        .from("pages")
        .select("id, user_id, views, clicks")
        .eq("id", targetFeedId)
        .maybeSingle();
      if (page) pageData = page;
    }

    if (!targetFeedId && pageData?.id && isValidUUID(pageData.id)) {
      targetFeedId = pageData.id;
    }
    if (!targetFeedId && isValidUUID(userId)) {
      targetFeedId = userId;
    }
    if (!targetFeedId && isValidUUID(profData?.id)) {
      targetFeedId = profData!.id;
    }

    // 1. Insert into feed_analytics table with service role client & error logging
    if (targetFeedId && isValidUUID(targetFeedId)) {
      console.log(`[Analytics Ingest] Attempting insert into feed_analytics: feed_id=${targetFeedId}, event_type=${normalizedType}, item_id=${item_id || link_url || link_title || null}`);
      const { data: insertRes, error: insertErr } = await supabaseAdmin.from("feed_analytics").insert([
        {
          feed_id: targetFeedId,
          event_type: normalizedType,
          item_id: item_id || link_url || link_title || null,
          created_at: new Date().toISOString(),
        },
      ]).select();

      if (insertErr) {
        console.error("[Analytics Insert Error on feed_analytics]:", insertErr.message, insertErr.details, insertErr.hint);
      } else {
        console.log("[Analytics Insert Success on feed_analytics]:", insertRes);
      }
    } else {
      console.warn(`[Analytics Ingest Warning]: Could not resolve valid UUID feed_id (passed: ${feed_id}, username: @${cleanUsername})`);
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
      await supabaseAdmin.from("analytics_events").insert([insertPayload]);
    } catch (e: any) {
      console.warn("[Analytics Track API] analytics_events insert note:", e?.message || e);
    }

    // 3. Increment aggregate views & clicks in pages & profiles tables
    try {
      const pageViews = Number(pageData?.views || 0);
      const pageClicks = Number(pageData?.clicks || 0);
      const profViews = Number(profData?.views_count || 0);
      const profClicks = Number(profData?.clicks_count || 0);

      if (normalizedType === "view") {
        if (pageData?.id) {
          await supabaseAdmin.from("pages").update({ views: pageViews + 1 }).eq("id", pageData.id);
        }
        if (userId || profData?.id) {
          await supabaseAdmin.from("profiles").update({ views_count: profViews + 1 }).eq("id", userId || profData!.id);
        }
      } else if (normalizedType === "click") {
        if (pageData?.id) {
          await supabaseAdmin.from("pages").update({ clicks: pageClicks + 1 }).eq("id", pageData.id);
        }
        if (userId || profData?.id) {
          await supabaseAdmin.from("profiles").update({ clicks_count: profClicks + 1 }).eq("id", userId || profData!.id);
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
    console.error("[Analytics Track API Exception]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
