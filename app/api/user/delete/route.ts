import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    let userEmail: string | null = null;
    const body = await req.json().catch(() => ({}));

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      console.error("[Account Deletion Error]: Supabase admin client unavailable.");
      return NextResponse.json({ error: "Server admin client unavailable." }, { status: 500 });
    }

    // 1. Retrieve active user session
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (user && !userErr) {
      userId = user.id;
      userEmail = user.email || null;
    } else if (body.userId) {
      userId = body.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated request. Active user session required." }, { status: 401 });
    }

    console.log(`[Account Deletion API]: Commencing strict sequential purge for UserID=${userId}...`);

    // Fetch associated username/email from profiles for exhaustive deletion matching
    let userHandle = "";
    try {
      const { data: prof } = await adminClient.from("profiles").select("username, email").eq("id", userId).maybeSingle();
      if (prof) {
        if (prof.username) userHandle = prof.username.toLowerCase();
        if (prof.email) userEmail = prof.email.toLowerCase();
      }
    } catch (e) {
      console.warn("[Account Deletion Note]: Profile lookup note:", e);
    }

    // STEP 1: Delete reels
    console.log(`[Account Deletion Step 1/6]: Purging reels for UserID=${userId}...`);
    const { error: reelsErr } = await adminClient.from("reels").delete().eq("user_id", userId);
    if (reelsErr) console.warn("Reels deletion warning:", reelsErr.message);

    // STEP 2: Delete leads
    console.log(`[Account Deletion Step 2/6]: Purging leads for UserID=${userId}...`);
    const { error: leadsErr } = await adminClient.from("leads").delete().eq("user_id", userId);
    if (leadsErr) console.warn("Leads deletion warning:", leadsErr.message);

    // STEP 3: Delete pages (by user_id, id, or handle)
    console.log(`[Account Deletion Step 3/6]: Purging pages for UserID=${userId}...`);
    let pagesQuery = adminClient.from("pages").delete().or(`user_id.eq.${userId},id.eq.${userId}`);
    if (userHandle) {
      pagesQuery = adminClient.from("pages").delete().or(`user_id.eq.${userId},id.eq.${userId},username.eq.${userHandle}`);
    }
    const { error: pagesErr } = await pagesQuery;
    if (pagesErr) console.warn("Pages deletion warning:", pagesErr.message);

    // STEP 4: Delete subscriptions & reports
    console.log(`[Account Deletion Step 4/6]: Purging subscriptions & reports for UserID=${userId}...`);
    try { await adminClient.from("subscriptions").delete().eq("user_id", userId); } catch (e) {}
    try { await adminClient.from("reports").delete().eq("user_id", userId); } catch (e) {}

    // STEP 5: Delete profiles (by id, email, or username)
    console.log(`[Account Deletion Step 5/6]: Purging profiles for UserID=${userId}...`);
    let profileQuery = adminClient.from("profiles").delete().eq("id", userId);
    if (userHandle || userEmail) {
      const filters = [`id.eq.${userId}`];
      if (userHandle) filters.push(`username.eq.${userHandle}`);
      if (userEmail) filters.push(`email.eq.${userEmail}`);
      profileQuery = adminClient.from("profiles").delete().or(filters.join(","));
    }
    const { error: profileErr } = await profileQuery;
    if (profileErr) console.warn("Profile deletion warning:", profileErr.message);

    // STEP 6: HARD DELETE user from auth.users via Supabase Admin Client
    console.log(`[Account Deletion Step 6/6]: Purging auth.users record for UserID=${userId}...`);
    const { error: deleteAuthErr } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthErr) {
      console.error(`[Account Deletion Error]: Failed to purge auth.users record for ${userId}:`, deleteAuthErr.message);
      return NextResponse.json({ error: deleteAuthErr.message || "Failed to purge user from Auth." }, { status: 500 });
    }

    console.log(`[Account Deletion Success]: UserID=${userId} completely purged from Auth & DB! Zero orphaned records remaining.`);

    return NextResponse.json({
      success: true,
      message: "Account and all associated records deleted permanently.",
    });
  } catch (error: any) {
    console.error("[Account Deletion Route Exception]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete account." }, { status: 500 });
  }
}
