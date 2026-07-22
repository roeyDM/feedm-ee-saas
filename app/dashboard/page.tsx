"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileEditor } from "@/components/profile-editor";
import { FeedItemEditor } from "@/components/feed-item-editor";
import {
  MobilePreview,
  SocialLink,
  CustomLink,
  VideoReel,
  LeadFormSettings,
} from "@/components/mobile-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { User, Film, Sparkles, Smartphone, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function DashboardPage() {
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
    { platform: "instagram", url: "https://instagram.com/alexrivers" },
    { platform: "tiktok", url: "https://tiktok.com/@alexrivers" },
    { platform: "youtube", url: "https://youtube.com/alexrivers" },
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
      showWhatsapp: true,
      showCall: false,
    },
    {
      id: "r2",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-girl-taking-selfie-in-front-of-neon-sign-42326-large.mp4",
      caption: "Sunset waves on the coast 🌊🌅 Turn sound on!",
      likes: 195,
      showWhatsapp: true,
      showCall: true,
    },
    {
      id: "r3",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-in-autumn-48906-large.mp4",
      caption: "Golden autumn tree loop 🍂💛 Cozy vibes forever.",
      likes: 312,
      showWhatsapp: false,
      showCall: true,
    },
  ]);

  // Lead Form Settings (Page 5)
  const [leadForm, setLeadForm] = useState<LeadFormSettings>({
    title: "רוצים להיות חלק? / לפניות עסקיות",
    subtitle: "השאירו פרטים ונחזור אליכם בהקדם",
    routeType: "whatsapp",
    target: "1234567890",
  });

  // Supabase Persistence State
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

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
          if (data.social_links) setSocialLinks(data.social_links);
          if (data.custom_links) setCustomLinks(data.custom_links);
          if (data.reels) setReels(data.reels);
          if (data.lead_form) setLeadForm(data.lead_form);
        }
      } catch (err) {
        console.log("No existing profile found or fetch error:", err);
      }
    }
    fetchProfile();
  }, [username]);

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
        custom_hex_color: customHexColor,
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
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setStatusMsg(err.message || "Failed to save profile to Supabase.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/80 flex flex-col font-sans text-zinc-900">
      <DashboardHeader username={username} onSave={handleSave} isSaving={isSaving} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        {/* Status Notification Toast Banner */}
        {saveStatus !== "idle" && (
          <div
            className={`mb-6 flex items-center justify-between rounded-2xl p-4 text-xs font-bold shadow-md transition-all ${
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Controls & Editors */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 gap-1.5 shadow-sm"
              >
                <Save className="h-3.5 w-3.5" /> Save Profile
              </Button>
            </div>

            {/* Editor Tabs */}
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid grid-cols-2 bg-white border border-zinc-200 p-1 rounded-2xl h-12 shadow-sm mb-6">
                <TabsTrigger
                  value="profile"
                  className="rounded-xl text-xs font-bold text-zinc-600 data-[state=active]:bg-zinc-950 data-[state=active]:text-white transition-all flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" /> Theme, Bio & Links
                </TabsTrigger>

                <TabsTrigger
                  value="reels"
                  className="rounded-xl text-xs font-bold text-zinc-600 data-[state=active]:bg-zinc-950 data-[state=active]:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Film className="h-4 w-4" /> Video Reels (3 Max)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="focus-visible:outline-none">
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
                />
              </TabsContent>

              <TabsContent value="reels" className="focus-visible:outline-none">
                <FeedItemEditor reels={reels} setReels={setReels} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right panel: Sticky Live iPhone Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col items-center">
            <div className="mb-3 text-center">
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
              isDemoMode={true}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
