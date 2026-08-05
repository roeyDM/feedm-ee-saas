/**
 * PUBLIC FEED PAGE — Server Component
 * Fetches profile data server-side for zero flash, perfect SSR, and strict Supabase theme sync.
 */
import { createClient } from "@supabase/supabase-js";
import { sanitizeLeadForm } from "@/components/mobile-preview";
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
    customHexColor:
      loadedAppearance?.bgColor || data.custom_hex_color || "#BAD1CB",
    socialLinks: (data.social_links || []).map((l: any) => ({
      ...l,
      id: l.id || crypto.randomUUID(),
      isActive: l.isActive !== false,
    })),
    customLinks: data.custom_links || [],
    reels: loadedReels,
    leadForm: sanitizeLeadForm(data.lead_form),
    appearance: loadedAppearance
      ? {
          ...loadedAppearance,
          hideBranding: isFreeUser ? false : !!loadedAppearance.hideBranding,
        }
      : undefined,
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
