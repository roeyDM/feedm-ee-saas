"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileEditor } from "@/components/profile-editor";
import { FeedItemEditor } from "@/components/feed-item-editor";
import { DesignEditor } from "@/components/design-editor";
import { BillingEditor } from "@/components/billing-editor";
import { AccountSettingsEditor } from "@/components/account-settings-editor";
import { Logo } from "@/components/logo";
import { LeadsManager } from "@/components/leads-manager";
import { AnalyticsManager } from "@/components/analytics-manager";
import { MarketingPixelsManager } from "@/components/marketing-pixels-manager";
import {
  MobilePreview,
  SocialLink,
  CustomLink,
  VideoReel,
  LeadFormSettings,
  AppearanceSettings,
  DEFAULT_APPEARANCE,
} from "@/components/mobile-preview";
import { sanitizeLeadForm, sanitizeHexColor } from "@/lib/sanitizers";
import { UpgradeModal } from "@/components/upgrade-modal";
import { ExtraFeedModal } from "@/components/extra-feed-modal";
import { Button } from "@/components/ui/button";
import { supabase, PlanType } from "@/lib/supabase";
import { checkAndApplyTrialDowngrade, getRemainingTrialDays } from "@/lib/auth-guards";
import { User, Film, Palette, Sparkles, Smartphone, Save, CheckCircle2, AlertCircle, Lock, Zap, ArrowRight, Share2, Eye, ChevronDown, ChevronRight, BarChart2, DollarSign, Settings, Layers, ExternalLink, Copy, RotateCcw, Undo2, Redo2, X, Loader2, Plus, Inbox, Target, Menu, LogOut, BarChart3, Link2, Sliders, LayoutTemplate, MousePointerClick, Pencil, Video, LayoutDashboard, Users } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"bio" | "reels" | "design" | "settings" | "leads" | "analytics" | "pixels">("bio");
  // Plan Tier State (default 'free', can be upgraded)
  const [planType, setPlanType] = useState<PlanType>("free");
  const [analyticsTier, setAnalyticsTier] = useState<"free" | "personal" | "pro">("free");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);
  const [mobileAccordions, setMobileAccordions] = useState<Record<string, boolean>>({
    myFeed: true,
    marketing: true,
  });

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Clean up any legacy offline dev mock plan overrides on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("feedmee_subscription_tier");
      localStorage.removeItem("feedmee_trial_active");
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
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showExtraFeedModal, setShowExtraFeedModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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

        if (!user) {
          setIsProfileLoading(false);
          return;
        }

        if (user.email) setUserEmail(user.email);
        const userHandle = (user.user_metadata?.username || user.user_metadata?.handle || user.email?.split("@")[0] || "").toLowerCase();
        const userName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || (userHandle ? userHandle.charAt(0).toUpperCase() + userHandle.slice(1) : "Creator");

        if (userHandle) setUsername(userHandle);
        if (userName) setName(userName);

        // Check for ?checkout=success parameter
        if (searchParams.get("checkout") === "success") {
          setSaveStatus("success");
          setStatusMsg("🎉 Subscription upgrade successful! Welcome to your upgraded creator workspace.");
          setTimeout(() => setSaveStatus("idle"), 6000);
        }

        // Fetch profile row from Supabase for authenticated user
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .or(`id.eq.${user.id},username.eq.${userHandle.toLowerCase()}`)
          .maybeSingle();

        if (profile && !error) {
          const checkedProfile = await checkAndApplyTrialDowngrade(profile);
          if (checkedProfile.name) setName(checkedProfile.name);
          if (checkedProfile.username) setUsername(checkedProfile.username);
          if (checkedProfile.bio !== undefined) setBio(checkedProfile.bio);
          if (checkedProfile.avatar_url !== undefined) setAvatarUrl(checkedProfile.avatar_url);
          if (checkedProfile.custom_hex_color) setCustomHexColor(checkedProfile.custom_hex_color);
          const createdAt = new Date(checkedProfile.created_at || user?.created_at || Date.now());
          const isWithin7Days = (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
          const isTrialActive = checkedProfile.is_trial !== false || isWithin7Days;

          const dbPlanRaw = String(checkedProfile.plan_type || checkedProfile.plan || "").toLowerCase();
          const isProPlan = checkedProfile.is_super_admin === true || isTrialActive || dbPlanRaw.includes("pro") || dbPlanRaw.includes("trial");

          if (isProPlan) {
            setPlanType("pro");
            if (checkedProfile.plan_type !== "pro" || checkedProfile.plan !== "pro") {
              supabase
                .from("profiles")
                .update({ plan: "pro", plan_type: "pro", is_trial: true })
                .eq("id", checkedProfile.id)
                .then(() => {}, () => {});
            }
          } else if (checkedProfile.plan_type) {
            setPlanType(checkedProfile.plan_type as PlanType);
          }
          setSubscriptionStatus(checkedProfile.subscription_status || "active");
          setTrialEndsAt(checkedProfile.trial_ends_at || null);
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
                promoUrl: r.promoUrl || r.promo_url || r.targetUrl || r.target_url || "",
                promoTitle: r.promoTitle || r.promo_title || "",
                promoCode: r.promoCode || r.promo_code || "",
                promoCta: r.promoCta || r.promo_cta || "Get Deal 🚀",
                promoEnabled: !!(r.promoEnabled || r.promo_enabled),
                promoDelaySeconds: typeof r.promoDelaySeconds === "number" ? r.promoDelaySeconds : (typeof r.promo_delay_seconds === "number" ? r.promo_delay_seconds : 3),
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
            const localApp = localStorage.getItem(`feedmee_appearance_${(profile.username || userHandle).toLowerCase()}`);
            if (localApp) {
              try { loadedAppearance = JSON.parse(localApp); } catch(e) {}
            }
          }
          if (loadedAppearance && Object.keys(loadedAppearance).length > 0) {
            setAppearance(loadedAppearance);
            if (loadedAppearance.bgColor) setCustomHexColor(loadedAppearance.bgColor);
          }

          setSavedSnapshot(JSON.stringify({
            name: profile.name || userName,
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

  // Sync snapshot right after hydration completes to ensure no false-positive isDirty on refresh
  const isHydratedRef = useRef(false);
  useEffect(() => {
    if (!isProfileLoading && !isHydratedRef.current) {
      setSavedSnapshot(getCurrentStateJSON());
      isHydratedRef.current = true;
    }
  }, [isProfileLoading, name, bio, avatarUrl, customHexColor, planType, socialLinks, customLinks, reels, leadForm, appearance]);

  // Dirty State calculation & Browser Navigation Protection
  const isDirty = !isProfileLoading && savedSnapshot !== null && savedSnapshot !== getCurrentStateJSON();

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

    // Validation 3: Check for target email in leadForm (ONLY when Lead Form is Enabled)
    const isLeadFormEnabled = leadForm.is_leadform_enabled !== false && leadForm.is_enabled !== false;
    if (isLeadFormEnabled && (!leadForm.target || !leadForm.target.trim() || !leadForm.target.includes("@"))) {
      setSaveStatus("error");
      setStatusMsg("Please enter a valid email address to receive lead notifications.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");
    setStatusMsg("");

    try {
      const cleanThemeColor = sanitizeHexColor(appearance?.bgColor || customHexColor, "#BAD1CB");
      const cleanButtonColor = sanitizeHexColor(appearance?.cardBgColor, "#16A34A");
      const cleanTextColor = sanitizeHexColor(appearance?.headlineColor, "#09090B");
      const cleanButtonTextColor = sanitizeHexColor(appearance?.cardTextColor, "#09090B");

      const sanitizedAppearance: any = appearance
        ? {
            ...appearance,
            bgColor: cleanThemeColor,
            bgGradientStart: sanitizeHexColor(appearance.bgGradientStart, "#FBCFE8"),
            bgGradientEnd: sanitizeHexColor(appearance.bgGradientEnd, "#E0F2FE"),
            headlineColor: cleanTextColor,
            bioColor: sanitizeHexColor(appearance.bioColor, "#27272A"),
            cardBgColor: cleanButtonColor,
            cardTextColor: cleanButtonTextColor,
            cardBorderColor: sanitizeHexColor(appearance.cardBorderColor, "#E4E4E7"),
            socialIconBgColor: sanitizeHexColor(appearance.socialIconBgColor, "#FFFFFF"),
            socialFlatColor: sanitizeHexColor(appearance.socialFlatColor, "#18181B"),
            avatarBorderColor: sanitizeHexColor(appearance.avatarBorderColor, "#FFFFFF"),
          }
        : {};

      let payload: any = {
        username: username.toLowerCase().trim(),
        name,
        bio,
        avatar_url: avatarUrl,
        custom_hex_color: cleanThemeColor,
        theme_color: cleanThemeColor,
        button_color: cleanButtonColor,
        text_color: cleanTextColor,
        button_text_color: cleanButtonTextColor,
        appearance: sanitizedAppearance,
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
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col bg-zinc-50/80 font-sans text-zinc-900 relative">
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

      {/* DESKTOP HEADER (Hidden on mobile) */}
      <div className="hidden md:block">
        <DashboardHeader
          username={username}
          planType={planType}
          subscriptionStatus={subscriptionStatus}
          trialEndsAt={trialEndsAt}
          onSave={handleSave}
          isSaving={isSaving}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
      </div>

      {/* MOBILE STICKY TOP BAR & DRAWER (Visible on mobile only) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between block md:hidden">
        {/* Left Slot: Hamburger Button */}
        <div className="w-1/4 flex justify-start">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white border border-slate-700/80 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6 text-slate-200" />
          </button>
        </div>

        {/* Center Slot: Centered FeedM.ee Brand Logo */}
        <div className="w-2/4 flex justify-center items-center">
          <Link href="/dashboard" className="flex items-center justify-center">
            <Logo showText={false} />
          </Link>
        </div>

        {/* Right Slot: Plan Badge */}
        <div className="w-1/4 flex justify-end">
          {planType === "pro" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase shrink-0">
              <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">PRO TRIAL ACTIVE</span>
              <span className="sm:hidden">PRO</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase shrink-0 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>FREE</span>
            </button>
          )}
        </div>
      </header>

      {/* MOBILE HAMBURGER DRAWER OVERLAY (SLIDING FROM LEFT) */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-start block md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div 
            className="w-80 max-w-[85vw] bg-slate-900 h-full border-r border-slate-800 p-4 pb-28 pt-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              
              {/* DRAWER TOP BAR WITH LOGO BRANDING & CLOSE BUTTON */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <Link href="/dashboard" onClick={() => setMobileDrawerOpen(false)} className="flex items-center">
                  <Logo showText={true} wordmarkClassName="text-base text-white" />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TOP OF DRAWER: USER PROFILE CARD (1:1 Desktop Parity) */}
              <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700/80 shadow-sm flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                    alt={name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-black text-white truncate">{name || "User"}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase shrink-0">
                        {planType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate font-medium">@{username || "username"}</span>
                  </div>
                </div>
              </div>

              {/* ACCURATE MOBILE DRAWER NAVIGATION STRUCTURE (1:1 DESKTOP PARITY) */}
              <nav className="flex flex-col gap-2.5">
                
                {/* 1. MY FEED (Collapsible Group) */}
                <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setMobileAccordions(prev => ({ ...prev, myFeed: !prev.myFeed }))}
                    className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-white hover:bg-slate-800/60 transition-colors text-left select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 text-emerald-400" />
                      <span>MY FEED</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", mobileAccordions.myFeed && "rotate-180")} />
                  </button>

                  {mobileAccordions.myFeed && (
                    <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-slate-800/80 animate-in fade-in duration-200">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("bio");
                          setMobileDrawerOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "bio" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <User className="h-4 w-4 text-emerald-400" />
                        <span>Bio &amp; Links</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("reels");
                          setMobileDrawerOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "reels" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Film className="h-4 w-4 text-emerald-400" />
                        <span>Videos &amp; Reels</span>
                        {planType === "free" && <Lock className="h-3 w-3 text-amber-400 ml-auto" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("design");
                          setMobileDrawerOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "design" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Palette className="h-4 w-4 text-emerald-400" />
                        <span>Design &amp; Themes</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. ANALYTICS / INSIGHTS (Direct Category) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("analytics");
                    setMobileDrawerOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-3 rounded-2xl border text-xs font-black transition-all text-left cursor-pointer",
                    activeTab === "analytics"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    <span>ANALYTICS / INSIGHTS</span>
                  </div>
                  <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                    Active
                  </span>
                </button>

                {/* 3. MARKETING TOOLS (Collapsible Group) */}
                <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setMobileAccordions(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-black text-white hover:bg-slate-800/60 transition-colors text-left select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Target className="h-4 w-4 text-emerald-400" />
                      <span>MARKETING TOOLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">Active</span>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", mobileAccordions.marketing && "rotate-180")} />
                    </div>
                  </button>

                  {mobileAccordions.marketing && (
                    <div className="flex flex-col gap-1 p-2 pt-0.5 border-t border-slate-800/80 animate-in fade-in duration-200">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("leads");
                          setMobileDrawerOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "leads"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Inbox className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>Leads CRM</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                          New
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("pixels");
                          setMobileDrawerOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                          activeTab === "pixels"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>Marketing Pixels</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                          New
                        </span>
                      </button>
                    </div>
                  )}
                </div>

              </nav>
            </div>

            {/* BOTTOM ACCOUNT ACTIONS IN DRAWER */}
            <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("settings");
                  setMobileDrawerOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left w-full cursor-pointer",
                  activeTab === "settings" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>

              <button 
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  if (typeof window !== "undefined") window.location.href = "/login";
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm mt-4 border border-red-500/20 mb-8 cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CORE SECTION SWITCHER (SUB-HEADER) - Visible ONLY inside Main Builder */}
      {(activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
        <div className="sticky top-[57px] z-30 bg-slate-900 border-b border-slate-800 px-3 py-2 block md:hidden">
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("bio")}
              className={cn(
                "py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "bio"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>Bio &amp; Links</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reels")}
              className={cn(
                "py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "reels"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos &amp; Reels</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("design")}
              className={cn(
                "py-2 px-1 text-[11px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer",
                activeTab === "design"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design &amp; Themes</span>
            </button>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <StripeCheckoutStatus 
          username={username}
          setPlanType={setPlanType}
          setSaveStatus={setSaveStatus}
          setStatusMsg={setStatusMsg}
        />
      </Suspense>



      <main className="flex-1 w-full flex flex-col lg:flex-row items-start overflow-hidden min-h-0">
        
        {/* LEFT SIDEBAR (Desktop only) */}
        <aside className="w-full lg:w-[280px] shrink-0 h-full flex flex-col gap-4 overflow-y-auto border-r border-zinc-200 bg-zinc-100/80 px-4 py-5 lg:px-5 pb-8 hidden lg:flex">
          {/* Consolidated Profile & Feed Switcher */}
          <div className="relative">
            <div 
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="bg-white rounded-2xl p-3 border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all flex items-center justify-between cursor-pointer group select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
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
                    setShowExtraFeedModal(true);
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

                <button 
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    if (typeof window !== "undefined") window.location.href = "/login";
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs border border-red-200/60 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                  <span>Log Out</span>
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

            {/* Top-Level Menu: Analytics & Insights (Flattened) */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/90 bg-white shadow-2xs transition-all">
              <button
                onClick={() => setActiveTab("analytics")}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-3 text-xs font-black transition-all text-left select-none cursor-pointer",
                  activeTab === "analytics"
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-900 hover:bg-zinc-50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className={cn("h-4 w-4", activeTab === "analytics" ? "text-emerald-400" : "text-emerald-600")} />
                  <span>Analytics / Insights</span>
                </div>
                <span className={cn(
                  "text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase",
                  activeTab === "analytics"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200"
                )}>
                  Active
                </span>
              </button>
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

                  <button
                    onClick={() => setActiveTab("pixels")}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                      activeTab === "pixels"
                        ? "bg-zinc-950 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Marketing Pixels</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                      New
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER WORKSPACE */}
        <div className={cn("min-w-0 flex flex-col w-full flex-1 h-full overflow-y-auto p-4 md:p-6", activeTab === "settings" ? "p-0 m-0 border-0" : "gap-6")}>
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

              </div>
            ) : null
          )}

          {(activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
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
            <div className={cn("relative w-full space-y-6 transition-all duration-300 pb-28 md:pb-0", activeTab === "leads" || activeTab === "analytics" ? "max-w-none w-full flex-1" : "max-w-3xl mx-auto")}>
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
                  <AnalyticsManager 
                    planType={planType} 
                    activeTier={analyticsTier}
                    onTierChange={setAnalyticsTier}
                    username={username}
                  />
                </div>
              )}

              {activeTab === "pixels" && (
                <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-none flex-1">
                  <MarketingPixelsManager username={username} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex-1 animate-in fade-in duration-200 pb-28 md:pb-0">
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

        {/* RIGHT PANEL: MOBILE PREVIEW (Desktop only, hidden on mobile) */}
        {activeTab !== "settings" && (
          <aside className="w-[360px] lg:w-[380px] xl:w-[410px] h-full shrink-0 border-l border-zinc-200/80 flex flex-col items-center justify-center p-4 bg-white overflow-hidden hidden lg:flex">
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

            <div className="w-full flex justify-center overflow-visible">
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
              analyticsOverlayMode={
                activeTab === "analytics"
                  ? analyticsTier === "free"
                    ? "bubbles"
                    : analyticsTier === "personal"
                    ? "reels"
                    : "heatmap"
                  : null
              }
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
                      is_test: true,
                      isTest: true,
                      source: "simulator",
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
            </div>
          </aside>
        )}
      </main>

      {/* DYNAMIC CONTEXTUAL BOTTOM TOOLBAR (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl block md:hidden">
        {activeTab === "bio" && (
          <>
            <button
              type="button"
              onClick={() => scrollToSection("profile-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("links-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>Links</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("socials-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Socials</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview</span>
            </button>
          </>
        )}

        {activeTab === "reels" && (
          <>
            <button
              type="button"
              onClick={() => scrollToSection("reels-list-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-400" />
              <span>My Reels</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("add-reel-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Reel</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("reel-settings-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview</span>
            </button>
          </>
        )}

        {activeTab === "design" && (
          <>
            <button
              type="button"
              onClick={() => scrollToSection("preset-themes-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <LayoutTemplate className="w-4 h-4 text-emerald-400" />
              <span>Themes</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("color-picker-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>Colors</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("button-style-section")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <MousePointerClick className="w-4 h-4 text-emerald-400" />
              <span>Buttons</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview</span>
            </button>
          </>
        )}

        {(activeTab === "analytics" || activeTab === "leads" || activeTab === "pixels" || activeTab === "settings") && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("bio")}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-emerald-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-300" />
              <span>MY FEED</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer",
                activeTab === "analytics" ? "text-emerald-400 font-extrabold" : "text-slate-300 hover:text-emerald-400"
              )}
            >
              <BarChart3 className={cn("w-5 h-5", activeTab === "analytics" ? "text-emerald-400" : "text-slate-300")} />
              <span>ANALYTICS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer",
                activeTab === "leads" ? "text-emerald-400 font-extrabold" : "text-slate-300 hover:text-emerald-400"
              )}
            >
              <Users className={cn("w-5 h-5", activeTab === "leads" ? "text-emerald-400" : "text-slate-300")} />
              <span>CRM</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(true)}
              className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 px-2 py-1 transition-colors cursor-pointer"
            >
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>LIVE PREVIEW</span>
            </button>
          </>
        )}
      </nav>

      {/* FULL-SCREEN MOBILE LIVE PREVIEW OVERLAY */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-3 h-[100dvh] overflow-y-auto block md:hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full h-full max-w-[390px] mx-auto flex items-center justify-center">
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
          </div>

          <Button
            type="button"
            onClick={() => setShowMobilePreviewModal(false)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white font-extrabold text-xs h-11 px-6 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-slate-800"
          >
            <Pencil className="w-4 h-4 text-emerald-400" />
            <span>Back to Editor</span>
          </Button>
        </div>
      )}

      {/* Floating Unsaved Changes Reminder Toast Bar - STRICTLY SCOPED to Builder Tabs (Bio, Reels, Design) */}
      {isDirty && (activeTab === "bio" || activeTab === "reels" || activeTab === "design") && (
        <>
          {/* Mobile Compact Single-Line Strip */}
          <div className="fixed bottom-16 left-4 right-4 z-[90] bg-slate-900/95 border border-slate-700 p-2.5 rounded-full flex items-center justify-between shadow-2xl backdrop-blur-md block md:hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-1.5 pl-1.5 min-w-0">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
              <span className="text-xs font-extrabold text-white truncate">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600/80 rounded-full transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 py-1 text-[11px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-sm transition-colors cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Desktop Floating Toast Bar (100% Untouched) */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300 hidden md:block">
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
        </>
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
      {/* Contextual Extra Feed Add-on Modal */}
      <ExtraFeedModal
        isOpen={showExtraFeedModal}
        onClose={() => setShowExtraFeedModal(false)}
        planType={planType}
        userEmail={userEmail}
        username={username}
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
