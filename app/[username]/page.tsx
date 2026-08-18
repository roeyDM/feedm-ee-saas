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

  // Always use .select("*") — never restrict columns; missing cols return undefined, never throw
  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("username", handleKey)
    .single();

  if (!profile || error) return null;

  console.log("Fetched meta_pixel_id for handle", handleKey, ":", profile?.meta_pixel_id || profile?.appearance?.meta_pixel_id);

  const isFreeUser = (profile.plan_type || "free") === "free";

  // Appearance: read strictly from DB record
  const loadedAppearance =
    profile.appearance && Object.keys(profile.appearance).length > 0
      ? profile.appearance
      : null;

  // Safe color destructuring with explicit default fallbacks for ALL profile color columns.
  // Priority order: new dedicated columns → appearance JSONB → hardcoded sensible default
  const buttonColor      = profile?.button_color      || loadedAppearance?.cardBgColor   || "#16a34a";
  const buttonTextColor  = profile?.button_text_color || loadedAppearance?.cardTextColor || "#ffffff";
  const themeColor       = profile?.theme_color       || loadedAppearance?.bgColor       || profile?.custom_hex_color || "#0f172a";
  const textColor        = profile?.text_color        || loadedAppearance?.headlineColor || "#ffffff";

  const cleanThemeColor      = sanitizeHexColor(themeColor,      "#0f172a");
  const cleanButtonColor     = sanitizeHexColor(buttonColor,     "#16a34a");
  const cleanTextColor       = sanitizeHexColor(textColor,       "#ffffff");
  const cleanButtonTextColor = sanitizeHexColor(buttonTextColor, "#ffffff");

  // bioColor: use the saved value if present, otherwise inherit from text_color so bio
  // is always legible regardless of background darkness. Never default to #27272A when
  // the user has a dark-themed feed (it becomes invisible against dark backgrounds).
  const rawBioColor = loadedAppearance?.bioColor;
  const cleanBioColor = rawBioColor
    ? sanitizeHexColor(rawBioColor, cleanTextColor)
    : cleanTextColor;

  // socialIconBgColor: check profile.social_pill_color or appearance.socialIconBgColor; fall back to button_color
  const socialPillColor = profile?.social_pill_color || loadedAppearance?.socialIconBgColor || buttonColor;
  const cleanSocialIconBg = sanitizeHexColor(socialPillColor, cleanButtonColor);

  // socialFlatColor: use saved value, else button_text_color for contrast on icon bg
  const rawSocialFlatColor = loadedAppearance?.socialFlatColor;
  const cleanSocialFlatColor = rawSocialFlatColor
    ? sanitizeHexColor(rawSocialFlatColor, cleanButtonTextColor)
    : cleanButtonTextColor;

  const socialIconMode = profile?.social_icon_mode || loadedAppearance?.socialLogoMode || "brand";

  const sanitizedAppearance = {
    bgType:           loadedAppearance?.bgType           || "solid",
    bgColor:          cleanThemeColor,
    bgGradientStart:  sanitizeHexColor(loadedAppearance?.bgGradientStart, "#FBCFE8"),
    bgGradientEnd:    sanitizeHexColor(loadedAppearance?.bgGradientEnd,   "#E0F2FE"),
    bgGradientAngle:  loadedAppearance?.bgGradientAngle  ?? 135,
    bgImageUrl:       loadedAppearance?.bgImageUrl        || "",
    headlineColor:    cleanTextColor,
    bioColor:         cleanBioColor,          // ← inherited from text_color when not set
    cardBgColor:      cleanButtonColor,
    cardTextColor:    cleanButtonTextColor,
    cardBorderColor:  sanitizeHexColor(loadedAppearance?.cardBorderColor, "#E4E4E7"),
    // Social icons: preserve saved mode, default to "brand" with themed colors
    socialLogoMode:   (socialIconMode as "brand" | "flat"),
    socialIconBgColor: cleanSocialIconBg,     // ← themed from button_color when not set
    socialFlatColor:   cleanSocialFlatColor,  // ← themed from button_text_color when not set
    avatarBorderColor: sanitizeHexColor(loadedAppearance?.avatarBorderColor || profile?.button_color, cleanButtonColor),
    avatarBorderEnabled: loadedAppearance?.avatarBorderEnabled !== false,
    avatarBorderWidth: loadedAppearance?.avatarBorderWidth ?? 4,
    buttonShape:      loadedAppearance?.buttonShape       || "rounded",
    fontFamily:       loadedAppearance?.fontFamily         || "Inter",
    hideBranding:     isFreeUser ? false : !!loadedAppearance?.hideBranding,
  };

  // Reels: parse and filter valid entries
  const loadedReels = (Array.isArray(profile.reels) ? profile.reels : [])
    .map((r: any) => ({
      ...r,
      id:       r.id       || crypto.randomUUID(),
      videoUrl: r.videoUrl || r.url || "",
      caption:  r.caption  || "",
      likes:    r.likes    || 142,
    }))
    .filter((r: any) => r.videoUrl);

  return {
    id:       profile.id,
    feedId:   profile.id,
    name:     profile.name || handleKey,
    bio:      profile.bio  || "",
    avatarUrl:
      profile.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    theme_color:       cleanThemeColor,
    button_color:      cleanButtonColor,
    text_color:        cleanTextColor,
    button_text_color: cleanButtonTextColor,
    customHexColor:    cleanThemeColor,
    socialLinks: (profile.social_links || []).map((l: any) => ({
      ...l,
      id:       l.id || crypto.randomUUID(),
      isActive: l.isActive !== false,
    })),
    customLinks: profile.custom_links || [],
    reels:       loadedReels,
    leadForm:    sanitizeLeadForm(profile.lead_form),
    appearance:  sanitizedAppearance,
    pixels: {
      metaPixelId:   (profile.meta_pixel_id   || profile.facebook_pixel_id || profile.appearance?.meta_pixel_id   || "").toString().trim(),
      tiktokPixelId: (profile.tiktok_pixel_id || profile.appearance?.tiktok_pixel_id || "").toString().trim(),
      googleAdsId:   (profile.google_ads_id   || profile.google_ads_pixel_id || profile.google_pixel_id || profile.ga_measurement_id || profile.appearance?.google_ads_id || profile.appearance?.google_ads_pixel_id || profile.appearance?.google_pixel_id || "").toString().trim(),
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const handleKey = username.toLowerCase();

  const profile = await fetchPublicProfile(handleKey);

  return <PublicFeedClient handleKey={handleKey} profile={profile} />;
}
