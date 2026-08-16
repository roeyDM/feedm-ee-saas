import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const isValidUUID = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const referer = request.headers.get("referer") || "";
    const isSimulatorEvent =
      body.is_preview === true ||
      body.is_test === true ||
      body.isTest === true ||
      body.source === "simulator" ||
      referer.includes("/dashboard");

    if (isSimulatorEvent) {
      console.log("🧪 [Simulator Analytics Event]: Bypassing database tracking row insert.");
      return NextResponse.json({
        success: true,
        skipped: "simulator_event",
      });
    }

    console.log("[Analytics Ingest Request]:", body);

    const { feed_id, username, event_type, item_id, link_url, link_title, reel_id, metadata } = body;
    const cleanUsername = typeof username === "string" ? username.toLowerCase().trim() : "";
    const rawType = typeof event_type === "string" ? event_type.toLowerCase().trim() : "page_view";
    const storedType = rawType === "view" ? "page_view" : rawType;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

    // Supabase Service Role Admin Client to bypass RLS limits
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let userId: string | null = isValidUUID(body.user_id) ? body.user_id : null;
    let targetFeedId: string | null = isValidUUID(feed_id) ? feed_id : null;

    // Lookup profile by user_id or username to resolve UUID targetFeedId
    if (!targetFeedId) {
      if (userId) {
        targetFeedId = userId;
      } else if (cleanUsername) {
        const { data: prof } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .ilike("username", cleanUsername)
          .maybeSingle();
        if (prof?.id && isValidUUID(prof.id)) {
          targetFeedId = prof.id;
        }
      }
    }

    // Insert strictly into feed_analytics table
    if (targetFeedId && isValidUUID(targetFeedId)) {
      const { data: insertRes, error: insertErr } = await supabaseAdmin.from("feed_analytics").insert([
        {
          feed_id: targetFeedId,
          event_type: storedType,
          item_id: item_id || link_url || link_title || null,
          created_at: new Date().toISOString(),
        },
      ]).select();

      if (insertErr) {
        console.error("[Analytics Insert Error on feed_analytics]:", insertErr.message, insertErr.details);
      } else {
        console.log("[Analytics Event Saved]:", { feed_id: targetFeedId, event_type: storedType, item_id: item_id || link_url || link_title || null });
        console.log("[Analytics Insert Success on feed_analytics]:", insertRes);
      }
    } else {
      console.warn(`[Analytics Ingest Warning]: Could not resolve valid UUID feed_id (passed: ${feed_id}, username: @${cleanUsername})`);
    }

    return NextResponse.json({
      success: true,
      event: storedType,
      feed_id: targetFeedId,
    });
  } catch (err: any) {
    console.error("[Analytics Ingest Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during analytics tracking" },
      { status: 500 }
    );
  }
}
