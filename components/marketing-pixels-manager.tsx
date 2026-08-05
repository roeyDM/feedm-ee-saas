"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  CheckCircle2,
  Save,
  Loader2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface MarketingPixelsManagerProps {
  username?: string;
}

// Official Meta Infinity Logo SVG
function MetaLogoSvg({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 4.5C7.2 4.5 3.5 7.6 3.5 12C3.5 16.4 7.2 19.5 12 19.5C14.8 19.5 17.3 18.2 18.9 16.2L16.7 14.5C15.6 16 13.9 17 12 17C8.7 17 6 14.8 6 12C6 9.2 8.7 7 12 7C14 7 15.7 8.1 16.8 9.7L18.9 8C17.3 5.9 14.8 4.5 12 4.5Z" />
      <path d="M16.5 12C16.5 10.9 17.4 10 18.5 10C19.6 10 20.5 10.9 20.5 12C20.5 13.1 19.6 14 18.5 14C17.4 14 16.5 13.1 16.5 12Z" />
    </svg>
  );
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

// Official Google Analytics Logo SVG
function OfficialGALogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M22.5 19.5V17.25C22.5 16.0074 21.4926 15 20.25 15H17.25C16.0074 15 15 16.0074 15 17.25V19.5H22.5Z" fill="#F9AB00" />
      <path d="M13.5 19.5V9.75C13.5 8.50736 12.4926 7.5 11.25 7.5H8.25C7.00736 7.5 6 8.50736 6 9.75V19.5H13.5Z" fill="#E37400" />
      <path d="M4.5 19.5V2.25C4.5 1.00736 3.49264 0 2.25 0H1.5V19.5H4.5Z" fill="#E37400" />
      <circle cx="3" cy="21" r="3" fill="#F9AB00" />
      <circle cx="12" cy="21" r="3" fill="#E37400" />
      <circle cx="21" cy="21" r="3" fill="#F9AB00" />
    </svg>
  );
}

export function MarketingPixelsManager({ username }: MarketingPixelsManagerProps) {
  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [gaMeasurementId, setGaMeasurementId] = useState("");

  const [savedMetaId, setSavedMetaId] = useState("");
  const [savedTiktokId, setSavedTiktokId] = useState("");
  const [savedGaId, setSavedGaId] = useState("");

  const [savingMeta, setSavingMeta] = useState(false);
  const [savingTiktok, setSavingTiktok] = useState(false);
  const [savingGa, setSavingGa] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load existing pixel configuration from Supabase profiles & localStorage
  useEffect(() => {
    async function loadPixels() {
      try {
        let meta = "";
        let tiktok = "";
        let ga = "";

        // 1. Try local storage first
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("feedmee_marketing_pixels");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              meta = parsed.metaPixelId || "";
              tiktok = parsed.tiktokPixelId || "";
              ga = parsed.gaMeasurementId || "";
            } catch (e) {}
          }
        }

        // 2. Fetch from Supabase profiles table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("meta_pixel_id, tiktok_pixel_id, ga_measurement_id")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            if (data.meta_pixel_id !== undefined) meta = data.meta_pixel_id || "";
            if (data.tiktok_pixel_id !== undefined) tiktok = data.tiktok_pixel_id || "";
            if (data.ga_measurement_id !== undefined) ga = data.ga_measurement_id || "";
          }
        }

        setMetaPixelId(meta);
        setSavedMetaId(meta);

        setTiktokPixelId(tiktok);
        setSavedTiktokId(tiktok);

        setGaMeasurementId(ga);
        setSavedGaId(ga);
      } catch (err) {
        console.error("[Pixels Load Error]:", err);
      }
    }

    loadPixels();
  }, [username]);

  // Helper to sync local cache
  const updateLocalCache = (meta: string, tiktok: string, ga: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "feedmee_marketing_pixels",
        JSON.stringify({
          metaPixelId: meta,
          tiktokPixelId: tiktok,
          gaMeasurementId: ga,
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
      updateLocalCache(cleanMeta, savedTiktokId, savedGaId);

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
      updateLocalCache(savedMetaId, cleanTiktok, savedGaId);

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

  // 3. Save GA4 Measurement ID
  const handleSaveGa = async () => {
    setSavingGa(true);
    setToastMsg(null);
    const cleanGa = gaMeasurementId.trim();

    try {
      updateLocalCache(savedMetaId, savedTiktokId, cleanGa);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ ga_measurement_id: cleanGa || null })
          .eq("id", user.id);
      }

      setSavedGaId(cleanGa);
      setToastMsg({
        type: "success",
        text: cleanGa ? "Google Analytics 4 ID saved and active!" : "GA4 ID removed.",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error("[GA4 Save Error]:", err);
      setToastMsg({ type: "error", text: "Failed to save GA4 ID." });
    } finally {
      setSavingGa(false);
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

      {/* Main Container Card (100% Full Width matching CRM & Analytics) */}
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

        {/* Content Body: 3 Structured Cards with Individual Save Buttons & Dynamic Status Badges */}
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
          {/* CARD 3: Google Analytics 4 (GA4) */}
          {/* ======================================================== */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <OfficialGALogo className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">Google Analytics 4 (GA4)</h3>
                  <p className="text-xs text-zinc-500 font-medium">Stream real visitor demographics, device types, and custom events</p>
                </div>
              </div>
              <div>
                {savedGaId.trim() ? (
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
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">GA4 Measurement ID</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={gaMeasurementId}
                  onChange={(e) => setGaMeasurementId(e.target.value)}
                  placeholder="e.g. G-XXXXXXXXXX"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <Button
                  onClick={handleSaveGa}
                  disabled={savingGa}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-5 rounded-xl shadow-xs shrink-0 cursor-pointer gap-1.5"
                >
                  {savingGa ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    <Save className="h-3.5 w-3.5 text-white" />
                  )}
                  <span>Save GA4 ID</span>
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Where to find it: Google Analytics Admin ➔ Data Streams ➔ Measurement ID.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
