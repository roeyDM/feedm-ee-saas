import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // 1. Insert into analytics_events table
    const { error: insertError } = await supabase.from("analytics_events").insert({
      username: cleanUsername,
      event_type,
      link_url: link_url || null,
      link_title: link_title || null,
      reel_id: reel_id || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.warn(`[Analytics Track API Warning] analytics_events insert note:`, insertError.message);
    } else {
      console.log(`[Analytics Track API Success] Registered ${event_type} for @${cleanUsername}`);
    }

    // 2. Also increment aggregate counters on profiles table for bulletproof fallback
    try {
      if (event_type === "page_view") {
        await supabase.rpc("increment_profile_views", { p_username: cleanUsername });
      } else if (event_type === "link_click") {
        await supabase.rpc("increment_profile_clicks", { p_username: cleanUsername });
      }
    } catch (e) {
      // ignore rpc errors if fallback function does not exist
    }

    return NextResponse.json({ success: true, username: cleanUsername, event_type });
  } catch (err: any) {
    console.error("[Analytics Track API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
