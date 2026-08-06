"use client";

import React from "react";
import Script from "next/script";
import {
  MobilePreview,
  SocialLink,
  CustomLink,
  VideoReel,
  LeadFormSettings,
} from "@/components/mobile-preview";
import { sanitizeLeadForm } from "@/lib/sanitizers";

interface ProfileData {
  name: string;
  bio: string;
  avatarUrl: string;
  customHexColor: string;
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
  reels: VideoReel[];
  leadForm: LeadFormSettings;
  appearance?: any;
  pixels: {
    metaPixelId?: string;
    tiktokPixelId?: string;
    googleAdsId?: string;
  };
}

interface PublicFeedClientProps {
  handleKey: string;
  profile: ProfileData | null;
}

export function PublicFeedClient({ handleKey, profile }: PublicFeedClientProps) {
  // If profile is null (handle not found), show a neutral loading/not-found state
  // This should never flash fake data since SSR pre-populates real profile
  if (!profile) {
    return (
      <div
        className="w-full h-[100dvh] flex items-center justify-center bg-[#BAD1CB]"
        style={{ colorScheme: "light" }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing avatar skeleton */}
          <div className="h-24 w-24 rounded-full bg-white/30 animate-pulse" />
          <div className="h-4 w-32 rounded-full bg-white/30 animate-pulse" />
          <div className="h-3 w-48 rounded-full bg-white/20 animate-pulse" />
        </div>
      </div>
    );
  }

  const { pixels } = profile;

  // Format Google Ads ID (ensure AW- prefix if needed)
  const rawGads = pixels.googleAdsId || "";
  const cleanGadsId = rawGads.trim()
    ? rawGads.toUpperCase().startsWith("AW-") ||
      rawGads.toUpperCase().startsWith("G-")
      ? rawGads.trim()
      : `AW-${rawGads.trim()}`
    : "";

  // Pixel event handler for lead form submissions
  const handleLeadSubmitEvent = async () => {
    if (typeof window !== "undefined") {
      try {
        if ((window as any).fbq) (window as any).fbq("track", "Lead");
        if ((window as any).ttq)
          (window as any).ttq.track("CompleteRegistration");
        if ((window as any).gtag && cleanGadsId) {
          (window as any).gtag("event", "conversion", { send_to: cleanGadsId });
          (window as any).gtag("event", "generate_lead");
        }
      } catch (e) {
        console.warn("Pixel event error:", e);
      }
    }
  };

  return (
    <>
      {/* ── Marketing Pixel Scripts (injected client-side only) ── */}
      {pixels.metaPixelId && (
        <>
          <Script
            id="meta-pixel-init"
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
                fbq('init', '${pixels.metaPixelId.trim()}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixels.metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

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

      {/* ── Public Feed: pre-populated server-rendered profile ── */}
      <MobilePreview
        profileName={profile.name}
        username={handleKey}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        customHexColor={profile.customHexColor}
        socialLinks={profile.socialLinks}
        customLinks={profile.customLinks}
        reels={profile.reels}
        leadForm={profile.leadForm}
        appearance={profile.appearance}
        fontFamily={profile.appearance?.fontFamily}
        isDemoMode={false}
        onTestLeadSubmit={handleLeadSubmitEvent}
      />
    </>
  );
}
