"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  CheckCircle2,
  Save,
  Loader2,
  HelpCircle,
  Trash2,
  AlertTriangle,
  Lock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { SectionHelp } from "@/components/ui/section-help";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { UpgradeModal } from "@/components/upgrade-modal";

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
  const { canAccess } = useFeatureAccess();
  const hasMarketingPixels = canAccess("hasMarketingPixels");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");

  const [savedMetaId, setSavedMetaId] = useState("");
  const [savedTiktokId, setSavedTiktokId] = useState("");
  const [savedGoogleAdsId, setSavedGoogleAdsId] = useState("");

  const [savingMeta, setSavingMeta] = useState(false);
  const [savingTiktok, setSavingTiktok] = useState(false);
  const [savingGoogleAds, setSavingGoogleAds] = useState(false);

  const [confirmDisconnectPlatform, setConfirmDisconnectPlatform] = useState<"meta" | "tiktok" | "google" | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load existing pixel configuration strictly from Supabase profiles for authenticated user.id
  useEffect(() => {
    async function loadPixels() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          setMetaPixelId("");
          setSavedMetaId("");
          setTiktokPixelId("");
          setSavedTiktokId("");
          setGoogleAdsId("");
          setSavedGoogleAdsId("");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("meta_pixel_id, facebook_pixel_id, tiktok_pixel_id, google_ads_id, google_pixel_id, ga_measurement_id")
          .eq("id", user.id)
          .maybeSingle();

        const sanitizePixel = (val: any) => {
          if (!val || typeof val !== "string") return "";
          const trimmed = val.trim();
          if (
            trimmed === "123456789012345" ||
            trimmed === "1564193897126475" ||
            trimmed === "AW-752532101" ||
            trimmed === "C1234567890ABCDEF" ||
            trimmed === "AW-123456789"
          ) {
            return "";
          }
          return trimmed;
        };

        let meta = "";
        let tiktok = "";
        let gads = "";

        if (profile && !error) {
          meta = sanitizePixel(profile.meta_pixel_id || profile.facebook_pixel_id);
          tiktok = sanitizePixel(profile.tiktok_pixel_id);
          gads = sanitizePixel(profile.google_ads_id || profile.google_pixel_id || profile.ga_measurement_id);
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

  // Unified function to save pixels strictly to authenticated user's profile
  const savePixelsToSupabase = async (meta: string, tiktok: string, gads: string) => {
    const cleanMeta = meta.trim();
    const cleanTiktok = tiktok.trim();
    const cleanGads = gads.trim();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.id) {
      alert("Authentication error: Please log in to update marketing pixels.");
      return;
    }

    console.log("Updating profiles for user ID:", user.id, "meta_pixel_id:", cleanMeta);

    const updatePayload = {
      meta_pixel_id: cleanMeta || null,
      tiktok_pixel_id: cleanTiktok || null,
      google_ads_id: cleanGads || null,
      ga_measurement_id: cleanGads || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select();

    if (error) {
      console.error("Supabase Pixel Update Error:", error);
      alert(`Supabase Error (${error.code || "UNKNOWN"}): ${error.message}`);
      throw error;
    }

    setSavedMetaId(cleanMeta);
    setSavedTiktokId(cleanTiktok);
    setSavedGoogleAdsId(cleanGads);

    return data;
  };

  // 1. Save Meta Pixel
  const handleSaveMeta = async () => {
    setSavingMeta(true);
    setToastMsg(null);
    try {
      await savePixelsToSupabase(metaPixelId, savedTiktokId, savedGoogleAdsId);
      setToastMsg({
        type: "success",
        text: metaPixelId.trim() ? "Meta Pixel saved successfully!" : "Meta Pixel removed.",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error("Unexpected error during Meta Pixel save:", err);
    } finally {
      setSavingMeta(false);
    }
  };

  // 2. Save TikTok Pixel
  const handleSaveTiktok = async () => {
    setSavingTiktok(true);
    setToastMsg(null);
    try {
      await savePixelsToSupabase(savedMetaId, tiktokPixelId, savedGoogleAdsId);
      setToastMsg({
        type: "success",
        text: tiktokPixelId.trim() ? "TikTok Pixel saved successfully!" : "TikTok Pixel removed.",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error("Unexpected error during TikTok Pixel save:", err);
    } finally {
      setSavingTiktok(false);
    }
  };

  // 3. Save Google Ads Pixel
  const handleSaveGoogleAds = async () => {
    setSavingGoogleAds(true);
    setToastMsg(null);
    try {
      await savePixelsToSupabase(savedMetaId, savedTiktokId, googleAdsId);
      setToastMsg({
        type: "success",
        text: googleAdsId.trim() ? "Google Ads Pixel saved successfully!" : "Google Ads Pixel removed.",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error("Unexpected error during Google Ads save:", err);
    } finally {
      setSavingGoogleAds(false);
    }
  };

  // Safe Disconnect Handler
  const handleDisconnectPixel = async (platform: "meta" | "tiktok" | "google") => {
    setIsDisconnecting(true);
    setToastMsg(null);

    const newMeta = platform === "meta" ? "" : savedMetaId;
    const newTiktok = platform === "tiktok" ? "" : savedTiktokId;
    const newGads = platform === "google" ? "" : savedGoogleAdsId;

    try {
      await savePixelsToSupabase(newMeta, newTiktok, newGads);

      if (platform === "meta") setMetaPixelId("");
      if (platform === "tiktok") setTiktokPixelId("");
      if (platform === "google") setGoogleAdsId("");

      setConfirmDisconnectPlatform(null);
      setToastMsg({
        type: "success",
        text: "Pixel removed successfully",
      });
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error(`[${platform} Disconnect Error]:`, err);
      alert(`Failed to disconnect pixel: ${err?.message || "Error"}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="w-full max-w-none flex-1 flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      {/* Universal Upgrade Modal */}
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />

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

      {/* Main Container Card */}
      <div className="w-full bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">

        {/* Top Header Banner (Clean Header - No Top Summary Save Button) */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-zinc-950 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                  MARKETING PIXELS
                  <SectionHelp text="Connect your advertising accounts to track visitor actions, build custom audiences, and measure ad performance automatically." />
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Live Engine
                </span>
              </div>
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
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <OfficialMetaLogo className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-950 truncate whitespace-nowrap">Meta (Facebook &amp; Instagram) Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium hidden md:block">Track page views, lead submissions, and contact link clicks</p>
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
                <div className="flex items-center gap-2 shrink-0">
                  {savedMetaId.trim() ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmDisconnectPlatform(confirmDisconnectPlatform === "meta" ? null : "meta")}
                      className="h-10 px-3 border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-extrabold rounded-xl gap-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={handleSaveMeta}
                    disabled={savingMeta}
                    className="w-32 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 rounded-xl shadow-xs shrink-0 cursor-pointer gap-1.5 flex items-center justify-center"
                  >
                    {savingMeta ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    ) : (
                      <Save className="h-3.5 w-3.5 text-white" />
                    )}
                    <span>Save Pixel</span>
                  </Button>
                </div>
              </div>

              {/* Inline Confirm Disconnect Popup */}
              {confirmDisconnectPlatform === "meta" && (
                <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                  <span className="font-extrabold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    Are you sure you want to disconnect Meta Pixel?
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDisconnectPlatform(null)}
                      className="h-8 px-3 text-xs font-bold text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDisconnectPixel("meta")}
                      disabled={isDisconnecting}
                      className="h-8 px-3 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer gap-1"
                    >
                      {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, Disconnect"}
                    </Button>
                  </div>
                </div>
              )}

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
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <OfficialTikTokLogo className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-950 truncate whitespace-nowrap">TikTok Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium hidden md:block">Capture video bio conversions and TikTok ad event data</p>
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
                <div className="flex items-center gap-2 shrink-0">
                  {savedTiktokId.trim() ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmDisconnectPlatform(confirmDisconnectPlatform === "tiktok" ? null : "tiktok")}
                      className="h-10 px-3 border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-extrabold rounded-xl gap-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={handleSaveTiktok}
                    disabled={savingTiktok}
                    className="w-32 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 rounded-xl shadow-xs shrink-0 cursor-pointer gap-1.5 flex items-center justify-center"
                  >
                    {savingTiktok ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    ) : (
                      <Save className="h-3.5 w-3.5 text-white" />
                    )}
                    <span>Save Pixel</span>
                  </Button>
                </div>
              </div>

              {/* Inline Confirm Disconnect Popup */}
              {confirmDisconnectPlatform === "tiktok" && (
                <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                  <span className="font-extrabold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    Are you sure you want to disconnect TikTok Pixel?
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDisconnectPlatform(null)}
                      className="h-8 px-3 text-xs font-bold text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDisconnectPixel("tiktok")}
                      disabled={isDisconnecting}
                      className="h-8 px-3 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer gap-1"
                    >
                      {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, Disconnect"}
                    </Button>
                  </div>
                </div>
              )}

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
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <OfficialGoogleAdsLogo className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-950 truncate whitespace-nowrap">Google Ads Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium hidden md:block">Track Search &amp; Display campaign conversions and remarketing lists</p>
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
                <div className="flex items-center gap-2 shrink-0">
                  {savedGoogleAdsId.trim() ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmDisconnectPlatform(confirmDisconnectPlatform === "google" ? null : "google")}
                      className="h-10 px-3 border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-extrabold rounded-xl gap-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={handleSaveGoogleAds}
                    disabled={savingGoogleAds}
                    className="w-32 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 rounded-xl shadow-xs shrink-0 cursor-pointer gap-1.5 flex items-center justify-center"
                  >
                    {savingGoogleAds ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    ) : (
                      <Save className="h-3.5 w-3.5 text-white" />
                    )}
                    <span>Save Pixel</span>
                  </Button>
                </div>
              </div>

              {/* Inline Confirm Disconnect Popup */}
              {confirmDisconnectPlatform === "google" && (
                <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                  <span className="font-extrabold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    Are you sure you want to disconnect Google Ads Pixel?
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDisconnectPlatform(null)}
                      className="h-8 px-3 text-xs font-bold text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDisconnectPixel("google")}
                      disabled={isDisconnecting}
                      className="h-8 px-3 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer gap-1"
                    >
                      {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, Disconnect"}
                    </Button>
                  </div>
                </div>
              )}

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
