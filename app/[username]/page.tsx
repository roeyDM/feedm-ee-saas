"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
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
  const [pixels, setPixels] = useState<{
    metaPixelId?: string;
    tiktokPixelId?: string;
    googleAdsId?: string;
    gaMeasurementId?: string;
  }>({});

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
          let loadedAppearance = data.appearance;
          if ((!loadedAppearance || Object.keys(loadedAppearance).length === 0) && typeof window !== "undefined") {
            const localApp = localStorage.getItem(`feedmee_appearance_${handleKey.toLowerCase()}`);
            if (localApp) {
              try { loadedAppearance = JSON.parse(localApp); } catch(e) {}
            }
          }

          // Extract Marketing Pixels
          let metaId = data.meta_pixel_id || "";
          let tiktokId = data.tiktok_pixel_id || "";
          let gadsId = data.google_ads_id || data.ga_measurement_id || "";

          if (typeof window !== "undefined" && (!metaId && !tiktokId && !gadsId)) {
            const cachedPixels = localStorage.getItem("feedmee_marketing_pixels");
            if (cachedPixels) {
              try {
                const parsed = JSON.parse(cachedPixels);
                metaId = parsed.metaPixelId || metaId;
                tiktokId = parsed.tiktokPixelId || tiktokId;
                gadsId = parsed.googleAdsId || parsed.gaMeasurementId || gadsId;
              } catch (e) {}
            }
          }

          setPixels({
            metaPixelId: metaId,
            tiktokPixelId: tiktokId,
            googleAdsId: gadsId,
            gaMeasurementId: gadsId,
          });

          // Parse video reels & lead form from database record
          const loadedReels = (Array.isArray(data.reels) ? data.reels : [])
            .map((r: any) => ({
              ...r,
              id: r.id || crypto.randomUUID(),
              videoUrl: r.videoUrl || r.url || "",
              caption: r.caption || "",
              likes: r.likes || 142,
            }))
            .filter((r: any) => r.videoUrl);

          setProfile({
            name: data.name || handleKey,
            bio: data.bio || "",
            avatarUrl:
              data.avatar_url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
            customHexColor: loadedAppearance?.bgColor || data.custom_hex_color || "#bad1cb",
            socialLinks: (data.social_links || []).map((l: any) => ({
              ...l,
              id: l.id || crypto.randomUUID(),
              isActive: l.isActive !== false
            })),
            customLinks: data.custom_links || [],
            reels: loadedReels,
            leadForm: sanitizeLeadForm(data.lead_form),
            appearance: {
              ...(loadedAppearance || {}),
              hideBranding: isFreeUser ? false : !!loadedAppearance?.hideBranding,
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
    reels: [],
    leadForm: sanitizeLeadForm(null),
    appearance: undefined,
  };

  // Format Google Ads ID (ensure AW- prefix if omitted)
  const rawGads = pixels.googleAdsId || pixels.gaMeasurementId || "";
  const cleanGadsId = rawGads.trim()
    ? rawGads.toUpperCase().startsWith("AW-") || rawGads.toUpperCase().startsWith("G-")
      ? rawGads.trim()
      : `AW-${rawGads.trim()}`
    : "";

  // Global Conversion Event Trigger Handler
  const handleLeadSubmitEvent = async () => {
    if (typeof window !== "undefined") {
      try {
        if ((window as any).fbq) (window as any).fbq("track", "Lead");
        if ((window as any).ttq) (window as any).ttq.track("CompleteRegistration");
        if ((window as any).gtag && cleanGadsId) {
          (window as any).gtag("event", "conversion", { send_to: cleanGadsId });
          (window as any).gtag("event", "generate_lead");
        }
        console.log("[Pixel Event Fired]: Lead Conversion & Google Ads Event");
      } catch (e) {
        console.warn("Pixel event error:", e);
      }
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* MARKETING PIXELS INJECTION */}
      {/* ------------------------------------------------------------- */}
      
      {/* 1. Meta (Facebook & Instagram) Pixel */}
      {pixels.metaPixelId && (
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixels.metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* 2. TikTok Pixel */}
      {pixels.tiktokPixelId && (
        <Script
          id="tiktok-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq.methods[i],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${pixels.tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {/* 3. Google Ads Pixel */}
      {cleanGadsId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${cleanGadsId}`}
          />
          <Script
            id="google-ads-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${cleanGadsId}');
              `,
            }}
          />
        </>
      )}

      {/* PUBLIC MOBILE FEED PREVIEW */}
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
        onTestLeadSubmit={handleLeadSubmitEvent}
      />
    </>
  );
}
