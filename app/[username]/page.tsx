/**
 * PUBLIC FEED PAGE — Server Component
 * Fetches profile data server-side for zero flash, perfect SSR, and strict Supabase theme sync.
 */
import { createClient } from "@supabase/supabase-js";
import { sanitizeLeadForm, sanitizeHexColor } from "@/lib/sanitizers";
import { PublicFeedClient } from "./client";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function fetchPublicProfile(handleKey: string) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://slyjhprwovcwxfcnxjpn.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("username", handleKey)
    .single();

  if (!data || error) return null;

  const isFreeUser = (data.plan_type || "free") === "free";

  // Appearance: read strictly from DB record
  const loadedAppearance =
    data.appearance && Object.keys(data.appearance).length > 0
      ? data.appearance
      : null;

  // Safe color derivation with explicit fallback defaults for profile color columns
  const themeColor = sanitizeHexColor(
    data?.theme_color || loadedAppearance?.bgColor || data?.custom_hex_color,
    "#BAD1CB"
  );
  const buttonColor = sanitizeHexColor(
    data?.button_color || loadedAppearance?.cardBgColor,
    "#16A34A"
  );
  const textColor = sanitizeHexColor(
    data?.text_color || loadedAppearance?.headlineColor,
    "#09090B"
  );
  const buttonTextColor = sanitizeHexColor(
    data?.button_text_color || loadedAppearance?.cardTextColor,
    "#09090B"
  );

  const sanitizedAppearance = {
    bgType: loadedAppearance?.bgType || "solid",
    bgColor: themeColor,
    bgGradientStart: sanitizeHexColor(loadedAppearance?.bgGradientStart, "#FBCFE8"),
    bgGradientEnd: sanitizeHexColor(loadedAppearance?.bgGradientEnd, "#E0F2FE"),
    bgGradientAngle: loadedAppearance?.bgGradientAngle ?? 135,
    bgImageUrl: loadedAppearance?.bgImageUrl || "",
    headlineColor: textColor,
    bioColor: sanitizeHexColor(loadedAppearance?.bioColor, "#27272A"),
    cardBgColor: buttonColor,
    cardTextColor: buttonTextColor,
    cardBorderColor: sanitizeHexColor(loadedAppearance?.cardBorderColor, "#E4E4E7"),
    socialIconBgColor: sanitizeHexColor(loadedAppearance?.socialIconBgColor, "#FFFFFF"),
    socialFlatColor: sanitizeHexColor(loadedAppearance?.socialFlatColor, "#18181B"),
    avatarBorderColor: sanitizeHexColor(loadedAppearance?.avatarBorderColor, "#FFFFFF"),
    buttonShape: loadedAppearance?.buttonShape || "rounded",
    fontFamily: loadedAppearance?.fontFamily || "Inter",
    hideBranding: isFreeUser ? false : !!loadedAppearance?.hideBranding,
  };

  // Reels: parse and filter valid entries
  const loadedReels = (Array.isArray(data.reels) ? data.reels : [])
    .map((r: any) => ({
      ...r,
      id: r.id || crypto.randomUUID(),
      videoUrl: r.videoUrl || r.url || "",
      caption: r.caption || "",
      likes: r.likes || 142,
    }))
    .filter((r: any) => r.videoUrl);

  return {
    name: data.name || handleKey,
    bio: data.bio || "",
    avatarUrl:
      data.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    theme_color: themeColor,
    button_color: buttonColor,
    text_color: textColor,
    button_text_color: buttonTextColor,
    customHexColor: themeColor,
    socialLinks: (data.social_links || []).map((l: any) => ({
      ...l,
      id: l.id || crypto.randomUUID(),
      isActive: l.isActive !== false,
    })),
    customLinks: data.custom_links || [],
    reels: loadedReels,
    leadForm: sanitizeLeadForm(data.lead_form),
    appearance: sanitizedAppearance,
    pixels: {
      metaPixelId: data.meta_pixel_id || "",
      tiktokPixelId: data.tiktok_pixel_id || "",
      googleAdsId: data.google_ads_id || data.ga_measurement_id || "",
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const handleKey = username.toLowerCase();

  const profile = await fetchPublicProfile(handleKey);

  return <PublicFeedClient handleKey={handleKey} profile={profile} />;
}
