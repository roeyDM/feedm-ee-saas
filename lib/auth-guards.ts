import { supabase } from "@/lib/supabase";

export interface ProfileRecord {
  id: string;
  username: string;
  plan_type: "free" | "personal" | "pro" | "business";
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  [key: string]: any;
}

/**
 * Check if a profile's 7-day trial has expired.
 * If expired, automatically downgrade profile to 'free' tier in Supabase.
 */
export async function checkAndApplyTrialDowngrade(profile: ProfileRecord): Promise<ProfileRecord> {
  if (!profile || profile.subscription_status !== "trialing" || !profile.trial_ends_at) {
    return profile;
  }

  const now = Date.now();
  const trialEndMs = new Date(profile.trial_ends_at).getTime();

  if (now > trialEndMs) {
    console.log(`[Trial Guard]: Trial for user @${profile.username} (id: ${profile.id}) has expired. Downgrading to Free.`);

    const downgraded: ProfileRecord = {
      ...profile,
      plan_type: "free",
      subscription_status: "expired",
    };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          plan_type: "free",
          subscription_status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) {
        console.warn("[Trial Guard DB Error]:", error.message);
      }
    } catch (err) {
      console.warn("[Trial Guard Exception]:", err);
    }

    return downgraded;
  }

  return profile;
}

/**
 * Helper to calculate remaining trial days (1..7)
 */
export function getRemainingTrialDays(trialEndsAt?: string | null): number {
  if (!trialEndsAt) return 0;
  const now = Date.now();
  const trialEndMs = new Date(trialEndsAt).getTime();
  const diffMs = trialEndMs - now;
  if (diffMs <= 0) return 0;
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
