"use client";

import React, { useEffect, useState } from "react";
import {
  MobilePreview,
  SocialLink,
  CustomLink,
  VideoReel,
  LeadFormSettings,
  sanitizeLeadForm,
} from "@/components/mobile-preview";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const { username } = React.use(params);
  const handleKey = username.toLowerCase();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name: string;
    bio: string;
    avatarUrl: string;
    customHexColor: string;
    socialLinks: SocialLink[];
    customLinks: CustomLink[];
    reels: VideoReel[];
    leadForm: LeadFormSettings;
    appearance?: any;
  } | null>(null);

  useEffect(() => {
    async function fetchCreatorProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", handleKey)
          .single();

        if (data && !error) {
          const userPlan = data.plan_type || "free";
          const isFreeUser = userPlan === "free";
          const hasConfiguredReels = Array.isArray(data.reels) && data.reels.length > 0;

          // Smart Readiness Check: Render reels/lead form ONLY if Pro AND has at least 1 reel
          const shouldRenderReels = !isFreeUser && hasConfiguredReels;

          setProfile({
            name: data.name || handleKey,
            bio: data.bio || "",
            avatarUrl:
              data.avatar_url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
            customHexColor: data.custom_hex_color || "#bad1cb",
            socialLinks: (data.social_links || []).map((l: any) => ({
              ...l,
              id: l.id || crypto.randomUUID(),
              isActive: l.isActive !== false
            })),
            customLinks: data.custom_links || [],
            reels: shouldRenderReels ? data.reels : [],
            leadForm: shouldRenderReels ? sanitizeLeadForm(data.lead_form) : sanitizeLeadForm(null),
            appearance: {
              ...(data.appearance || {}),
              hideBranding: isFreeUser ? false : !!data.appearance?.hideBranding,
            },
          });
        }
      } catch (err) {
        console.log("No database record found for handle, fallback to demo preset:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreatorProfile();
  }, [handleKey]);

  // Fallback demo profile if no database record exists yet (Free Tier default: Page 1 Only)
  const fallbackName = handleKey.charAt(0).toUpperCase() + handleKey.slice(1);
  const activeProfile = profile || {
    name: fallbackName,
    bio: `Welcome to my FeedM.ee page! Check out my links below.`,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    customHexColor: "#bad1cb",
    socialLinks: [
      { id: "s1", platform: "instagram", url: `https://instagram.com/${handleKey}`, isActive: true },
      { id: "s2", platform: "tiktok", url: `https://tiktok.com/@${handleKey}`, isActive: true },
    ] as SocialLink[],
    customLinks: [
      {
        id: "1",
        title: "Visit My Website 🌐",
        url: "https://example.com",
      },
    ],
    // Strictly NO reels or lead forms on public feed for Free tier!
    reels: [],
    leadForm: sanitizeLeadForm(null),
    appearance: undefined,
  };

  useEffect(() => {
    console.log("Simulator Received Font [public page]:", activeProfile.appearance?.fontFamily);
  }, [activeProfile.appearance?.fontFamily]);

  return (
    <MobilePreview
      profileName={activeProfile.name}
      username={handleKey}
      bio={activeProfile.bio}
      avatarUrl={activeProfile.avatarUrl}
      customHexColor={activeProfile.customHexColor}
      socialLinks={activeProfile.socialLinks}
      customLinks={activeProfile.customLinks}
      reels={activeProfile.reels}
      leadForm={activeProfile.leadForm}
      appearance={activeProfile.appearance}
      fontFamily={activeProfile.appearance?.fontFamily}
      isDemoMode={false}
    />
  );
}
