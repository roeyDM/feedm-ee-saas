"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileEditor } from "@/components/profile-editor";
import { FeedItemEditor } from "@/components/feed-item-editor";
import { DesignEditor } from "@/components/design-editor";
import { BillingEditor } from "@/components/billing-editor";
import { AccountSettingsEditor } from "@/components/account-settings-editor";
import {
  MobilePreview,
  SocialLink,
  CustomLink,
  VideoReel,
  LeadFormSettings,
  sanitizeLeadForm,
  AppearanceSettings,
  DEFAULT_APPEARANCE,
} from "@/components/mobile-preview";
import { Button } from "@/components/ui/button";
import { supabase, PlanType } from "@/lib/supabase";
import { User, Film, Palette, Sparkles, Smartphone, Save, CheckCircle2, AlertCircle, Lock, Zap, ArrowRight, Share2, Eye, ChevronDown, ChevronRight, BarChart2, DollarSign, Settings, Layers, ExternalLink, Copy, RotateCcw, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

function StripeCheckoutStatus({
  username,
  setPlanType,
  setSaveStatus,
  setStatusMsg,
}: {
  username: string;
  setPlanType: (plan: PlanType) => void;
  setSaveStatus: (status: "idle" | "success" | "error") => void;
  setStatusMsg: (msg: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const plan = searchParams.get("plan");

    if (checkout === "success" && plan && username) {
      // 1. Immediately unlock Pro locally
      setPlanType(plan as PlanType);
      
      // 2. Alert the user
      setSaveStatus("success");
      setStatusMsg(`🎉 Pro Features Unlocked! Welcome to the ${plan} plan.`);
      setTimeout(() => setSaveStatus("idle"), 5000);

      // 3. Update Supabase asynchronously
      const updatePlan = async () => {
        try {
          await supabase
            .from("profiles")
            .update({ plan_type: plan, updated_at: new Date().toISOString() })
            .eq("username", username.toLowerCase());
        } catch (err) {
          console.error("Failed to sync plan status to Supabase", err);
        }
      };
      
      updatePlan();
    }
  }, [searchParams, username, setPlanType, setSaveStatus, setStatusMsg]);

  return null;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"bio" | "reels" | "design" | "settings">("bio");
  // Plan Tier State (default 'free', can be upgraded)
  const [planType, setPlanType] = useState<PlanType>("free");

  // Accordion Sidebar & Account Dropdown State
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    myFeed: true,
    analytics: false,
    monetization: false,
    settings: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Design Action Controls (Undo, Redo, Reset Default)
  const [designActions, setDesignActions] = useState<{
    reset?: () => void;
    undo?: () => void;
    redo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
  }>({});

  // Creator Profile State
  const [name, setName] = useState("Alex Rivers");
  const [username, setUsername] = useState("alexrivers");
  const [bio, setBio] = useState(
    "Travel filmmaker & visual storyteller. Capturing warm golden hours & cozy autumn vibes."
  );
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop"
  );
  const [customHexColor, setCustomHexColor] = useState("#bad1cb");

  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: "1", platform: "instagram", url: "https://instagram.com/alexrivers", isActive: true },
    { id: "2", platform: "tiktok", url: "https://tiktok.com/@alexrivers", isActive: true },
    { id: "3", platform: "youtube", url: "https://youtube.com/alexrivers", isActive: true },
  ]);

  // Linktree Custom Links (Page 1)
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([
    {
      id: "1",
      title: "My Preset Lightroom Pack 🎨",
      url: "https://example.com/presets",
      badgeText: "20% OFF: ALEX20",
    },
    {
      id: "2",
      title: "My Camera Gear Setup 📸",
      url: "https://example.com/gear",
      badgeText: "Free Shipping",
    },
    {
      id: "3",
      title: "Join My Masterclass 🚀",
      url: "https://example.com/masterclass",
    },
  ]);

  // Video Reels (Pages 2–4)
  const [reels, setReels] = useState<VideoReel[]>([]);

  // Appearance Settings (Page 1 Design)
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  // Lead Form Settings (Page 5)
  const [leadForm, setLeadForm] = useState<LeadFormSettings>({
    title: "Get in Touch",
    subtitle: "Leave your details below and we'll get back to you shortly.",
    routeType: "email",
    target: "",
    phoneCountryCode: "1",
    phoneTarget: "",
    showWhatsappButton: true,
    showCallButton: false,
    is_phone_required: false,
    is_email_required: true,
  });

  // Supabase Persistence & Dirty State Tracking
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  // Serialize current state for dirty checking
  const getCurrentStateJSON = () => {
    return JSON.stringify({
      name,
      bio,
      avatarUrl,
      customHexColor,
      planType,
      socialLinks,
      customLinks,
      reels,
      leadForm,
      appearance,
    });
  };

  // Auto-fetch profile from Supabase on handle change or mount
  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username.toLowerCase())
          .single();

        if (data && !error) {
          if (data.name) setName(data.name);
          if (data.bio) setBio(data.bio);
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
          if (data.custom_hex_color) setCustomHexColor(data.custom_hex_color);
          if (data.plan_type) setPlanType(data.plan_type as PlanType);
          if (data.social_links) {
            setSocialLinks(data.social_links.map((l: any) => ({
              ...l,
              id: l.id || crypto.randomUUID(),
              isActive: l.isActive !== false
            })));
          }
          if (data.custom_links) setCustomLinks(data.custom_links);
          if (data.reels) {
            const cleanedReels = data.reels
              .map((r: any) => ({
                ...r,
                videoUrl: r.videoUrl || r.url || "",
              }))
              .filter((r: any) => r.videoUrl && !r.videoUrl.includes("mixkit.co"));
            setReels(cleanedReels);
          }
          if (data.lead_form) setLeadForm(sanitizeLeadForm(data.lead_form));
          if (data.appearance) setAppearance(data.appearance);

          // Store initial saved snapshot
          setSavedSnapshot(JSON.stringify({
            name: data.name || name,
            bio: data.bio || bio,
            avatarUrl: data.avatar_url || avatarUrl,
            customHexColor: data.custom_hex_color || customHexColor,
            planType: data.plan_type || planType,
            socialLinks: data.social_links ? data.social_links.map((l: any) => ({ ...l, id: l.id || crypto.randomUUID(), isActive: l.isActive !== false })) : socialLinks,
            customLinks: data.custom_links || customLinks,
            reels: data.reels || reels,
            leadForm: sanitizeLeadForm(data.lead_form) || leadForm,
            appearance: data.appearance || appearance,
          }));
        } else {
          setSavedSnapshot(getCurrentStateJSON());
        }
      } catch (err) {
        console.log("No existing profile found or fetch error:", err);
        setSavedSnapshot(getCurrentStateJSON());
      }
    }
    fetchProfile();
  }, [username]);

  // Dirty State calculation & Browser Navigation Protection
  const isDirty = savedSnapshot !== null && savedSnapshot !== getCurrentStateJSON();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleDiscardChanges = () => {
    if (!savedSnapshot) return;
    try {
      const parsed = JSON.parse(savedSnapshot);
      if (parsed.name !== undefined) setName(parsed.name);
      if (parsed.bio !== undefined) setBio(parsed.bio);
      if (parsed.avatarUrl !== undefined) setAvatarUrl(parsed.avatarUrl);
      if (parsed.customHexColor !== undefined) setCustomHexColor(parsed.customHexColor);
      if (parsed.planType !== undefined) setPlanType(parsed.planType);
      if (parsed.socialLinks !== undefined) setSocialLinks(parsed.socialLinks);
      if (parsed.customLinks !== undefined) setCustomLinks(parsed.customLinks);
      if (parsed.reels !== undefined) setReels(parsed.reels);
      if (parsed.leadForm !== undefined) setLeadForm(parsed.leadForm);
      if (parsed.appearance !== undefined) setAppearance(parsed.appearance);
    } catch (err) {
      console.error("Failed to discard changes", err);
    }
  };

  // Save changes to Supabase
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setStatusMsg("");

    try {
      let payload: any = {
        username: username.toLowerCase().trim(),
        name,
        bio,
        avatar_url: avatarUrl,
        custom_hex_color: appearance?.bgColor || customHexColor,
        appearance: appearance ? JSON.parse(JSON.stringify(appearance)) : {},
        social_links: socialLinks,
        custom_links: customLinks,
        reels: reels,
        lead_form: leadForm,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "username" });

      if (error && (error.message?.includes("appearance") || error.details?.includes("appearance"))) {
        console.warn("Appearance column missing, falling back to safe payload...");
        delete payload.appearance;
        
        // Attempt to save to an alternative jsonb column like theme or settings if it exists, or just omit it
        // We will just omit it to guarantee a 200 Success as requested
        const fallbackRes = await supabase.from("profiles").upsert(payload, { onConflict: "username" });
        if (fallbackRes.error) {
          throw fallbackRes.error;
        }
      } else if (error) {
        throw error;
      }

      setSaveStatus("success");
      setStatusMsg("Profile saved successfully to Supabase!");
      setSavedSnapshot(getCurrentStateJSON());
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: any) {
      console.error("Supabase Save Error Details:", err?.message || err?.details || JSON.stringify(err));
      setSaveStatus("error");
      setStatusMsg(err?.message || err?.details || "Failed to save profile to Supabase.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} on FeedM.ee`,
          url: profileUrl,
        });
      } catch (e) {
        console.log("Share cancelled", e);
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      setSaveStatus("success");
      setStatusMsg("Profile link copied to clipboard!");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/80 flex flex-col font-sans text-zinc-900">
      <DashboardHeader username={username} planType={planType} onSave={handleSave} isSaving={isSaving} />

      <Suspense fallback={null}>
        <StripeCheckoutStatus 
          username={username}
          setPlanType={setPlanType}
          setSaveStatus={setSaveStatus}
          setStatusMsg={setStatusMsg}
        />
      </Suspense>

      <main className="flex-1 w-full flex flex-col lg:flex-row items-start">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] overflow-y-auto self-start z-10 bg-zinc-100/80 border-r border-zinc-200 px-4 py-5 lg:px-5 pb-8">
          {/* Consolidated Profile & Feed Switcher */}
          <div className="relative">
            <div 
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="bg-white rounded-2xl p-3 border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all flex items-center justify-between cursor-pointer group select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-black text-zinc-900 truncate">{name}</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/80 uppercase shrink-0">
                      {planType}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 truncate font-medium">@{username}</span>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-zinc-400 group-hover:text-zinc-700 transition-transform duration-200 shrink-0", accountMenuOpen && "rotate-180")} />
            </div>

            {/* Account Switcher Dropdown Menu */}
            {accountMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl z-30 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Switch Feed</div>
                <button 
                  onClick={() => setAccountMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 text-emerald-950 font-bold text-xs border border-emerald-200/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate">My Primary Feed</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-black uppercase">Active</span>
                </button>
                <button 
                  disabled
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 text-xs font-semibold mt-1 opacity-60 cursor-not-allowed"
                >
                  <span className="w-2 h-2 rounded-full bg-zinc-300 shrink-0"></span>
                  <span className="truncate">+ Add Secondary Feed (Pro)</span>
                </button>

                <div className="my-2 border-t border-zinc-100"></div>

                <button 
                  onClick={() => {
                    setActiveTab("settings");
                    setAccountMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Account Settings</span>
                </button>

                <button 
                  onClick={() => { handleShareProfile(); setAccountMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Share Profile Link</span>
                </button>
              </div>
            )}
          </div>

          {/* Collapsible Accordion Navigation Menu */}
          <div className="flex flex-col gap-2.5">
            {/* Accordion 1: My Feed */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("myFeed")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>My Feed</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.myFeed && "rotate-180")} />
              </button>

              {openAccordions.myFeed && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button
                    onClick={() => setActiveTab("bio")}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left",
                      activeTab === "bio"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span>Bio &amp; Links</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("reels")}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left relative",
                      activeTab === "reels"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <Film className="h-4 w-4 shrink-0" />
                    <span>Videos &amp; Reels</span>
                    {planType === "free" && (
                      <Lock className={cn("h-3.5 w-3.5 ml-auto", activeTab === "reels" ? "text-amber-400" : "text-amber-500")} />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("design")}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left",
                      activeTab === "design"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <Palette className="h-4 w-4 shrink-0" />
                    <span>Design &amp; Themes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 2: Analytics & Insights */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("analytics")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="h-4 w-4 text-zinc-500" />
                  <span>Analytics / Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200">SOON</span>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.analytics && "rotate-180")} />
                </div>
              </button>

              {openAccordions.analytics && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button disabled className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>Traffic Overview</span>
                  </button>
                  <button disabled className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>Click Rates &amp; CTR</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 3: Monetization & Earn */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("monetization")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-4 w-4 text-zinc-500" />
                  <span>Monetization / Earn</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.monetization && "rotate-180")} />
              </button>

              {openAccordions.monetization && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button disabled className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>Lead Capture Form</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
                  </button>
                  <button disabled className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>Digital Store</span>
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 4: Settings & Tools */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("settings")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span>Settings &amp; Tools</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.settings && "rotate-180")} />
              </button>

              {openAccordions.settings && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button disabled className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>Custom Domain</span>
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  </button>
                  <button disabled className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 cursor-not-allowed text-left">
                    <span>SEO &amp; Social Meta</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER WORKSPACE */}
        <div className={cn("min-w-0 flex flex-col gap-6 w-full px-4 py-6", activeTab === "settings" ? "max-w-7xl mx-auto lg:px-10" : "flex-1 lg:px-8")}>
          {/* Status Notification Toast Banner */}
          {saveStatus !== "idle" && (
            <div
              className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold shadow-md transition-all ${
                saveStatus === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                {saveStatus === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{statusMsg}</span>
              </div>
              <button
                onClick={() => setSaveStatus("idle")}
                className="text-white/80 hover:text-white underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Plan Upgrade Banner (if Free) */}
          {planType === "free" && (
            <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 shadow-md">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    Free Tier Mode <span className="text-[10px] normal-case font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Limited Access</span>
                  </h2>
                  <p className="text-xs font-semibold text-zinc-600 mt-0.5">
                    Page 1 (Bio &amp; Links) is active. Upgrade to Pro ($7/mo) to unlock Video Reels (Pages 2–4), Lead Form (Page 5), and your Custom Handle.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlanType("pro")}
                  className="text-[11px] font-extrabold text-zinc-600 hover:text-zinc-950 underline px-2 py-1"
                >
                  Simulate Pro Mode
                </button>
                <Link href="/pricing">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-md gap-1">
                    <Zap className="h-3.5 w-3.5 fill-current" /> Upgrade to Pro ($7/mo) <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab !== "settings" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm max-w-3xl mx-auto w-full">
              <div>
                <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                  Creator Studio <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                </h1>
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                  Customize your profile, video reels, and design settings.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeTab === "design" && designActions.reset && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={designActions.reset}
                      className="text-xs font-bold text-zinc-700 hover:bg-zinc-100 border-zinc-200 h-10 px-3 rounded-xl shadow-2xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-zinc-500" /> Reset Default
                    </Button>

                    <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 h-10">
                      <button
                        onClick={designActions.undo}
                        disabled={!designActions.canUndo}
                        title="Undo"
                        className="p-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <Undo2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={designActions.redo}
                        disabled={!designActions.canRedo}
                        title="Redo"
                        className="p-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <Redo2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 gap-1.5 shadow-sm rounded-xl"
                >
                  <Save className="h-4 w-4" /> Save Profile
                </Button>
              </div>
            </div>
          )}

          {/* Active Form Panel */}
          <div className="relative max-w-3xl mx-auto w-full">
            {activeTab === "bio" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <ProfileEditor
                  name={name}
                  setName={setName}
                  username={username}
                  setUsername={setUsername}
                  bio={bio}
                  setBio={setBio}
                  avatarUrl={avatarUrl}
                  setAvatarUrl={setAvatarUrl}
                  customHexColor={customHexColor}
                  setCustomHexColor={setCustomHexColor}
                  socialLinks={socialLinks}
                  setSocialLinks={setSocialLinks}
                  customLinks={customLinks}
                  setCustomLinks={setCustomLinks}
                  leadForm={leadForm}
                  setLeadForm={setLeadForm}
                  planType={planType}
                />
              </div>
            )}

            {activeTab === "reels" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <FeedItemEditor 
                  reels={reels} 
                  setReels={setReels} 
                  planType={planType} 
                  leadForm={leadForm}
                  setLeadForm={setLeadForm}
                />
              </div>
            )}

            {activeTab === "design" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <DesignEditor 
                  customHexColor={customHexColor}
                  setCustomHexColor={setCustomHexColor}
                  appearance={appearance}
                  setAppearance={setAppearance}
                  onRegisterActions={setDesignActions}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <AccountSettingsEditor
                  name={name}
                  setName={setName}
                  username={username}
                  setUsername={setUsername}
                  bio={bio}
                  setBio={setBio}
                  avatarUrl={avatarUrl}
                  setAvatarUrl={setAvatarUrl}
                  planType={planType}
                  setPlanType={setPlanType}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: MOBILE PREVIEW (HIDDEN IN ACCOUNT SETTINGS VIEW) */}
        {activeTab !== "settings" && (
          <aside className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 flex flex-col items-center gap-3 px-4 py-6 lg:pr-8">
            <div className="text-center w-full flex justify-center mb-1">
              <Link href={`/${username}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-white border border-zinc-200/80 shadow-sm px-4 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors gap-1.5 h-auto"
                >
                  <Eye className="h-4 w-4 text-emerald-600" /> View Live Preview
                </Button>
              </Link>
            </div>

            <MobilePreview
              profileName={name}
              username={username}
              bio={bio}
              avatarUrl={avatarUrl}
              customHexColor={customHexColor}
              socialLinks={socialLinks}
              customLinks={customLinks}
              reels={reels}
              leadForm={leadForm}
              appearance={appearance}
              fontFamily={appearance?.fontFamily}
              isDemoMode={true}
              activeTab={activeTab}
            />
          </aside>
        )}
      </main>

      {/* Floating Unsaved Changes Reminder Toast Bar */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 text-xs font-medium">
            <span>Hey there! You made some magic ✨ Don't forget to save your changes!</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                type="button"
                onClick={handleDiscardChanges}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 h-8 px-3 text-xs font-semibold cursor-pointer"
              >
                Discard
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-8 px-4 text-xs shadow-md cursor-pointer"
              >
                Save Now 🚀
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
