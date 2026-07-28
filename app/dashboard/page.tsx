"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileEditor } from "@/components/profile-editor";
import { FeedItemEditor } from "@/components/feed-item-editor";
import { DesignEditor } from "@/components/design-editor";
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
import { User, Film, Palette, Sparkles, Smartphone, Save, CheckCircle2, AlertCircle, Lock, Zap, ArrowRight, Share2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"bio" | "reels" | "design">("bio");
  // Plan Tier State (default 'free', can be upgraded)
  const [planType, setPlanType] = useState<PlanType>("free");

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
  const [reels, setReels] = useState<VideoReel[]>([
    {
      id: "r1",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-mysterious-pale-looking-woman-with-neon-make-up-42322-large.mp4",
      caption: "Chasing neon lights in the city 🌆✨ Which frame is your favorite?",
      likes: 284,
    },
    {
      id: "r2",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-girl-taking-selfie-in-front-of-neon-sign-42326-large.mp4",
      caption: "Sunset waves on the coast 🌊🌅 Turn sound on!",
      likes: 195,
    },
    {
      id: "r3",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-in-autumn-48906-large.mp4",
      caption: "Golden autumn tree loop 🍂💛 Cozy vibes forever.",
      likes: 312,
    },
  ]);

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
          if (data.reels) setReels(data.reels);
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
      const payload = {
        username: username.toLowerCase().trim(),
        name,
        bio,
        avatar_url: avatarUrl,
        custom_hex_color: appearance.bgColor || customHexColor,
        appearance,
        plan_type: planType,
        social_links: socialLinks,
        custom_links: customLinks,
        reels: reels,
        lead_form: leadForm,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "username" });

      if (error) {
        throw error;
      }

      setSaveStatus("success");
      setStatusMsg("Profile saved successfully to Supabase!");
      setSavedSnapshot(getCurrentStateJSON());
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setStatusMsg(err.message || "Failed to save profile to Supabase.");
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

      <main className="flex-1 w-full px-4 py-6 md:px-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt={name}
                className="w-10 h-10 rounded-full object-cover border border-zinc-200"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-zinc-900 truncate">{name}</span>
                <span className="text-xs text-zinc-500 truncate">@{username}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleShareProfile}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs py-2 rounded-xl border border-emerald-200 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold text-xs py-2 rounded-xl border border-zinc-200 transition-colors">
                Support
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2">Feed Selector</label>
              <select
                className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-bold rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="default">My Feed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <button
                onClick={() => setActiveTab("bio")}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left",
                  activeTab === "bio"
                    ? "bg-zinc-950 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <User className="h-4.5 w-4.5 shrink-0" /> Bio &amp; Links
              </button>

              <button
                onClick={() => setActiveTab("reels")}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left relative",
                  activeTab === "reels"
                    ? "bg-zinc-950 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Film className="h-4.5 w-4.5 shrink-0" /> Videos &amp; Reels
                {planType === "free" && <Lock className={cn("h-4 w-4 ml-auto", activeTab === "reels" ? "text-amber-400" : "text-amber-500")} />}
              </button>

              <button
                onClick={() => setActiveTab("design")}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left",
                  activeTab === "design"
                    ? "bg-zinc-950 text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Palette className="h-4.5 w-4.5 shrink-0" /> Design &amp; Themes
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER WORKSPACE */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
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

          <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                Creator Studio <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
              </h1>
              <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                Connected to Supabase. Edit settings and click Save Changes to persist.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 gap-1.5 shadow-sm rounded-xl"
            >
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>

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
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: MOBILE PREVIEW */}
        <aside className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 flex flex-col items-center gap-3">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200/80 shadow-sm px-3.5 py-1.5 text-xs font-bold text-zinc-700">
              <Smartphone className="h-4 w-4 text-emerald-600" /> Live 5-Page Snap Preview
            </span>
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
            isDemoMode={true}
          />
        </aside>
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
