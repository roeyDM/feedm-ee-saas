"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  CheckCircle2,
  Save,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface MarketingPixelsManagerProps {
  username?: string;
}

// Official Meta Full Brand SVG Icon
function OfficialMetaLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M16.8 6.5C14.6 6.5 12.7 7.7 11.7 9.5C10.7 7.7 8.8 6.5 6.6 6.5C3.2 6.5 0.5 9.2 0.5 12.5C0.5 15.8 3.2 18.5 6.6 18.5C8.8 18.5 10.7 17.3 11.7 15.5C12.7 17.3 14.6 18.5 16.8 18.5C20.2 18.5 22.9 15.8 22.9 12.5C22.9 9.2 20.2 6.5 16.8 6.5ZM6.6 16C4.6 16 3 14.4 3 12.5C3 10.6 4.6 9 6.6 9C8.3 9 9.8 10.2 10.2 11.9C10.1 12.1 10.1 12.3 10.1 12.5C10.1 12.7 10.1 12.9 10.2 13.1C9.8 14.8 8.3 16 6.6 16ZM16.8 16C15.1 16 13.6 14.8 13.2 13.1C13.3 12.9 13.3 12.7 13.3 12.5C13.3 12.3 13.3 12.1 13.2 11.9C13.6 10.2 15.1 9 16.8 9C18.8 9 20.4 10.6 20.4 12.5C20.4 14.4 18.8 16 16.8 16Z"
        fill="#0668E1"
      />
    </svg>
  );
}

// Official TikTok Logo SVG
function OfficialTikTokLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 003 15.67a6.34 6.34 0 0010.86 4.49A6.25 6.25 0 0015.86 16v-7a8.2 8.2 0 004.73 1.5v-3.4a4.92 4.92 0 01-1-.41z" />
    </svg>
  );
}

// Official Google Ads Logo SVG
function OfficialGoogleAdsLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3.77 15.83L9.5 5.91C10.27 4.58 11.97 4.12 13.3 4.89L15.3 6.05C16.63 6.82 17.09 8.52 16.32 9.85L10.59 19.77C9.82 21.1 8.12 21.56 6.79 20.79L4.79 19.63C3.46 18.86 3 17.16 3.77 15.83Z"
        fill="#F9BC05"
      />
      <path
        d="M20.23 15.83L14.5 5.91C13.73 4.58 12.03 4.12 10.7 4.89L8.7 6.05C7.37 6.82 6.91 8.52 7.68 9.85L13.41 19.77C14.18 21.1 15.88 21.56 17.21 20.79L19.21 19.63C20.54 18.86 21 17.16 20.23 15.83Z"
        fill="#4285F4"
      />
      <circle cx="6.5" cy="18.5" r="3.5" fill="#34A853" />
    </svg>
  );
}

