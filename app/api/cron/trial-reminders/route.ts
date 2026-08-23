import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  sendTrialDay5Email,
  sendTrialDay6WarningEmail,
  sendTrialExpiredEmail,
} from "@/lib/resend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleTrialReminders(req);
}

export async function POST(req: NextRequest) {
  return handleTrialReminders(req);
}

async function handleTrialReminders(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Secure endpoint with Bearer Secret validation if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return NextResponse.json({ error: "Supabase admin client unavailable." }, { status: 500 });
    }

    // Fetch active trial profiles with valid trial_ends_at
    const { data: profiles, error: fetchErr } = await adminClient
      .from("profiles")
      .select("*")
      .not("trial_ends_at", "is", null);

    if (fetchErr) {
      console.error("[Trial Reminders Cron Error]: Failed to fetch profiles:", fetchErr.message);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No active trial profiles found." });
    }

    const now = Date.now();
    let remindersSent = 0;
    let warningsSent = 0;
    let expirationsProcessed = 0;

    for (const profile of profiles) {
      const trialEndsAt = profile.trial_ends_at;
      if (!trialEndsAt) continue;

      const trialEndMs = new Date(trialEndsAt).getTime();
      if (isNaN(trialEndMs)) continue;

      const diffMs = trialEndMs - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      const userEmail = (profile.email || "").toLowerCase().trim();
      const userName = profile.name || profile.full_name || profile.username || "Creator";
      const isTrialingOrActive = profile.is_trial === true || profile.subscription_status === "trialing";

      // 1. EXPIRED TRIALS (diffMs <= 0)
      if (diffMs <= 0 && isTrialingOrActive) {
        if (!profile.trial_expired_sent) {
          if (userEmail) {
            console.log(`[Trial Reminders Cron]: Trial expired for @${profile.username || profile.id} (${userEmail}). Sending expiration email...`);
            await sendTrialExpiredEmail({ email: userEmail, name: userName });
          }

          // Update profile to Free plan and mark expiration as processed
          await adminClient
            .from("profiles")
            .update({
              is_trial: false,
              plan_type: "free",
              plan: "free",
              subscription_status: "expired",
              has_used_trial: true,
              trial_expired_sent: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

          // Record in used_trials_history anti-abuse table
          if (userEmail) {
            try {
              await adminClient.from("used_trials_history").upsert(
                { email: userEmail, created_at: new Date().toISOString() },
                { onConflict: "email" }
              );
            } catch (e) {
              console.warn("[Trial Reminders Cron Anti-Abuse Warning]:", e);
            }
          }

          expirationsProcessed++;
        }
      }
      // 2. DAY 6 WARNING (Within 24 hours of expiration: 0h < diffHours <= 24h)
      else if (diffHours > 0 && diffHours <= 24 && isTrialingOrActive) {
        if (!profile.trial_warning_sent) {
          if (userEmail) {
            console.log(`[Trial Reminders Cron]: Sending 24h warning email to @${profile.username || profile.id} (${userEmail})...`);
            await sendTrialDay6WarningEmail({ email: userEmail, name: userName });
          }

          await adminClient
            .from("profiles")
            .update({
              trial_warning_sent: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

          warningsSent++;
        }
      }
      // 3. DAY 5 REMINDER (Between 48h and 24h remaining: 24h < diffHours <= 48h)
      else if (diffHours > 24 && diffHours <= 48 && isTrialingOrActive) {
        if (!profile.trial_reminder_sent) {
          if (userEmail) {
            console.log(`[Trial Reminders Cron]: Sending 48h reminder email to @${profile.username || profile.id} (${userEmail})...`);
            await sendTrialDay5Email({ email: userEmail, name: userName });
          }

          await adminClient
            .from("profiles")
            .update({
              trial_reminder_sent: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

          remindersSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: profiles.length,
      summary: {
        remindersSent,
        warningsSent,
        expirationsProcessed,
      },
    });
  } catch (err: any) {
    console.error("[Trial Reminders Cron Exception]:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
