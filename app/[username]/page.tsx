"use client";

import React, { useEffect, useState } from "react";
import {
  MobilePreview,
  SocialLink,
  CustomLink,
  VideoReel,
  LeadFormSettings,
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
          setProfile({
            name: data.name || handleKey,
            bio: data.bio || "",
            avatarUrl:
              data.avatar_url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
            customHexColor: data.custom_hex_color || "#bad1cb",
            socialLinks: data.social_links || [],
            customLinks: data.custom_links || [],
            reels: data.reels || [],
            leadForm: data.lead_form || {
              title: "רוצים להיות חלק? / לפניות עסקיות",
              subtitle: "השאירו פרטים ונחזור אליכם בהקדם",
              routeType: "whatsapp",
              target: "1234567890",
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

  // Fallback demo profile if no database record exists yet
  const fallbackName = handleKey.charAt(0).toUpperCase() + handleKey.slice(1);
  const activeProfile = profile || {
    name: fallbackName,
    bio: `Filmmaker & visual creator. Tap my links or scroll down to explore my video reels.`,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    customHexColor: "#bad1cb",
    socialLinks: [
      { platform: "instagram", url: `https://instagram.com/${handleKey}` },
      { platform: "tiktok", url: `https://tiktok.com/@${handleKey}` },
      { platform: "youtube", url: `https://youtube.com/${handleKey}` },
    ],
    customLinks: [
      {
        id: "1",
        title: "Preset Lightroom Pack 🎨",
        url: "https://example.com/presets",
        badgeText: "20% OFF: SAVE20",
      },
      {
        id: "2",
        title: "My Favorite Gear & Merch 👕",
        url: "https://example.com/shop",
        badgeText: "Free Shipping",
      },
    ],
    reels: [
      {
        id: "r1",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-mysterious-pale-looking-woman-with-neon-make-up-42322-large.mp4",
        caption: `Welcome to @${handleKey}'s feed! Check out this video 🌆`,
        likes: 342,
        showWhatsapp: true,
        showCall: false,
      },
      {
        id: "r2",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-girl-taking-selfie-in-front-of-neon-sign-42326-large.mp4",
        caption: "Sunset waves on the coast 🌊🌅 Follow for more reels!",
        likes: 215,
        showWhatsapp: true,
        showCall: true,
      },
      {
        id: "r3",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-in-autumn-48906-large.mp4",
        caption: "Autumn leaves loop 🍂💛 Cozy season is here.",
        likes: 418,
        showWhatsapp: false,
        showCall: true,
      },
    ],
    leadForm: {
      title: "רוצים להיות חלק? / לפניות עסקיות",
      subtitle: "השאירו פרטים ונחזור אליכם בהקדם",
      routeType: "whatsapp",
      target: "1234567890",
    },
  };

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
      isDemoMode={false}
    />
  );
}