export function MarketingPixelsManager({ username }: MarketingPixelsManagerProps) {
  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");

  const [savedMetaId, setSavedMetaId] = useState("");
  const [savedTiktokId, setSavedTiktokId] = useState("");
  const [savedGoogleAdsId, setSavedGoogleAdsId] = useState("");

  const [savingMeta, setSavingMeta] = useState(false);
  const [savingTiktok, setSavingTiktok] = useState(false);
  const [savingGoogleAds, setSavingGoogleAds] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load existing pixel configuration from Supabase profiles & localStorage
  useEffect(() => {
    async function loadPixels() {
      try {
        let meta = "";
        let tiktok = "";
        let gads = "";

        // 1. Try local storage first for immediate client feedback
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("feedmee_marketing_pixels");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              meta = parsed.metaPixelId || "";
              tiktok = parsed.tiktokPixelId || "";
              gads = parsed.googleAdsId || parsed.gaMeasurementId || "";
            } catch (e) {}
          }
        }

        // 2. Fetch from Supabase profiles table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("meta_pixel_id, tiktok_pixel_id, google_ads_id")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            if (data.meta_pixel_id !== undefined && data.meta_pixel_id !== null) meta = data.meta_pixel_id;
            if (data.tiktok_pixel_id !== undefined && data.tiktok_pixel_id !== null) tiktok = data.tiktok_pixel_id;
            if (data.google_ads_id !== undefined && data.google_ads_id !== null) gads = data.google_ads_id;
          }
        }

        setMetaPixelId(meta);
        setSavedMetaId(meta);

        setTiktokPixelId(tiktok);
        setSavedTiktokId(tiktok);

        setGoogleAdsId(gads);
        setSavedGoogleAdsId(gads);
      } catch (err) {
        console.error("[Pixels Load Error]:", err);
      }
    }

    loadPixels();
  }, [username]);

  // Helper to sync local cache
  const updateLocalCache = (meta: string, tiktok: string, gads: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "feedmee_marketing_pixels",
        JSON.stringify({
          metaPixelId: meta,
          tiktokPixelId: tiktok,
          googleAdsId: gads,
        })
      );
    }
  };

  // 1. Save Meta Pixel
  const handleSaveMeta = async () => {
    setSavingMeta(true);
    setToastMsg(null);
    const cleanMeta = metaPixelId.trim();

    try {
      updateLocalCache(cleanMeta, savedTiktokId, savedGoogleAdsId);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ meta_pixel_id: cleanMeta || null })
          .eq("id", user.id);
      }

      setSavedMetaId(cleanMeta);
      setToastMsg({
        type: "success",
        text: cleanMeta ? "Meta Pixel saved and active!" : "Meta Pixel removed.",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error("[Meta Save Error]:", err);
      setToastMsg({ type: "error", text: "Failed to save Meta Pixel." });
    } finally {
      setSavingMeta(false);
    }
  };

  // 2. Save TikTok Pixel
  const handleSaveTiktok = async () => {
    setSavingTiktok(true);
    setToastMsg(null);
    const cleanTiktok = tiktokPixelId.trim();

    try {
      updateLocalCache(savedMetaId, cleanTiktok, savedGoogleAdsId);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ tiktok_pixel_id: cleanTiktok || null })
          .eq("id", user.id);
      }

      setSavedTiktokId(cleanTiktok);
      setToastMsg({
        type: "success",
        text: cleanTiktok ? "TikTok Pixel saved and active!" : "TikTok Pixel removed.",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error("[TikTok Save Error]:", err);
      setToastMsg({ type: "error", text: "Failed to save TikTok Pixel." });
    } finally {
      setSavingTiktok(false);
    }
  };

  // 3. Save Google Ads Pixel
  const handleSaveGoogleAds = async () => {
    setSavingGoogleAds(true);
    setToastMsg(null);
    const cleanGads = googleAdsId.trim();

    try {
      updateLocalCache(savedMetaId, savedTiktokId, cleanGads);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ google_ads_id: cleanGads || null })
          .eq("id", user.id);
      }

      setSavedGoogleAdsId(cleanGads);
      setToastMsg({
        type: "success",
        text: cleanGads ? "Google Ads Pixel saved and active!" : "Google Ads Pixel removed.",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error("[Google Ads Save Error]:", err);
      setToastMsg({ type: "error", text: "Failed to save Google Ads Pixel." });
    } finally {
      setSavingGoogleAds(false);
    }
  };

  return (
    <div className="w-full max-w-none flex-1 flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-extrabold ${
              toastMsg.type === "success"
                ? "bg-zinc-950 text-white border-emerald-500/40"
                : "bg-rose-900 text-white border-rose-500/40"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Container Card (Identical layout container width & padding as CRM & Analytics) */}
      <div className="w-full bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {/* Top Header Banner */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-zinc-950 tracking-tight">Marketing &amp; Tracking Pixels</h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Connect your advertising accounts to track visitor actions, build custom audiences, and measure ad performance automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body: 3 Cards */}
        <div className="p-6 space-y-6">
          {/* ======================================================== */}
          {/* CARD 1: Meta (Facebook & Instagram) Pixel */}
          {/* ======================================================== */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <OfficialMetaLogo className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">Meta (Facebook &amp; Instagram) Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium">Track page views, lead submissions, and contact link clicks</p>
                </div>
              </div>
              <div>
                {savedMetaId.trim() ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Tracking Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs font-semibold">
                    Not Configured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">Meta Pixel ID</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <Button
                  onClick={handleSaveMeta}
                  disabled={savingMeta}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-5 rounded-xl shadow-xs shrink-0 cursor-pointer gap-1.5"
                >
                  {savingMeta ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    <Save className="h-3.5 w-3.5 text-white" />
                  )}
                  <span>Save Meta Pixel</span>
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Where to find it: Meta Events Manager ➔ Data Sources ➔ Pixel ID.</span>
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CARD 2: TikTok Pixel */}
          {/* ======================================================== */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <OfficialTikTokLogo className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">TikTok Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium">Capture video bio conversions and TikTok ad event data</p>
                </div>
              </div>
              <div>
                {savedTiktokId.trim() ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Tracking Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs font-semibold">
                    Not Configured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">TikTok Pixel ID</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={tiktokPixelId}
                  onChange={(e) => setTiktokPixelId(e.target.value)}
                  placeholder="e.g. C1234567890ABCDEF"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <Button
                  onClick={handleSaveTiktok}
                  disabled={savingTiktok}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-5 rounded-xl shadow-xs shrink-0 cursor-pointer gap-1.5"
                >
                  {savingTiktok ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    <Save className="h-3.5 w-3.5 text-white" />
                  )}
                  <span>Save TikTok Pixel</span>
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Where to find it: TikTok Ads Manager ➔ Assets ➔ Events ➔ Web Events.</span>
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CARD 3: Google Ads Pixel */}
          {/* ======================================================== */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <OfficialGoogleAdsLogo className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">Google Ads Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium">Track Search &amp; Display campaign conversions and remarketing lists</p>
                </div>
              </div>
              <div>
                {savedGoogleAdsId.trim() ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Tracking Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs font-semibold">
                    Not Configured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">Google Ads Conversion ID</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={googleAdsId}
                  onChange={(e) => setGoogleAdsId(e.target.value)}
                  placeholder="e.g. AW-123456789"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <Button
                  onClick={handleSaveGoogleAds}
                  disabled={savingGoogleAds}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-5 rounded-xl shadow-xs shrink-0 cursor-pointer gap-1.5"
                >
                  {savingGoogleAds ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    <Save className="h-3.5 w-3.5 text-white" />
                  )}
                  <span>Save Google Ads Pixel</span>
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Where to find it: Google Ads ➔ Goals ➔ Conversions ➔ Summary ➔ Tag Setup (Conversion ID).</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
