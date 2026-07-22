"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  ChevronDown,
  ExternalLink,
  Tag,
  Send,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  badgeText?: string;
  badgeColor?: string;
}

export interface VideoReel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  likes: number;
  showWhatsapp?: boolean;
  showCall?: boolean;
}

export interface SocialLink {
  platform: "instagram" | "youtube" | "twitter" | "tiktok" | "facebook";
  url: string;
}

export interface LeadFormSettings {
  title: string;
  subtitle: string;
  routeType: "email" | "whatsapp";
  target: string;
}

interface MobilePreviewProps {
  profileName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  customHexColor: string; // e.g. "#bad1cb"
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
  reels: VideoReel[];
  leadForm: LeadFormSettings;
  isDemoMode?: boolean;
}

export function MobilePreview({
  profileName,
  username,
  bio,
  avatarUrl,
  customHexColor = "#bad1cb",
  socialLinks = [],
  customLinks = [],
  reels = [],
  leadForm = {
    title: "רוצים להיות חלק? / לפניות עסקיות",
    subtitle: "השאירו פרטים ונחזור אליכם בהקדם",
    routeType: "whatsapp",
    target: "1234567890",
  },
  isDemoMode = false,
}: MobilePreviewProps) {
  // Video playback state
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formMsg, setFormMsg] = useState("");

  // Initialize like counts
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    reels.forEach((r) => {
      initialCounts[r.id] = r.likes || 142;
    });
    setLikeCounts(initialCounts);
  }, [reels]);

  const toggleLike = (reelId: string) => {
    setLikedReels((prev) => {
      const isLiked = !!prev[reelId];
      setLikeCounts((cPrev) => ({
        ...cPrev,
        [reelId]: (cPrev[reelId] || 0) + (isLiked ? -1 : 1),
      }));
      return { ...prev, [reelId]: !isLiked };
    });
  };

  const handleShare = async (title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName} on FeedM.ee`,
          text: title,
          url: window.location.href,
        });
      } catch (e) {
        console.log("Share cancelled", e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formContact) return;
    setFormSubmitted(true);

    if (leadForm.routeType === "whatsapp" && leadForm.target) {
      const msg = encodeURIComponent(
        `היי ${profileName}, פנייה חדשה מאת ${formName} (${formContact}): ${formMsg}`
      );
      const cleanPhone = leadForm.target.replace(/[^0-9]/g, "");
      setTimeout(() => {
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
      }, 800);
    }
  };

  // Helper for rendering social icons
  const renderSocialIcon = (link: SocialLink) => {
    const iconClass =
      "flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-sm border border-zinc-200/80 transition-all duration-200 hover:scale-110 hover:bg-white hover:text-black";
    switch (link.platform) {
      case "instagram":
        return (
          <a key={link.platform} href={link.url} target="_blank" rel="noreferrer" className={iconClass}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
        );
      case "youtube":
        return (
          <a key={link.platform} href={link.url} target="_blank" rel="noreferrer" className={iconClass}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
          </a>
        );
      case "twitter":
        return (
          <a key={link.platform} href={link.url} target="_blank" rel="noreferrer" className={iconClass}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        );
      case "tiktok":
        return (
          <a key={link.platform} href={link.url} target="_blank" rel="noreferrer" className={iconClass}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39v7.76c-.05 2.42-1.34 4.78-3.56 5.82-2.23 1.08-5.07.96-7.17-.32-2.22-1.33-3.41-3.99-2.92-6.55.39-2.22 2.14-4.09 4.36-4.53 1.21-.24 2.48-.06 3.56.55v4.2c-.88-.41-1.92-.48-2.78-.05-.98.47-1.57 1.57-1.45 2.66.1 1.07.94 1.99 2 2.08 1.15.11 2.25-.66 2.46-1.79.05-.28.06-.57.06-.85V.02z"/></svg>
          </a>
        );
      case "facebook":
        return (
          <a key={link.platform} href={link.url} target="_blank" rel="noreferrer" className={iconClass}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
        );
      default:
        return null;
    }
  };

  // Dynamic Hex color styles derivation
  const hexColor = customHexColor.startsWith("#") ? customHexColor : `#${customHexColor}`;

  const mainContainerStyle: React.CSSProperties = {
    backgroundColor: hexColor,
  };

  const previewContent = (
    <div
      style={mainContainerStyle}
      className="relative h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white"
    >
      {/* ------------------------------------------------------------- */}
      {/* PAGE 1: THE BIO / LINKTREE VIEW */}
      {/* ------------------------------------------------------------- */}
      <div className="snap-start snap-always relative flex h-full w-full flex-col justify-between p-6 overflow-hidden">
        {/* Subtle background glow element */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-white/30 blur-3xl pointer-events-none" />

        {/* Top Header section */}
        <div className="relative z-10 flex flex-col items-center text-center pt-6">
          {/* Avatar with dynamic colored border */}
          <div className="relative mb-3">
            <div className="h-24 w-24 rounded-full p-1 bg-white shadow-xl">
              <img
                src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"}
                alt={profileName}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Name & Handle */}
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">{profileName || "Creator Name"}</h1>
          <p className="text-xs font-bold text-zinc-700/80 tracking-wide mt-0.5">@{username || "username"}</p>

          {/* Tagline / Bio */}
          <p className="mt-2 text-xs font-medium text-zinc-800 leading-relaxed max-w-[260px]">
            {bio || "Welcome to my video bio page! Tap links below or scroll down for videos."}
          </p>
        </div>

        {/* Middle Section: Custom Links (Linktree style) */}
        <div className="relative z-10 my-4 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-0.5">
          {customLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-between rounded-2xl bg-white/85 p-3.5 shadow-md shadow-black/5 backdrop-blur-md border border-white/60 transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-lg"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm font-bold text-zinc-900 truncate group-hover:text-black">
                  {link.title}
                </span>
                {link.badgeText && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 w-fit">
                    <Tag className="h-3 w-3 text-emerald-600" />
                    <span>{link.badgeText}</span>
                  </div>
                )}
              </div>

              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition duration-300 group-hover:bg-zinc-900 group-hover:text-white">
                <ExternalLink className="h-4 w-4" />
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Section: Social Icons & Scroll Down Indicator */}
        <div className="relative z-10 flex flex-col items-center gap-4 pb-2">
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2.5 justify-center">
              {socialLinks.map(renderSocialIcon)}
            </div>
          )}

          {/* Scroll Down Prompt */}
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-zinc-800 tracking-wider uppercase animate-bounce pt-1">
            <span>Scroll for Reels</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PAGES 2 to 4: VERTICAL REEL FEED (Up to 3 Videos) */}
      {/* ------------------------------------------------------------- */}
      {reels.slice(0, 3).map((reel, idx) => (
        <div
          key={reel.id || idx}
          className="snap-start snap-always relative h-full w-full overflow-hidden bg-black text-white"
        >
          {/* Full Screen Video Element */}
          <video
            src={reel.videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="h-full w-full object-cover"
          />

          {/* Top Mute Toggle Bar */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition hover:bg-black/60"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Top Page Indicator Pill */}
          <div className="absolute top-4 right-4 z-20">
            <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/20">
              Reel {idx + 1}/3
            </span>
          </div>

          {/* Right Side Interaction Buttons Column */}
          <div className="absolute right-4 bottom-16 z-20 flex flex-col items-center gap-5">
            {/* Like Button & Counter */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => toggleLike(reel.id)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110",
                  likedReels[reel.id]
                    ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30"
                    : "bg-black/40 text-white border-white/20 hover:bg-black/60"
                )}
              >
                <Heart
                  className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    likedReels[reel.id] && "fill-current scale-110"
                  )}
                />
              </button>
              <span className="text-[11px] font-extrabold text-white drop-shadow-md">
                {likeCounts[reel.id] || reel.likes || 142}
              </span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleShare(reel.caption)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition hover:bg-black/60 hover:scale-110"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <span className="text-[10px] font-bold text-white drop-shadow-md">Share</span>
            </div>

            {/* WhatsApp Direct Action Button (If enabled) */}
            {reel.showWhatsapp && (
              <a
                href={
                  leadForm.target
                    ? `https://wa.me/${leadForm.target.replace(/[^0-9]/g, "")}`
                    : "#"
                }
                target="_blank"
                rel="noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white border border-emerald-400 shadow-lg shadow-emerald-500/30 transition hover:scale-110"
              >
                <MessageCircle className="h-6 w-6 fill-current" />
              </a>
            )}

            {/* Call Direct Action Button (If enabled) */}
            {reel.showCall && (
              <a
                href={
                  leadForm.target ? `tel:${leadForm.target.replace(/[^0-9]/g, "")}` : "#"
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white border border-cyan-400 shadow-lg shadow-cyan-500/30 transition hover:scale-110"
              >
                <Phone className="h-5 w-5 fill-current" />
              </a>
            )}
          </div>

          {/* Bottom Left Video Overlay Footer */}
          <div className="absolute bottom-6 left-4 right-20 z-20 flex flex-col gap-2">
            {/* Creator Handle badge */}
            <div className="flex items-center gap-2">
              <img
                src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                alt=""
                className="h-8 w-8 rounded-full object-cover border border-white/40 shadow-sm"
              />
              <span className="text-xs font-black text-white drop-shadow-md">
                @{username || "username"}
              </span>
            </div>

            {/* Video Caption */}
            <p className="text-xs font-medium text-white/95 line-clamp-3 leading-relaxed drop-shadow-md">
              {reel.caption}
            </p>
          </div>

          {/* Bottom Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
        </div>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 5: THE CONTACT / COLLABORATION FORM */}
      {/* ------------------------------------------------------------- */}
      <div className="snap-start snap-always relative flex h-full w-full flex-col justify-between p-6 overflow-hidden">
        {/* Subtle glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-white/40 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 pt-4 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-md text-zinc-900">
            <Sparkles className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            {leadForm.title || "רוצים להיות חלק? / לפניות עסקיות"}
          </h2>
          <p className="mt-1 text-xs font-medium text-zinc-700">
            {leadForm.subtitle || "השאירו פרטים ונחזור אליכם בהקדם"}
          </p>
        </div>

        {/* Lead Form Card */}
        <div className="relative z-10 my-auto rounded-3xl bg-white/90 p-5 shadow-xl shadow-black/5 border border-white/80 backdrop-blur-md">
          {formSubmitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-2 animate-bounce" />
              <h3 className="text-base font-bold text-zinc-900">תודה רבה! הפנייה נשלחה</h3>
              <p className="text-xs text-zinc-600 mt-1">נחזור אליך בהקדם האפשרי.</p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="mt-4 text-xs font-bold text-zinc-800 underline"
              >
                שלח פנייה נוספת
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">שם מלא</label>
                <input
                  type="text"
                  required
                  placeholder="ישראל ישראלי"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">אימייל / טלפון</label>
                <input
                  type="text"
                  required
                  placeholder="050-0000000 / email@domain.com"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">הודעה / פרטי פנייה</label>
                <textarea
                  rows={2}
                  placeholder="רשמו כאן במה מדובר..."
                  value={formMsg}
                  onChange={(e) => setFormMsg(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-black"
              >
                <Send className="h-3.5 w-3.5" /> שלח פנייה
              </button>
            </form>
          )}
        </div>

        {/* Footer: Social Icons & Powered By */}
        <div className="relative z-10 flex flex-col items-center gap-3 pb-2">
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 justify-center">
              {socialLinks.map(renderSocialIcon)}
            </div>
          )}

          <a
            href="#"
            className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-zinc-600 hover:text-zinc-900 transition"
          >
            <span>Powered by</span>
            <span className="font-extrabold text-zinc-950">FeedM.ee</span>
          </a>
        </div>
      </div>
    </div>
  );

  // If in demo mode inside dashboard, render inside physical iPhone chassis
  if (isDemoMode) {
    return (
      <div className="relative mx-auto flex h-[760px] w-[360px] flex-col overflow-hidden rounded-[48px] bg-zinc-950 border-[10px] border-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/10">
        {/* Dynamic iPhone Notch */}
        <div className="absolute top-0 left-1/2 z-40 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-900">
          <div className="absolute top-1.5 left-1/2 flex -translate-x-1/2 items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-zinc-800" />
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
          </div>
        </div>

        <style jsx global>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
          .overflow-y-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {previewContent}
      </div>
    );
  }

  // Full Screen Mobile / Web Layout
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <div className="w-full max-w-[480px] h-screen sm:h-[90vh] sm:my-6 sm:rounded-[36px] sm:overflow-hidden sm:shadow-2xl sm:border sm:border-zinc-200">
        <style jsx global>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
          .overflow-y-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {previewContent}
      </div>
    </div>
  );
}
