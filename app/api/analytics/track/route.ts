import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveInMemoryEvent } from "@/lib/analytics-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, event_type, link_url, link_title, reel_id, metadata } = body;

    if (!username || !event_type) {
      return NextResponse.json({ error: "Missing required username or event_type" }, { status: 400 });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    console.log(`[Analytics Track API] Incoming event: "${event_type}" for username: @${cleanUsername}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Look up user_id & current counts from profiles table if not provided
    let userId: string | null = body.user_id || null;
    let profData: { id: string; views_count: number; clicks_count: number } | null = null;

    if (userId) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, views_count, clicks_count")
        .eq("id", userId)
        .maybeSingle();
      if (prof) profData = prof as any;
    } else {
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

    // 1. Insert into analytics_events table & fallback store
    const insertPayload: any = {
      username: cleanUsername,
      event_type,
      link_url: link_url || null,
      link_title: link_title || null,
      reel_id: reel_id || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };
    if (userId) insertPayload.user_id = userId;

    // Always preserve in fallback store
    saveInMemoryEvent(insertPayload);

    const { error: insertError } = await supabase.from("analytics_events").insert(insertPayload);

    if (insertError) {
      console.warn(`[Analytics Track API Warning] analytics_events insert note:`, insertError.message);
    } else {
      console.log(`[Analytics Track API Success] Registered ${event_type} for @${cleanUsername} (user_id: ${userId || "none"})`);
    }

    // 2. Also increment aggregate views_count/clicks_count on profiles table for bulletproof fallback
    try {
      const targetId = userId || profData?.id;
      if (targetId) {
        if (event_type === "page_view") {
          const currentViews = profData?.views_count || 0;
          await supabase.from("profiles").update({ views_count: currentViews + 1 }).eq("id", targetId);
        } else if (event_type === "link_click") {
          const currentClicks = profData?.clicks_count || 0;
          await supabase.from("profiles").update({ clicks_count: currentClicks + 1 }).eq("id", targetId);
        }
      }
    } catch (e) {
      console.warn("[Analytics Track API] Profile counter update note:", e);
    }

    return NextResponse.json({ success: true, username: cleanUsername, event_type });
  } catch (err: any) {
    console.error("[Analytics Track API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
