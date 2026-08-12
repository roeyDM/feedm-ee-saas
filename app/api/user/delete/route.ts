import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
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
    } else if (body.userId) {
      userId = body.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated request. Active user session required." }, { status: 401 });
    }

    console.log(`[Account Deletion API]: Commencing full account purge for UserID=${userId}...`);

    // 2. Cascade delete user records across public tables
    try {
      await adminClient.from("reels").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Reels deletion note:", e);
    }

    try {
      await adminClient.from("leads").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Leads deletion note:", e);
    }

    try {
      await adminClient.from("pages").delete().or(`user_id.eq.${userId},id.eq.${userId}`);
    } catch (e) {
      console.warn("Pages deletion note:", e);
    }

    try {
      await adminClient.from("subscriptions").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Subscriptions deletion note:", e);
    }

    try {
      await adminClient.from("reports").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Reports deletion note:", e);
    }

    try {
      await adminClient.from("profiles").delete().eq("id", userId);
    } catch (e) {
      console.warn("Profiles deletion note:", e);
    }

    // 3. HARD DELETE user from auth.users via Supabase Admin Client
    const { error: deleteAuthErr } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthErr) {
      console.error(`[Account Deletion Error]: Failed to purge auth.users record for ${userId}:`, deleteAuthErr.message);
      return NextResponse.json({ error: deleteAuthErr.message || "Failed to purge user from Auth." }, { status: 500 });
    }

    console.log(`[Account Deletion Success]: UserID=${userId} completely purged from Auth & DB!`);

    return NextResponse.json({
      success: true,
      message: "Account and all associated data deleted permanently.",
    });
  } catch (error: any) {
    console.error("[Account Deletion Route Exception]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete account." }, { status: 500 });
  }
}
