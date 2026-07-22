import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PlanType = "free" | "pro" | "business";

/**
 * Checks real-time username availability against the `profiles` table in Supabase.
 * Returns true if available, false if already taken.
 */
export async function checkUsernameAvailability(
  username: string,
  currentUsername?: string
): Promise<{ available: boolean; reason?: string }> {
  const cleanUsername = username.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { available: false, reason: "Must be at least 3 characters" };
  }

  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return { available: false, reason: "Only lowercase letters, numbers, and underscores allowed" };
  }

  // Reserved handles
  const reserved = ["login", "signup", "dashboard", "pricing", "api", "auth", "admin", "settings", "alexrivers", "roeybn"];
  if (reserved.includes(cleanUsername) && cleanUsername !== currentUsername?.toLowerCase()) {
    return { available: false, reason: "This handle is reserved" };
  }

  if (currentUsername && cleanUsername === currentUsername.toLowerCase()) {
    return { available: true };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (error) {
      console.warn("Supabase query check failed, falling back to local check:", error.message);
      return { available: true };
    }

    if (data) {
      return { available: false, reason: "Handle is already taken" };
    }

    return { available: true };
  } catch (err) {
    console.error("Error checking username availability:", err);
    return { available: true };
  }
}
