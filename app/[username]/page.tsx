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

  const rawBgColor = loadedAppearance?.bgColor || data.custom_hex_color || data.theme_color || "#BAD1CB";
  const cleanBgColor = sanitizeHexColor(rawBgColor, "#BAD1CB");

  const sanitizedAppearance = loadedAppearance
    ? {
        ...loadedAppearance,
        bgColor: sanitizeHexColor(loadedAppearance.bgColor, "#BAD1CB"),
        bgGradientStart: sanitizeHexColor(loadedAppearance.bgGradientStart, "#FBCFE8"),
        bgGradientEnd: sanitizeHexColor(loadedAppearance.bgGradientEnd, "#E0F2FE"),
        headlineColor: sanitizeHexColor(loadedAppearance.headlineColor, "#09090B"),
        bioColor: sanitizeHexColor(loadedAppearance.bioColor, "#27272A"),
        cardBgColor: sanitizeHexColor(loadedAppearance.cardBgColor, "#FFFFFF"),
        cardTextColor: sanitizeHexColor(loadedAppearance.cardTextColor, "#09090B"),
        cardBorderColor: sanitizeHexColor(loadedAppearance.cardBorderColor, "#E4E4E7"),
        socialIconBgColor: sanitizeHexColor(loadedAppearance.socialIconBgColor, "#FFFFFF"),
        socialFlatColor: sanitizeHexColor(loadedAppearance.socialFlatColor, "#18181B"),
        avatarBorderColor: sanitizeHexColor(loadedAppearance.avatarBorderColor, "#FFFFFF"),
        hideBranding: isFreeUser ? false : !!loadedAppearance.hideBranding,
      }
    : undefined;

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
    theme_color: cleanBgColor,
    text_color: sanitizedAppearance?.headlineColor || "#09090B",
    button_color: sanitizedAppearance?.cardBgColor || "#FFFFFF",
    button_text_color: sanitizedAppearance?.cardTextColor || "#09090B",
    customHexColor: cleanBgColor,
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
