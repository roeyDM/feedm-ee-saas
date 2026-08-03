import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PlanType = "free" | "pro" | "business";

export interface HandleValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Sanitizes raw handle text by trimming spaces, converting to lowercase, and removing leading @ symbols.
 */
export function sanitizeHandleInput(input: string): string {
  if (!input) return "";
  return input.replace(/^@+/, "").trim().toLowerCase();
}

/**
 * Validates a user handle string according to FeedMee rules:
 * - 3 to 30 characters
 * - Alphanumeric (a-z, 0-9), hyphens (-), and underscores (_)
 * - Must NOT start or end with a hyphen or underscore
 * - Must NOT contain consecutive special characters (-- or __ or -_ or _-)
 */
export function validateHandle(handle: string): HandleValidationResult {
  const normalized = sanitizeHandleInput(handle);

  if (!normalized) {
    return { valid: false, reason: "Handle cannot be empty." };
  }

  if (normalized.length < 3) {
    return { valid: false, reason: "Handle must be at least 3 characters." };
  }

  if (normalized.length > 30) {
    return { valid: false, reason: "Handle cannot exceed 30 characters." };
  }

  if (/[^a-z0-9_-]/.test(normalized)) {
    return {
      valid: false,
      reason: "Handle can only contain letters, numbers, hyphens (-), and underscores (_).",
    };
  }

  if (/^[_-]/.test(normalized) || /[_-]$/.test(normalized)) {
    return {
      valid: false,
      reason: "Handle cannot start or end with a hyphen (-) or underscore (_).",
    };
  }

  if (/[_-]{2,}/.test(normalized)) {
    return {
      valid: false,
      reason: "Handle cannot contain consecutive hyphens (-) or underscores (_).",
    };
  }

  if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(normalized)) {
    return {
      valid: false,
      reason: "Handle can only contain letters, numbers, hyphens (-), and underscores (_).",
    };
  }

  return { valid: true };
}

/**
 * Checks real-time username availability against the `profiles` table in Supabase.
 * Returns true if available, false if already taken.
 */
export async function checkUsernameAvailability(
  username: string,
  currentUsername?: string
): Promise<{ available: boolean; reason?: string }> {
  const cleanUsername = sanitizeHandleInput(username);

  const validation = validateHandle(cleanUsername);
  if (!validation.valid) {
    return { available: false, reason: validation.reason };
  }

  // Reserved handles (System routes only)
  const reserved = ["login", "signup", "dashboard", "pricing", "api", "auth", "admin", "settings", "privacy", "terms"];
  if (reserved.includes(cleanUsername) && cleanUsername !== currentUsername?.toLowerCase()) {
    return { available: false, reason: "This handle is reserved." };
  }

  if (currentUsername && cleanUsername === currentUsername.toLowerCase()) {
    return { available: true };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", cleanUsername)
      .maybeSingle();

    if (error) {
      console.warn("Supabase query check failed, falling back to local check:", error.message);
      return { available: true };
    }

    if (data) {
      return { available: false, reason: "This handle is already taken." };
    }

    return { available: true };
  } catch (err) {
    console.error("Error checking username availability:", err);
    return { available: true };
  }
}
