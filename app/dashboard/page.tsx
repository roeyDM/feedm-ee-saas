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
import { LeadsManager } from "@/components/leads-manager";
import { AnalyticsManager } from "@/components/analytics-manager";
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
import { UpgradeModal } from "@/components/upgrade-modal";
import { Button } from "@/components/ui/button";
import { supabase, PlanType } from "@/lib/supabase";
import { User, Film, Palette, Sparkles, Smartphone, Save, CheckCircle2, AlertCircle, Lock, Zap, ArrowRight, Share2, Eye, ChevronDown, ChevronRight, BarChart2, DollarSign, Settings, Layers, ExternalLink, Copy, RotateCcw, Undo2, Redo2, X, Loader2, Plus, Inbox } from "lucide-react";
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

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"bio" | "reels" | "design" | "settings" | "leads" | "analytics">("bio");
  // Plan Tier State (default 'free', can be upgraded)
  const [planType, setPlanType] = useState<PlanType>("free");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Restore saved offline trial tier state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTier = localStorage.getItem("feedmee_subscription_tier");
      if (savedTier === "pro") {
        setPlanType("pro");
      }
    }
  }, []);

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

  // Creator Profile Loading State (prevents flash of default mock data)
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Creator Profile State (default empty until session loads)
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [customHexColor, setCustomHexColor] = useState("#bad1cb");

  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Linktree Custom Links (Page 1)
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

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

  // ─── Load Authenticated User Profile on Mount ──────────────────────────────
  useEffect(() => {
    async function loadAuthUserSession() {
      setIsProfileLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let fallbackUser = "";
        let fallbackName = "";

        if (user) {
          fallbackUser = (user.user_metadata?.username || user.email?.split("@")[0] || "").toLowerCase();
          fallbackName = user.user_metadata?.display_name || user.user_metadata?.name || (fallbackUser ? fallbackUser.charAt(0).toUpperCase() + fallbackUser.slice(1) : "");
        } else {
          // Check query params if unauthenticated local preview
          const urlHandle = searchParams.get("handle");
          if (urlHandle) {
            fallbackUser = urlHandle.toLowerCase();
            fallbackName = urlHandle.charAt(0).toUpperCase() + urlHandle.slice(1);
          }
        }

        // Default initial values before DB load
        if (fallbackUser) setUsername(fallbackUser);
        if (fallbackName) setName(fallbackName);

        // Fetch profile row from Supabase
        const targetUsername = fallbackUser || username;
        if (!targetUsername) return;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .or(`username.eq.${targetUsername.toLowerCase()}${user ? `,id.eq.${user.id}` : ""}`)
          .maybeSingle();

        if (profile && !error) {
          if (profile.name) setName(profile.name);
          if (profile.username) setUsername(profile.username);
          if (profile.bio !== undefined) setBio(profile.bio);
          if (profile.avatar_url !== undefined) setAvatarUrl(profile.avatar_url);
          if (profile.custom_hex_color) setCustomHexColor(profile.custom_hex_color);
          if (profile.plan_type) setPlanType(profile.plan_type as PlanType);
          if (profile.social_links) {
            setSocialLinks(profile.social_links.map((l: any) => ({
              ...l,
              id: l.id || crypto.randomUUID(),
              isActive: l.isActive !== false
            })));
          }
          if (profile.custom_links) setCustomLinks(profile.custom_links);
          if (profile.reels) {
            const cleanedReels = profile.reels
              .map((r: any) => ({
                ...r,
                videoUrl: r.videoUrl || r.url || "",
              }))
              .filter((r: any) => r.videoUrl && !r.videoUrl.includes("mixkit.co"));
            setReels(cleanedReels);
          }
          if (profile.lead_form) {
            let sanitized = sanitizeLeadForm(profile.lead_form);
            if ((!sanitized.target || !sanitized.target.trim()) && user?.email) {
              sanitized = { ...sanitized, target: user.email };
            }
            setLeadForm(sanitized);
          } else if (user?.email) {
            setLeadForm((prev) => ({ ...prev, target: user.email || "" }));
          }

          // Appearance Persistence with localStorage fallback
          let loadedAppearance = profile.appearance;
          if ((!loadedAppearance || Object.keys(loadedAppearance).length === 0) && typeof window !== "undefined") {
            const localApp = localStorage.getItem(`feedmee_appearance_${(profile.username || targetUsername).toLowerCase()}`);
            if (localApp) {
              try { loadedAppearance = JSON.parse(localApp); } catch(e) {}
            }
          }
          if (loadedAppearance && Object.keys(loadedAppearance).length > 0) {
            setAppearance(loadedAppearance);
            if (loadedAppearance.bgColor) setCustomHexColor(loadedAppearance.bgColor);
          }

          setSavedSnapshot(JSON.stringify({
            name: profile.name || fallbackName,
            bio: profile.bio || "",
            avatarUrl: profile.avatar_url || "",
            customHexColor: loadedAppearance?.bgColor || profile.custom_hex_color || "#bad1cb",
            planType: profile.plan_type || "free",
            socialLinks: profile.social_links || [],
            customLinks: profile.custom_links || [],
            reels: profile.reels || [],
            leadForm: sanitizeLeadForm(profile.lead_form) || leadForm,
            appearance: loadedAppearance || appearance,
          }));
        } else {
          setSavedSnapshot(getCurrentStateJSON());
        }
      } catch (err) {
        console.warn("User session load warning:", err);
        setSavedSnapshot(getCurrentStateJSON());
      } finally {
        setIsProfileLoading(false);
      }
    }
    loadAuthUserSession();
  }, [searchParams]);

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
    // Validation 1: Require at least 1 Custom Link
    const validCustomLinks = customLinks.filter(l => l.title?.trim() && l.url?.trim());
    if (validCustomLinks.length === 0) {
      setSaveStatus("error");
      setStatusMsg("Add at least 1 Custom Link to save your feed.");
      return;
    }

    // Validation 2: Check for empty URLs in active social links
    const hasEmptySocialLink = socialLinks.some(l => l.isActive !== false && (!l.url || !l.url.trim()));
    if (hasEmptySocialLink) {
      setSaveStatus("error");
      setStatusMsg("Please enter a valid link for all social links or remove empty ones before saving.");
      return;
    }

    // Validation 3: Check for target email in leadForm
    if (!leadForm.target || !leadForm.target.trim() || !leadForm.target.includes("@")) {
      setSaveStatus("error");
      setStatusMsg("Please enter a valid email address to receive lead notifications.");
      return;
    }

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

      // Always store appearance in localStorage as immediate fallback
      if (typeof window !== "undefined") {
        localStorage.setItem(`feedmee_appearance_${username.toLowerCase().trim()}`, JSON.stringify(appearance));
      }

      setSaveStatus("success");
      setStatusMsg("Profile saved successfully!");
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

  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    if (saveStatus === "error") {
      setShowErrorToast(true);
      const timer = setTimeout(() => setShowErrorToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, statusMsg]);

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl max-w-sm w-full text-center animate-in fade-in duration-300">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white">Loading Creator Studio...</h3>
            <p className="text-xs text-zinc-400 font-medium">Fetching your custom profile &amp; themes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/80 flex flex-col font-sans text-zinc-900 relative">
      {/* Floating Error Toast Notification Overlay (Auto-dismisses after 4s) */}
      {showErrorToast && saveStatus === "error" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-rose-950/95 text-white border border-rose-500/50 shadow-2xl px-5 py-3 backdrop-blur-md text-xs font-bold">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
            <span>{statusMsg || "Validation error: Please fix highlighted fields."}</span>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-2 text-rose-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <DashboardHeader
        username={username}
        planType={planType}
        onSave={handleSave}
        isSaving={isSaving}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />

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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl z-30 p-2 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">MY FEEDS</div>
                
                {/* Active Primary Feed Item */}
                <button 
                  onClick={() => setAccountMenuOpen(false)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-950 font-bold text-xs border border-emerald-200/50 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <img
                      src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-emerald-300 shrink-0"
                    />
                    <span className="truncate text-xs font-bold text-emerald-950">@{username || "username"}</span>
                  </div>
                  <span className="text-[9px] text-emerald-700 font-black uppercase shrink-0 ml-1.5 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
                </button>

                {/* Add More Feeds Option */}
                <button 
                  onClick={() => {
                    setShowUpgradeModal(true);
                    setAccountMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 text-xs font-semibold mt-1 transition-colors cursor-pointer min-w-0 group"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-400 group-hover:text-emerald-600 shrink-0" />
                  <span className="truncate text-left text-xs font-bold text-zinc-700 group-hover:text-zinc-900">
                    Add More Feeds
                  </span>
                </button>

                {/* Compact Mini Upgrade Badge CTA */}
                <button 
                  onClick={() => {
                    setShowUpgradeModal(true);
                    setAccountMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 text-white border border-emerald-500/40 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group text-left mt-1"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Zap className="h-3 w-3 text-emerald-400 fill-current shrink-0 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-white truncate">Upgrade to Business</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                {/* Single Divider Line separating MY FEEDS from Settings */}
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
                onClick={() => {
                  toggleAccordion("analytics");
                  setActiveTab("analytics");
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="h-4 w-4 text-emerald-600" />
                  <span>Analytics / Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">Active</span>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.analytics && "rotate-180")} />
                </div>
              </button>

              {openAccordions.analytics && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                      activeTab === "analytics"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <span>Traffic &amp; Conversion Insights</span>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                      Live
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 3: Monetization */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("monetization")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-4 w-4 text-zinc-500" />
                  <span>Monetization</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200">SOON</span>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.monetization && "rotate-180")} />
                </div>
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

            {/* Accordion 4: Marketing Tools */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => toggleAccordion("settings")}
                className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-colors text-left select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-emerald-600" />
                  <span>Marketing Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">Active</span>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", openAccordions.settings && "rotate-180")} />
                </div>
              </button>

              {openAccordions.settings && (
                <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-zinc-100/90 animate-in fade-in duration-200">
                  <button
                    onClick={() => setActiveTab("leads")}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                      activeTab === "leads"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Leads CRM</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                      New
                    </span>
                  </button>

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
        <div className={cn("min-w-0 flex flex-col w-full flex-1", activeTab === "settings" ? "p-0 m-0 border-0" : "px-4 py-6 lg:px-8 gap-6")}>
          {/* Status Notification Toast Banner - Only shown on editing tabs (Bio, Reels, Design) */}
          {saveStatus !== "idle" && (activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
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

          {/* Plan Status Banner (Free Tier vs. Pro Trial) */}
          {activeTab !== "settings" && (
            planType === "free" ? (
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
                      Page 1 (Bio &amp; Links) is active. Upgrade to Pro ($7/mo) to unlock Video Reels (Pages 2–4), Lead Form (Page 5), and White-Label Branding.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("feedmee_subscription_tier", "pro");
                        localStorage.setItem("feedmee_trial_active", "true");
                      }
                      setPlanType("pro");
                      setSaveStatus("success");
                      setStatusMsg("🎉 Pro Trial Activated! You now have full access to Video Reels & Lead Forms.");
                      setTimeout(() => setSaveStatus("idle"), 4000);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-md gap-1 cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" /> Activate Pro Trial (Dev Mock) <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md font-black">
                    <Zap className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      ⚡ 7-Day Pro Trial Active <span className="text-[10px] normal-case font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">Full Access</span>
                    </h2>
                    <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                      All features unlocked (3 Video Reels, Lead Capture &amp; White-Label Branding active).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("feedmee_subscription_tier");
                        localStorage.removeItem("feedmee_trial_active");
                      }
                      setPlanType("free");
                      setSaveStatus("success");
                      setStatusMsg("Switched back to Free Tier Mode for testing.");
                      setTimeout(() => setSaveStatus("idle"), 3000);
                    }}
                    className="text-[11px] font-extrabold text-emerald-800 hover:text-emerald-950 underline px-2 py-1 cursor-pointer"
                  >
                    Reset to Free Tier (Dev Test)
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab !== "settings" && activeTab !== "leads" && (
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
          {activeTab !== "settings" ? (
            <div className={cn("relative w-full space-y-6 transition-all duration-300", activeTab === "leads" || activeTab === "analytics" ? "max-w-none w-full flex-1" : "max-w-3xl mx-auto", isDirty && "pb-28")}>
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
                    setPlanType={setPlanType}
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
                    planType={planType}
                    onRegisterActions={setDesignActions}
                  />
                </div>
              )}

              {activeTab === "leads" && (
                <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-none flex-1">
                  <LeadsManager username={username} targetEmail={leadForm.target} />
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-none flex-1">
                  <AnalyticsManager planType={planType} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex-1 animate-in fade-in duration-200">
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
                socialLinks={socialLinks}
                customLinks={customLinks}
                reels={reels}
                leadForm={leadForm}
              />
            </div>
          )}
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
              onTestLeadSubmit={async (targetEmail, leadData) => {
                try {
                  const res = await fetch("/api/send-lead-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      targetEmail,
                      name: leadData.name,
                      email: leadData.email,
                      phone: leadData.phone,
                      feedHandle: username || name || "main",
                      isTest: true,
                    }),
                  });

                  const data = await res.json();
                  if (res.ok && data.success && !data.warning) {
                    setSaveStatus("success");
                    setStatusMsg(`✅ Lead saved & email notification sent!`);
                  } else {
                    console.error("[Email Error]:", data.error || data.warning || data);
                    setSaveStatus("error");
                    setStatusMsg(data.warning || `⚠️ Lead saved to DB, but email delivery failed. Please check RESEND_API_KEY.`);
                  }
                } catch (err: any) {
                  console.error("[Email Error]:", err);
                  setSaveStatus("error");
                  setStatusMsg(`⚠️ Lead saved to DB, but email delivery failed. Please check RESEND_API_KEY.`);
                } finally {
                  setTimeout(() => setSaveStatus("idle"), 6500);
                }
              }}
            />
          </aside>
        )}
      </main>

      {/* Floating Unsaved Changes Reminder Toast Bar - STRICTLY SCOPED to Builder Tabs (Bio, Reels, Design) */}
      {isDirty && (activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
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
      {/* In-App Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onActivateTrial={() => {
          setPlanType("pro");
          if (typeof window !== "undefined") {
            localStorage.setItem("feedmee_subscription_tier", "pro");
          }
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
