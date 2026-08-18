import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendFreeWelcomeEmail, sendTrialStartedEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, handle, plan } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required." }, { status: 400 });
    }

    const cleanHandle = (handle || "").toLowerCase().trim();
    const formattedName = fullName || (cleanHandle ? cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1) : "Creator");
    const planType = (plan || "free").toLowerCase();
    const isFreePlan = planType === "free" || planType === "starter";
    const cleanEmail = email.toLowerCase().trim();

    console.log(`[Signup UPSERT API]: Executing robust profile & page upsert for UserID=${userId}, Email=${cleanEmail}, Handle=@${cleanHandle}`);

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      console.error("[Signup UPSERT Error]: Supabase admin client unavailable.");
      return NextResponse.json({ error: "Server admin client unavailable." }, { status: 500 });
    }

    // Check if email has previously used a trial (from deleted account or prior sub)
    let hasUsedTrialBefore = false;
    try {
      const { data: usedTrialRecord } = await adminClient
        .from("used_trials_history")
        .select("email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (usedTrialRecord) {
        hasUsedTrialBefore = true;
        console.log(`[Signup UPSERT Anti-Abuse]: Email ${cleanEmail} found in used_trials_history. Initializing as FREE plan without trial.`);
      }
    } catch (e) {
      console.warn("[Signup UPSERT Anti-Abuse Warning]:", e);
    }

    const isTrialAllowed = !hasUsedTrialBefore && !isFreePlan;
    const trialEndsAtIso = isTrialAllowed
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // 1. Robust UPSERT into public.profiles (on conflict: update)
    const { error: profileErr } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: cleanEmail,
          username: cleanHandle,
          full_name: formattedName,
          name: formattedName,
          bio: "",
          avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${cleanHandle || userId}`,
          plan_type: isTrialAllowed ? planType : "free",
          plan: isTrialAllowed ? planType : "free",
          is_trial: isTrialAllowed,
          trial_ends_at: trialEndsAtIso,
          has_used_trial: hasUsedTrialBefore || isFreePlan,
          subscription_status: isFreePlan ? "active" : isTrialAllowed ? "trialing" : "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (profileErr) {
      console.error("[Signup UPSERT Error]: Failed to upsert profile record:", profileErr.message);
    } else {
      console.log(`[Signup UPSERT Success]: Profile record upserted for UserID=${userId}`);
    }

    // 2. Robust UPSERT into public.pages (on conflict: update)
    const { error: pageErr } = await adminClient
      .from("pages")
      .upsert(
        {
          id: userId,
          user_id: userId,
          username: cleanHandle,
          title: formattedName,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (pageErr) {
      console.error("[Signup UPSERT Error]: Failed to upsert page record:", pageErr.message);
    } else {
      console.log(`[Signup UPSERT Success]: Page record upserted for UserID=${userId}`);
    }

    // 3. Guaranteed Welcome Email Dispatch via Resend
    let emailResult = null;
    try {
      console.log(`[Resend] Triggering email dispatch for: ${cleanEmail} (isTrialAllowed=${isTrialAllowed})`);
      if (isTrialAllowed) {
        const planTitle = planType.includes("personal") ? "Personal Creator" : "Pro Growth";
        emailResult = await sendTrialStartedEmail({
          email: cleanEmail,
          name: formattedName,
          planName: `${planTitle} Plan`,
        });
      } else {
        emailResult = await sendFreeWelcomeEmail({
          email: cleanEmail,
          name: formattedName,
          handle: cleanHandle,
        });
      }
    } catch (emailErr: any) {
      console.error("[Resend Error]: Exception caught during welcome email dispatch:", emailErr);
    }

    return NextResponse.json({
      success: true,
      userId,
      emailResult,
    });
  } catch (error: any) {
    console.error("[Signup UPSERT Route Exception]:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during signup upsert." },
      { status: 500 }
    );
  }
}
