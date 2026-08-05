"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Globe,
  Video,
  BarChart2,
  CheckCircle2,
  Info,
  Save,
  Loader2,
  Sparkles,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface MarketingPixelsManagerProps {
  username?: string;
}

export function MarketingPixelsManager({ username }: MarketingPixelsManagerProps) {
  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load existing pixel configuration from Supabase profiles or localStorage
  useEffect(() => {
    async function loadPixels() {
      setLoading(true);
      try {
        // 1. Try local storage first for instant feedback
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("feedmee_marketing_pixels");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.metaPixelId) setMetaPixelId(parsed.metaPixelId);
              if (parsed.tiktokPixelId) setTiktokPixelId(parsed.tiktokPixelId);
              if (parsed.gaMeasurementId) setGaMeasurementId(parsed.gaMeasurementId);
            } catch (e) {
              console.warn("[Pixels Cache Error]:", e);
            }
          }
        }

        // 2. Fetch authoritative values from Supabase profiles
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("meta_pixel_id, tiktok_pixel_id, ga_measurement_id")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            if (data.meta_pixel_id) setMetaPixelId(data.meta_pixel_id);
            if (data.tiktok_pixel_id) setTiktokPixelId(data.tiktok_pixel_id);
            if (data.ga_measurement_id) setGaMeasurementId(data.ga_measurement_id);
          }
        }
      } catch (err) {
        console.error("[Pixels Load Error]:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPixels();
  }, [username]);

  // Save pixel configuration to Supabase & localStorage
  const handleSavePixels = async () => {
    setSaving(true);
    setToastMsg(null);

    const cleanMeta = metaPixelId.trim();
    const cleanTiktok = tiktokPixelId.trim();
    const cleanGa = gaMeasurementId.trim();

    try {
      // Save locally
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "feedmee_marketing_pixels",
          JSON.stringify({
            metaPixelId: cleanMeta,
            tiktokPixelId: cleanTiktok,
            gaMeasurementId: cleanGa,
          })
        );
      }

      // Save to Supabase DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            meta_pixel_id: cleanMeta || null,
            tiktok_pixel_id: cleanTiktok || null,
            ga_measurement_id: cleanGa || null,
          })
          .eq("id", user.id);

        if (error) {
          console.warn("[Supabase Pixels Save Warning]:", error.message);
        }
      }

      setToastMsg({
        type: "success",
        text: "Pixel configuration saved successfully! Live tracking is active.",
      });
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error("[Pixels Save Error]:", err);
      setToastMsg({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-none flex-1 flex flex-col gap-6 animate-in fade-in duration-300 font-sans pb-16">
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
        {/* Header & Explanation */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-zinc-950 tracking-tight">Marketing &amp; Tracking Pixels</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Pro Engine
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Connect your advertising accounts to track visitor actions, build custom audiences, and measure ad performance automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body: 3 Benchmark Pixel Cards */}
        <div className="p-6 space-y-6">
          {/* CARD 1: Meta (Facebook & Instagram) Pixel */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">Meta (Facebook &amp; Instagram) Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium">Track page views, lead submissions, and contact clicks</p>
                </div>
              </div>
              <div>
                {metaPixelId.trim() ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active / Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs font-medium">
                    Not Configured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">Meta Pixel ID</label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="e.g. 123456789012345"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-1">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Where to find it: Meta Events Manager ➔ Data Sources ➔ Pixel ID.</span>
              </p>
            </div>
          </div>

          {/* CARD 2: TikTok Pixel */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-center font-bold text-sm shrink-0">
                  <Video className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">TikTok Pixel</h3>
                  <p className="text-xs text-zinc-500 font-medium">Capture video bio conversions and TikTok ad event data</p>
                </div>
              </div>
              <div>
                {tiktokPixelId.trim() ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active / Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs font-medium">
                    Not Configured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">TikTok Pixel ID</label>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="e.g. C1234567890ABCDEF"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-1">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Where to find it: TikTok Ads Manager ➔ Assets ➔ Events ➔ Web Events.</span>
              </p>
            </div>
          </div>

          {/* CARD 3: Google Analytics 4 (GA4) */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold text-sm shrink-0">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">Google Analytics 4 (GA4)</h3>
                  <p className="text-xs text-zinc-500 font-medium">Stream real visitor demographics, device types, and custom events</p>
                </div>
              </div>
              <div>
                {gaMeasurementId.trim() ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active / Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 text-xs font-medium">
                    Not Configured
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">GA4 Measurement ID</label>
              <input
                type="text"
                value={gaMeasurementId}
                onChange={(e) => setGaMeasurementId(e.target.value)}
                placeholder="e.g. G-XXXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-1">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>Where to find it: Google Analytics Admin ➔ Data Streams ➔ Measurement ID.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Save Action Bar */}
        <div className="p-5 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Pixels automatically fire PageView, Lead, and Contact events on your public feed.</span>
          </div>

          <Button
            onClick={handleSavePixels}
            disabled={saving}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-11 px-8 rounded-xl shadow-md transition-all gap-2 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Save className="h-4 w-4 text-white" />
            )}
            <span>Save Pixel Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
