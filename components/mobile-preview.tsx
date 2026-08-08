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
  Sparkles,
  X,
  Play
} from "lucide-react";

import { CookieModal } from "./cookie-modal";
import { ReportModal } from "./report-modal";
import { cn } from "@/lib/utils";
import { sanitizeLeadForm, sanitizeHexColor } from "@/lib/sanitizers";
import { trackAnalyticsEvent } from "@/lib/analytics-tracker";

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  badgeText?: string;
  badgeColor?: string;
  isActive?: boolean;
  thumbnailUrl?: string;
}

export interface VideoReel {
  id: string;
  videoUrl: string;
  url?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  caption: string;
  likes: number;
  productTag?: string;
  isMock?: boolean;
  promoEnabled?: boolean;
  promoTitle?: string;
  promoCode?: string;
  promoUrl?: string;
  promoDelaySeconds?: number;
  promoCta?: string;
}

export const DEFAULT_DEMO_REEL_URL = "/demo-video-1.mp4";

export const DEFAULT_DEMO_REELS: VideoReel[] = [
  {
    id: "demo-1",
    videoUrl: "/demo-video-1.mp4",
    caption: "Still using text links from 2018? Meet FeedM.ee — the video-first bio link that puts your top Reels front & center. 🚀",
    likes: 342,
    promoEnabled: true,
    promoTitle: "Death of Text-Only Bio Links",
    promoCta: "Upgrade Your Bio",
    promoUrl: "/pricing",
  },
  {
    id: "demo-2",
    videoUrl: "/demo-video-2.mp4",
    caption: "Stop letting your best Reels disappear in the feed! Turn your top content into an interactive 24/7 sales engine. 💰",
    likes: 518,
    promoEnabled: true,
    promoTitle: "Turn Views Into Buyers",
    promoCta: "Convert Views To Sales",
    promoUrl: "/pricing",
  },
  {
    id: "demo-3",
    videoUrl: "/demo-video-3.mp4",
    caption: "Build your video bio link in under 60 seconds! Connect, upload your top Reels, and add direct conversion links. ⚡",
    likes: 429,
    promoEnabled: true,
    promoUrl: "/pricing",
  },
];

export const DEFAULT_DEMO_REEL: VideoReel = DEFAULT_DEMO_REELS[0];

export function parseVideoEmbedUrl(url?: string): { isIframe: boolean; embedUrl: string } {
  if (!url) return { isIframe: false, embedUrl: "" };

  const clean = url.trim();

  // YouTube Shorts, Watch, or Shortlink
  const ytMatch = clean.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      isIframe: true,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1`,
    };
  }

  // Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      isIframe: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&autopause=0`,
    };
  }

  // Standard Direct Video File (.mp4, .mov, blob:, data:)
  return {
    isIframe: false,
    embedUrl: clean,
  };
}

export interface SocialLink {
  id: string;
  platform: "instagram" | "youtube" | "twitter" | "tiktok" | "facebook" | "whatsapp" | "linkedin" | "spotify";
  url: string;
  label?: string;
  isActive?: boolean;
}

export interface LeadFormSettings {
  title: string;
  subtitle: string;
  routeType: "email" | "whatsapp";
  target: string;
  phoneCountryCode?: string;
  phoneTarget?: string;
  showWhatsappButton?: boolean;
  showCallButton?: boolean;
  is_phone_required?: boolean;
  is_email_required?: boolean;
}

export interface AppearanceSettings {
  bgType: "solid" | "gradient" | "image";
  bgColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  bgGradientAngle: number;
  bgImageUrl?: string;
  buttonShape: "sharp" | "rounded" | "pill" | "outline";
  fontFamily: "Inter" | "Outfit" | "Montserrat" | "Urbanist" | "Playfair Display" | "Poppins" | string;
  
  avatarBorderEnabled?: boolean;
  avatarBorderColor?: string;
  avatarBorderWidth?: number;

  headlineColor?: string;
  bioColor?: string;

  cardBgColor?: string;
  cardTextColor?: string;
  cardBorderColor?: string;

  socialIconBgColor?: string;
  socialLogoMode?: "brand" | "flat";
  socialFlatColor?: string;
  hideBranding?: boolean;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  bgType: "solid",
  bgColor: "#BAD1CB",
  bgGradientStart: "#FBCFE8",
  bgGradientEnd: "#E0F2FE",
  bgGradientAngle: 135,
  bgImageUrl: "",
  buttonShape: "rounded",
  fontFamily: "Inter",

  avatarBorderEnabled: true,
  avatarBorderColor: undefined,
  avatarBorderWidth: 4,

  headlineColor: "#09090B",
  bioColor: "#27272A",

  cardBgColor: "#FFFFFF",
  cardTextColor: "#09090B",
  cardBorderColor: "#E4E4E7",

  socialIconBgColor: undefined,
  socialLogoMode: "brand",
  socialFlatColor: "#18181B",
};

export function useGoogleFont(fontFamily?: string) {
  useEffect(() => {
    if (!fontFamily) return;
    const fontName = fontFamily.trim();
    if (!fontName) return;

    const id = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    }
  }, [fontFamily]);
}

export function isDarkColor(colorStr?: string): boolean {
  if (!colorStr) return false;
  const clean = colorStr.trim().toLowerCase().replace("#", "");
  if (clean === "000" || clean === "000000" || clean === "09090b" || clean === "18181b" || clean === "0f172a" || clean === "111827" || clean === "1e1b4b" || clean === "020617" || clean === "050505" || clean === "1c1917") return true;
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq < 148;
    }
  }
  return false;
}

export { sanitizeLeadForm } from "@/lib/sanitizers";


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
  appearance?: AppearanceSettings;
  fontFamily?: string;
  isDemoMode?: boolean;
  activeTab?: string;
  analyticsOverlayMode?: "bubbles" | "reels" | "heatmap" | null;
  onTestLeadSubmit?: (targetEmail: string, leadData: { name: string; phone: string; email: string }) => Promise<void> | void;
}

function PromoOverlay({ reel }: { reel: VideoReel }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (!reel.promoEnabled) {
      setShow(false);
      return;
    }
    const delay = (reel.promoDelaySeconds ?? 3) * 1000;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [reel]);

  if (!show || !reel.promoEnabled) return null;

  return (
    <div className="absolute bottom-[155px] left-4 right-20 z-30 pointer-events-none">
      <div className="bg-black/75 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl flex flex-col gap-2 animate-in slide-in-from-bottom-5 fade-in duration-500">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShow(false);
          }}
          className="absolute top-2 right-2 text-white/60 hover:text-white pointer-events-auto transition cursor-pointer p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="pr-5">
          <h4 className="text-[11px] font-bold text-white leading-tight drop-shadow">{reel.promoTitle || "Special Offer!"}</h4>
          {reel.promoCode && (
             <div className="mt-1.5 inline-block bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded border border-white/30 font-mono font-bold">
               Code: {reel.promoCode}
             </div>
          )}
        </div>
        <a 
          href={reel.promoUrl || "#"} 
          target="_blank" 
          rel="noreferrer" 
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-full flex items-center justify-center gap-1 bg-white text-black hover:bg-zinc-200 text-[10px] font-extrabold py-2 rounded-lg pointer-events-auto transition shadow-sm"
        >
           {reel.promoCta || "Get Deal 🚀"}
        </a>
      </div>
    </div>
  );
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
    title: "Get in Touch",
    subtitle: "Leave your details below and we'll get back to you shortly.",
    routeType: "whatsapp",
    target: "1234567890",
  },
  appearance,
  fontFamily,
  isDemoMode = false,
  activeTab,
  analyticsOverlayMode,
  onTestLeadSubmit,
}: MobilePreviewProps) {
  const cleanLeadForm = sanitizeLeadForm(leadForm);

  // Appearance settings derivation: appearance prop takes precedence over default and customHexColor fallback
  const activeAppearance: AppearanceSettings = {
    ...DEFAULT_APPEARANCE,
    ...(customHexColor ? { bgColor: customHexColor } : {}),
    ...appearance,
  };

  const activeFont = fontFamily || appearance?.fontFamily || activeAppearance.fontFamily || "Inter";

  // Video playback state
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activePageIndex, setActivePageIndex] = useState(0); // 0 = Bio, 1..3 = Reels, 4 = Lead Form
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Live user reels derivation: Accept all valid reel objects with videoUrl or url
  const validUserReels = (reels || []).filter(
    (r) => r && (r.videoUrl || r.url)
  );
  const displayReels = validUserReels.length > 0 ? validUserReels.slice(0, 3) : (isDemoMode ? DEFAULT_DEMO_REELS : []);

  // Initialize like counts
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    displayReels.forEach((r) => {
      initialCounts[r.id] = r.likes || 142;
    });
    setLikeCounts((prev) => ({ ...initialCounts, ...prev }));
  }, [reels]);

  // Track active page and reel index on simulator scroll
  const handleSimulatorScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const height = target.clientHeight;
    if (!height) return;
    const pageIndex = Math.round(target.scrollTop / height);
    setActivePageIndex(pageIndex);
    const reelIdx = pageIndex - 1;
    if (reelIdx >= 0 && reelIdx < displayReels.length) {
      if (reelIdx !== currentReelIndex) {
        setCurrentReelIndex(reelIdx);
        setIsPlaying(true);
      }
    }
  };

  // Auto-scroll simulator when activeTab changes
  useEffect(() => {
    const root = document.getElementById("simulator-root");
    if (root) {
      if (activeTab === "bio") {
        root.scrollTo({ top: 0, behavior: "smooth" });
        setActivePageIndex(0);
        setCurrentReelIndex(0);
        setIsPlaying(true);
      } else if (activeTab === "reels") {
        root.scrollTo({ top: root.clientHeight, behavior: "smooth" });
        setActivePageIndex(1);
        setCurrentReelIndex(0);
        setIsPlaying(true);
      }
    }
  }, [activeTab]);

  // Debounce / lock tracking to prevent double-firing like toggles
  const lastLikeClickRef = useRef<Record<string, number>>({});

  const toggleLike = (reelId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const now = Date.now();
    if (lastLikeClickRef.current[reelId] && now - lastLikeClickRef.current[reelId] < 300) {
      return; // Debounce rapid clicks within 300ms
    }
    lastLikeClickRef.current[reelId] = now;

    const isCurrentlyLiked = !!likedReels[reelId];
    const newLikedState = !isCurrentlyLiked;

    setLikedReels((prev) => ({ ...prev, [reelId]: newLikedState }));
    setLikeCounts((prev) => {
      const currentCount = prev[reelId] ?? (displayReels.find((r) => r.id === reelId)?.likes || 142);
      return {
        ...prev,
        [reelId]: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
      };
    });
  };

  const handleShare = async (title: string = "") => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName} on FeedM.ee`,
          text: title || "Check out this profile!",
          url: window.location.href,
        });
      } catch (e) {
        console.log("Share cancelled", e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2500);
    }
  };

  // Helper to sanitize text inputs against XSS HTML injection
  const sanitizeInput = (str: string) => {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .trim();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(formName);
    const cleanPhone = sanitizeInput(formPhone);
    const cleanEmail = sanitizeInput(formEmail);

    if (!cleanName) return;
    if (leadForm.is_phone_required && !cleanPhone) return;
    if (leadForm.is_email_required && !cleanEmail) return;

    const targetEmail = (leadForm.target || "").trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      alert("Please enter a valid target email address in Lead Form settings.");
      return;
    }
    
    console.log("Form submitted", { targetEmail, fullName: cleanName, phone: cleanPhone, email: cleanEmail, username });
    setFormSubmitted(true);
    trackAnalyticsEvent(username, "lead_submit", { metadata: { name: cleanName, email: cleanEmail } });

    try {
      if (onTestLeadSubmit) {
        await onTestLeadSubmit(targetEmail, { name: cleanName, phone: cleanPhone, email: cleanEmail });
      } else {
        const res = await fetch("/api/send-lead-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            targetEmail,
            feedHandle: username || profileName || "main",
            username: username || "main",
            isTest: false,
          }),
        });

        const data = await res.json();
        if (data.warning) {
          console.warn("[Lead Server Warning]:", data.warning);
        }
      }
    } catch (err) {
      console.error("[Lead Submission API Error]:", err);
    }
  };

  // Helper for rendering social icons
  const renderSocialIcon = (link: SocialLink) => {
    if (link.isActive === false) return null;
      
    let iconElement = null;
    
    switch (link.platform) {
      case "instagram":
        iconElement = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
        break;
      case "youtube":
        iconElement = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>;
        break;
      case "twitter":
        iconElement = <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
        break;
      case "tiktok":
        iconElement = <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39v7.76c-.05 2.42-1.34 4.78-3.56 5.82-2.23 1.08-5.07.96-7.17-.32-2.22-1.33-3.41-3.99-2.92-6.55.39-2.22 2.14-4.09 4.36-4.53 1.21-.24 2.48-.06 3.56.55v4.2c-.88-.41-1.92-.48-2.78-.05-.98.47-1.57 1.57-1.45 2.66.1 1.07.94 1.99 2 2.08 1.15.11 2.25-.66 2.46-1.79.05-.28.06-.57.06-.85V.02z"/></svg>;
        break;
      case "facebook":
        iconElement = <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
        break;
      case "whatsapp":
        iconElement = <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
        break;
      case "linkedin":
        iconElement = <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
        break;
      case "spotify":
        iconElement = <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.45 17.294c-.212.348-.675.458-1.023.245-2.805-1.713-6.33-2.1-10.485-1.15-.403.093-.807-.156-.9-.558-.093-.404.156-.807.558-.9 4.545-1.042 8.442-.602 11.606 1.34.348.213.458.675.245 1.023zm1.464-3.267c-.268.435-.852.576-1.287.31-3.21-1.974-8.15-2.573-11.96-1.41-.486.147-1.002-.128-1.15-.615-.146-.486.128-1.002.615-1.15 4.364-1.332 9.805-.672 13.473 1.578.436.267.577.852.31 1.287zm.123-3.415c-3.856-2.287-10.21-2.5-13.9-1.385-.572.173-1.173-.153-1.347-.725-.173-.57.153-1.17.725-1.343 4.296-1.298 11.31-1.05 15.76 1.59.516.305.687.973.382 1.487-.305.515-.973.687-1.488.383z"/></svg>;
        break;
      default:
        return null;
    }

    const BRAND_COLORS: Record<string, string> = {
      instagram: "#E1306C",
      tiktok: "#000000",
      youtube: "#FF0000",
      twitter: "#000000",
      facebook: "#1877F2",
      whatsapp: "#25D366",
      linkedin: "#0A66C2",
      spotify: "#1DB954",
    };

    const isFlat = activeAppearance.socialLogoMode === "flat";
    const customIconBg = activeAppearance.socialIconBgColor || activeAppearance.cardBgColor || customHexColor || "#16a34a";
    const customIconColor = isFlat
      ? (activeAppearance.socialFlatColor || activeAppearance.cardTextColor || "#18181b")
      : (BRAND_COLORS[link.platform] || "#18181b");

    const iconClass =
      "flex h-9 w-9 items-center justify-center rounded-full shadow-sm border border-white/40 transition-all duration-200 hover:scale-110 shrink-0";

    const iconStyle: React.CSSProperties = {
      backgroundColor: customIconBg,
      color: customIconColor,
    };

    if (link.label) {
      return (
        <a 
          key={link.id} 
          href={link.url} 
          target="_blank" 
          rel="noreferrer" 
          style={iconStyle} 
          className={cn("group flex items-center gap-2", iconClass, "w-auto px-3")}
          onClick={() => trackAnalyticsEvent(username, "link_click", { linkUrl: link.url, linkTitle: link.label || link.platform })}
        >
          {iconElement}
          <span className="text-[10px] font-bold" style={{ color: customIconColor }}>{link.label}</span>
        </a>
      );
    }

    return (
      <a 
        key={link.id} 
        href={link.url} 
        target="_blank" 
        rel="noreferrer" 
        style={iconStyle} 
        className={iconClass}
        onClick={() => trackAnalyticsEvent(username, "link_click", { linkUrl: link.url, linkTitle: link.platform })}
      >
        {iconElement}
      </a>
    );
  };

  // Dynamic font loading
  useGoogleFont(activeFont);

  // Sanitize a color value: ensure it is a valid hex/rgba string, never oklch/color-mix
  const sanitizeColor = (c?: string, fallback = "#BAD1CB"): string => sanitizeHexColor(c, fallback);

  const hexColor = sanitizeColor(activeAppearance.bgColor);
  const hexGradStart = sanitizeColor(activeAppearance.bgGradientStart, "#FBCFE8");
  const hexGradEnd = sanitizeColor(activeAppearance.bgGradientEnd, "#E0F2FE");

  let mainContainerStyle: React.CSSProperties = {
    fontFamily: `'${activeFont}', sans-serif`,
    colorScheme: "light" as any,
    forcedColorAdjust: "none" as any,
    ["--selected-profile-font" as any]: `'${activeFont}', sans-serif`,
    ["--user-font-family" as any]: `'${activeFont}', sans-serif`,
    ["--client-font-family" as any]: `'${activeFont}', sans-serif`,
    ["--font-sans" as any]: `'${activeFont}', sans-serif`,
  };

  if (activeAppearance.bgType === "gradient") {
    mainContainerStyle.background = `linear-gradient(${activeAppearance.bgGradientAngle}deg, ${hexGradStart}, ${hexGradEnd})`;
  } else if (activeAppearance.bgType === "image" && activeAppearance.bgImageUrl) {
    mainContainerStyle.backgroundImage = `url(${activeAppearance.bgImageUrl})`;
    mainContainerStyle.backgroundSize = "cover";
    mainContainerStyle.backgroundPosition = "center";
  } else {
    mainContainerStyle.backgroundColor = hexColor;
  }

  // Button Shape styling
  const getButtonShapeClass = () => {
    switch (activeAppearance.buttonShape) {
      case "sharp":
        return "rounded-none bg-white/90 border border-white/60 shadow-md text-zinc-900";
      case "pill":
        return "rounded-full bg-white/90 border border-white/60 shadow-md text-zinc-900 px-5";
      case "outline":
        return "rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/80 text-white shadow-md hover:bg-white/20";
      case "rounded":
      default:
        return "rounded-2xl bg-white/85 border border-white/60 shadow-md text-zinc-900";
    }
  };

  const previewContent = (
    <div
      id="simulator-root"
      onScroll={handleSimulatorScroll}
      style={mainContainerStyle}
      data-color-scheme="light"
      className="client-page-root relative h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth text-zinc-900 selection:bg-zinc-900 selection:text-white"
    >
      <style>{`
        /* ─── Force light color rendering — prevent system/browser dark mode overrides ─── */
        #simulator-root {
          color-scheme: light !important;
          forced-color-adjust: none !important;
        }
        .client-page-root, 
        .client-page-root * {
          font-family: var(--client-font-family), sans-serif !important;
          forced-color-adjust: none;
        }
        #simulator-root h1,
        #simulator-root h2,
        #simulator-root h3,
        #simulator-root p,
        #simulator-root span,
        #simulator-root a,
        #simulator-root button {
          font-family: var(--client-font-family, inherit) !important;
        }
      `}</style>
      {/* Copy Toast Notification */}
      {showCopyToast && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-zinc-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-zinc-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Copied to clipboard!
          </div>
        </div>
      )}

      {/* Analytics Reels Engagement Overlay (Personal Tier) */}
      {analyticsOverlayMode === "reels" && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-zinc-950/90 backdrop-blur-md text-white rounded-xl p-2.5 border border-emerald-500/50 shadow-xl flex items-center justify-between text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-emerald-400 fill-current" />
            <span>Reels Engagement</span>
          </div>
          <span className="text-[11px] font-black text-emerald-400">
            {currentReelIndex === 0 ? "480 Plays • 84% Finish" : currentReelIndex === 1 ? "290 Plays • 72% Finish" : "172 Plays • 68% Finish"}
          </span>
        </div>
      )}

      {/* Analytics Heatmap Hotspots Overlay (Pro / Business Tier) */}
      {analyticsOverlayMode === "heatmap" && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden rounded-3xl">
          {/* Hotspot 1: Top Link */}
          <div className="absolute top-[32%] left-[45%] -translate-x-1/2 w-48 h-16 bg-gradient-to-r from-emerald-500/60 via-teal-400/40 to-emerald-600/50 rounded-full blur-xl opacity-90 animate-pulse" />
          {/* Hotspot 2: Lead Form CTA */}
          <div className="absolute bottom-[22%] left-[50%] -translate-x-1/2 w-44 h-14 bg-gradient-to-r from-teal-500/60 via-emerald-400/50 to-amber-400/30 rounded-full blur-xl opacity-85 animate-pulse" />
          {/* Hotspot 3: WhatsApp Floating Button */}
          <div className="absolute top-[58%] right-[8%] w-24 h-12 bg-emerald-500/50 rounded-full blur-lg opacity-75 animate-pulse" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/50 shadow-xl flex items-center gap-1.5 z-50">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>⚡ Real-Time Analytics Engine Active</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 1: THE BIO / LINKTREE VIEW */}
      {/* ------------------------------------------------------------- */}
      <div className="snap-start snap-always relative flex h-full w-full flex-col justify-between p-6 overflow-hidden">
        {/* Subtle background glow element */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-24 h-64 w-64 rounded-full bg-white/30 blur-3xl pointer-events-none" />

        {/* Top Header section */}
        <div className="relative z-10 flex flex-col items-center text-center pt-6">
          {/* Profile Share Button */}
          <button
            onClick={() => handleShare()}
            className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-sm transition-transform hover:scale-110 hover:bg-white/30 text-zinc-800"
            aria-label="Share Profile"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Avatar with dynamic colored border & width */}
          <div className="relative mb-3 mt-4">
            <div 
              className="h-24 w-24 rounded-full p-1 shadow-xl overflow-hidden"
              style={{
                backgroundColor: activeAppearance.avatarBorderEnabled ? (activeAppearance.avatarBorderColor || activeAppearance.cardBgColor || customHexColor || "#16a34a") : "transparent",
                borderColor: activeAppearance.avatarBorderEnabled ? (activeAppearance.avatarBorderColor || activeAppearance.cardBgColor || customHexColor || "#16a34a") : "transparent",
                padding: activeAppearance.avatarBorderEnabled ? `${activeAppearance.avatarBorderWidth || 4}px` : "0px",
              }}
            >
              <img
                src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"}
                alt={profileName}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Name & Handle */}
          <h1 
            style={{ color: activeAppearance.headlineColor || "#09090b" }}
            className="text-2xl font-black tracking-tight"
          >
            {profileName || "Creator Name"}
          </h1>
          <p 
            style={{ color: activeAppearance.bioColor || "#27272a" }}
            className="text-xs font-bold opacity-80 tracking-wide mt-0.5"
          >
            @{username || "username"}
          </p>

          {/* Tagline / Bio */}
          <p 
            style={{ color: activeAppearance.bioColor || "#27272a" }}
            className="mt-2 text-xs font-medium leading-relaxed max-w-[260px]"
          >
            {bio || "Welcome to my video bio page! Tap links below or scroll down for videos."}
          </p>
        </div>

        {/* Middle Section: Custom Links (Linktree style) */}
        <div className="relative z-10 my-4 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-0.5">
          {customLinks
            .filter((link) => link.isActive !== false)
            .map((link, idx) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackAnalyticsEvent(username, "link_click", { linkUrl: link.url, linkTitle: link.title })}
              style={{
                backgroundColor: activeAppearance.cardBgColor || "rgba(255, 255, 255, 0.85)",
                color: activeAppearance.cardTextColor || "#09090b",
                borderColor: activeAppearance.cardBorderColor || "rgba(255, 255, 255, 0.6)",
              }}
              className={cn(
                "group relative flex items-center justify-between p-3.5 shadow-black/5 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                getButtonShapeClass()
              )}
            >
              {/* Analytics Click Bubbles Overlay (Free Tier) */}
              {analyticsOverlayMode === "bubbles" && (
                <div className="absolute -top-2.5 right-3 z-30 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border border-emerald-300 animate-bounce flex items-center gap-1">
                  <span>+{idx === 0 ? 142 : idx === 1 ? 98 : idx === 2 ? 84 : 60} clicks</span>
                </div>
              )}

              <div className="flex items-center gap-3 min-w-0 pr-2">
                {link.thumbnailUrl?.trim() ? (
                  <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-lg border border-zinc-200/40">
                    <img src={link.thumbnailUrl} alt={link.title} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="flex flex-col min-w-0">
                  <span 
                    style={{ color: activeAppearance.cardTextColor || "#09090b" }}
                    className="text-xs sm:text-sm font-bold leading-tight line-clamp-2 text-left break-words"
                  >
                    {link.title}
                  </span>
                  {link.badgeText && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 w-fit">
                      <Tag className="h-3 w-3 text-emerald-600" />
                      <span>{link.badgeText}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-zinc-200 group-hover:text-zinc-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
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

          {/* Scroll Down Prompt with Dynamic Contrast */}
          {(() => {
            const isDarkBg = 
              isDarkColor(activeAppearance.bgColor) ||
              isDarkColor(activeAppearance.bgGradientStart) ||
              (activeAppearance.cardTextColor || "").toLowerCase() === "#ffffff" ||
              (activeAppearance.cardTextColor || "").toLowerCase() === "#fafafa" ||
              (activeAppearance.cardTextColor || "").toLowerCase() === "#f8fafc" ||
              (activeAppearance.headlineColor || "").toLowerCase() === "#ffffff";

            return (
              <div 
                style={{ color: isDarkBg ? "#FFFFFF" : (activeAppearance.cardTextColor || "#09090B") }}
                className="flex items-center gap-1 text-[11px] font-extrabold tracking-wider uppercase animate-bounce pt-1 drop-shadow-md"
              >
                <span>Scroll for Reels</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            );
          })()}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PAGES 2 to 4: VERTICAL REEL FEED (Up to 3 Videos) */}
      {/* ------------------------------------------------------------- */}
      {displayReels.map((reel, idx) => {
        // Watermark check: Show "FeedM.ee Example" ONLY IF video is default/fallback mock video
        const isMockVideo = !reel.videoUrl || reel.videoUrl.includes("coverr.co") || reel.videoUrl.includes("sample-3s") || Boolean((reel as any).isMock);

        return (
        <div
          key={reel.id || idx}
          onClick={() => {
            if (idx === currentReelIndex) {
              setIsPlaying((prev) => !prev);
            }
          }}
          className="snap-start snap-always relative h-full w-full overflow-hidden bg-black text-white cursor-pointer select-none"
        >
          {/* Full Screen Video / Embed Element */}
          {(() => {
            const rawUrl = reel.videoUrl || reel.url || "";
            const parsed = parseVideoEmbedUrl(rawUrl);

            if (parsed.isIframe && parsed.embedUrl) {
              return (
                <div className="absolute inset-0 h-full w-full bg-black z-0 pointer-events-none">
                  <iframe
                    src={parsed.embedUrl}
                    title={reel.caption || `Video Reel ${idx + 1}`}
                    className="h-full w-full object-cover border-0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }

            return (
              <video
                key={rawUrl}
                ref={(el) => {
                  if (el) {
                    const isReelSectionActive = activePageIndex >= 1 && activePageIndex <= displayReels.length;
                    const isVideoActive = isReelSectionActive && idx === currentReelIndex && isPlaying;
                    const shouldBeMuted = !isReelSectionActive || idx !== currentReelIndex || isMuted;

                    el.muted = shouldBeMuted;
                    if (isVideoActive) {
                      el.play().catch((err) => console.error("Play error:", err));
                    } else {
                      el.pause();
                    }
                  }
                }}
                src={rawUrl || "/demo-video-1.mp4"}
                poster={reel.thumbnailUrl || reel.posterUrl}
                autoPlay={activePageIndex >= 1 && activePageIndex <= displayReels.length && idx === currentReelIndex && isPlaying}
                loop
                muted={!(activePageIndex >= 1 && activePageIndex <= displayReels.length) || idx !== currentReelIndex || isMuted}
                playsInline
                preload="auto"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                className="absolute inset-0 h-full w-full object-cover object-center z-0 cursor-pointer"
              />
            );
          })()}

          {/* Video Overlay Tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

          {/* Play/Pause Center Indicator */}
          {!isPlaying && idx === currentReelIndex && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] pointer-events-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/30 shadow-2xl animate-in zoom-in-75 fade-in duration-200">
                <Play className="h-8 w-8 fill-current text-white translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Top Mute Toggle Bar */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition hover:bg-black/60"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Watermark Overlay ONLY for Fallback/Mock Demo Videos (Removed for Custom Videos) */}
          {isMockVideo && (
            <div className="absolute top-4 left-16 z-20 pointer-events-none">
              <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white/90 border border-white/20 tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-300 fill-current" /> FeedM.ee Example
              </span>
            </div>
          )}

          {/* Top Page Indicator Pill */}
          <div className="absolute top-4 right-4 z-20">
            <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/20">
              Reel {idx + 1}/3
            </span>
          </div>

          {/* Right Side Interaction Buttons Column */}
          <div className="absolute right-4 bottom-[220px] z-20 flex flex-col items-center gap-5">
            {/* Like Button & Counter */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => toggleLike(reel.id, e)}
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

            {/* WhatsApp Direct Action Button (If enabled globally) */}
            {leadForm.showWhatsappButton && (
              <a
                href={
                  leadForm.phoneTarget
                    ? `https://wa.me/${(leadForm.phoneCountryCode || "1").replace(/[^0-9]/g, "")}${leadForm.phoneTarget.replace(/^0+/, "").replace(/[^0-9]/g, "")}`
                    : "#"
                }
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition duration-300 group-hover:scale-110">
                  <MessageCircle className="h-6 w-6 fill-current text-white" />
                </div>
                <span className="text-[10px] font-extrabold text-white drop-shadow-md">WhatsApp</span>
              </a>
            )}

            {/* Call Direct Action Button (If enabled globally) */}
            {leadForm.showCallButton && (
              <a
                href={
                  leadForm.phoneTarget 
                    ? `tel:+${(leadForm.phoneCountryCode || "1").replace(/[^0-9]/g, "")}${leadForm.phoneTarget.replace(/^0+/, "").replace(/[^0-9]/g, "")}` 
                    : "#"
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white border border-cyan-400 shadow-lg shadow-cyan-500/30 transition hover:scale-110"
              >
                <Phone className="h-5 w-5 fill-current" />
              </a>
            )}
          </div>

            {/* Bottom Left Video Overlay Footer: Avatar + Username + Caption */}
            <div className="absolute bottom-6 left-4 right-16 z-20 flex flex-col gap-2.5 text-left">
              {/* Creator Profile Avatar Thumbnail & Handle Badge */}
              <div className="flex items-center gap-2">
                <img
                  src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover border-2 border-white/80 shadow-md shrink-0"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white drop-shadow-md tracking-tight">
                    @{username || "username"}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </div>
              </div>

              {reel.productTag && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md self-start">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{reel.productTag}</span>
                </div>
              )}

              {/* Video Caption */}
              <p className="text-xs font-medium text-white/95 line-clamp-3 leading-snug drop-shadow-md pr-2">
                {reel.caption}
              </p>
            </div>
        </div>
      );
      })}

      {/* ------------------------------------------------------------- */}
      {/* PAGE 5: THE CONTACT / COLLABORATION FORM */}
      {/* ------------------------------------------------------------- */}
      {(() => {
        const isDarkBg = 
          isDarkColor(activeAppearance.bgColor) ||
          isDarkColor(activeAppearance.bgGradientStart) ||
          (activeAppearance.cardTextColor || "").toLowerCase() === "#ffffff" ||
          (activeAppearance.cardTextColor || "").toLowerCase() === "#fafafa" ||
          (activeAppearance.cardTextColor || "").toLowerCase() === "#f8fafc" ||
          (activeAppearance.headlineColor || "").toLowerCase() === "#ffffff";
        
        const headerTextColor = isDarkBg ? "#FFFFFF" : (activeAppearance.headlineColor || activeAppearance.cardTextColor || "#09090B");
        const subtitleTextColor = isDarkBg ? "rgba(255, 255, 255, 0.9)" : (activeAppearance.bioColor || activeAppearance.cardTextColor || "rgba(9, 9, 11, 0.85)");

        return (
          <div className="snap-start snap-always relative flex h-full w-full flex-col justify-between p-6 overflow-hidden">
            {/* Subtle glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-white/20 blur-3xl pointer-events-none" />

            {/* Center Section: Header + Form Card grouped directly together */}
            <div className="relative z-10 my-auto flex flex-col gap-2.5 w-full">
              {/* Header - Positioned DIRECTLY above the lead form card with tight spacing */}
              <div className="text-center space-y-1 px-2">
                <h2
                  style={{ color: headerTextColor }}
                  className="text-xl font-black tracking-tight text-center drop-shadow-md"
                >
                  {cleanLeadForm.title}
                </h2>
                <p
                  style={{ color: subtitleTextColor }}
                  className="text-xs font-medium text-center drop-shadow-md leading-snug"
                >
                  {cleanLeadForm.subtitle}
                </p>
              </div>

              {/* Lead Form Card */}
              <div
                style={{
                  backgroundColor: activeAppearance.cardBgColor || "rgba(255, 255, 255, 0.9)",
                  color: activeAppearance.cardTextColor || "#09090b",
                  borderColor: activeAppearance.cardBorderColor || "rgba(255, 255, 255, 0.8)",
                }}
                className="rounded-3xl p-5 shadow-xl shadow-black/5 backdrop-blur-md border"
              >
                {formSubmitted ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-2 animate-bounce" />
                    <h3 className="text-base font-bold">Thank you!</h3>
                    <p className="text-xs opacity-80 mt-1">We will get back to you shortly.</p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="mt-4 text-xs font-bold underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[11px] font-bold opacity-80 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 bg-white/90 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold opacity-80 mb-1">
                        Phone Number {!leadForm.is_phone_required && "(Optional)"}
                      </label>
                      <input
                        type="tel"
                        required={leadForm.is_phone_required}
                        placeholder="+1 (555) 000-0000"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 bg-white/90 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold opacity-80 mb-1">
                        Email Address {!leadForm.is_email_required && "(Optional)"}
                      </label>
                      <input
                        type="email"
                        required={leadForm.is_email_required}
                        placeholder="john@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200/80 bg-white/90 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-2xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" /> Submit
                    </button>

                    <p className="text-[10px] text-center opacity-65 leading-tight mt-1.5 px-1">
                      By submitting, you agree to receive communications from this creator and accept our{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium hover:opacity-100 transition-opacity"
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* Footer: Social Icons & Powered By - Strictly at Bottom */}
            <div className="relative z-10 flex flex-col items-center gap-3 pb-2">
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2 justify-center">
                  {socialLinks.map(renderSocialIcon)}
                </div>
              )}

              {!activeAppearance.hideBranding && (
                <a
                  href="https://feedm.ee"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: isDarkBg ? "rgba(255, 255, 255, 0.8)" : "rgba(9, 9, 11, 0.7)" }}
                  className="flex items-center gap-1 text-[10px] font-bold tracking-wider hover:opacity-100 transition"
                >
                  <span>Powered by</span>
                  <span style={{ color: isDarkBg ? "#FFFFFF" : "#09090b" }} className="font-extrabold">FeedM.ee</span>
                </a>
              )}

              <div
                style={{ color: isDarkBg ? "rgba(255, 255, 255, 0.6)" : "rgba(9, 9, 11, 0.6)" }}
                className="flex items-center gap-3 text-[9px] font-medium"
              >
                <button onClick={() => setIsCookieModalOpen(true)} className="hover:opacity-100 transition cursor-pointer">
                  Manage Cookies
                </button>
                <span>&bull;</span>
                <a href="/privacy" target="_blank" className="hover:opacity-100 transition">
                  Privacy Policy
                </a>
                <span>&bull;</span>
                <button onClick={() => setIsReportModalOpen(true)} className="hover:opacity-100 transition cursor-pointer">
                  Report Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <CookieModal open={isCookieModalOpen} onOpenChange={setIsCookieModalOpen} />
      <ReportModal 
        open={isReportModalOpen} 
        onOpenChange={setIsReportModalOpen} 
        reportedProfileUrl={`https://feedm.ee/${username}`} 
      />
    </div>
  );

  // If in demo mode inside dashboard, render inside physical smartphone chassis
  if (isDemoMode) {
    return (
      <div className="relative mx-auto flex h-[740px] w-[375px] shrink-0 flex-col overflow-hidden rounded-[48px] bg-zinc-950 border-[12px] border-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-0 left-1/2 z-40 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-zinc-950 border-b border-x border-zinc-800/80 shadow-inner flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="h-1 w-7 rounded-full bg-zinc-800" />
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
    <div className="w-full bg-zinc-100 flex justify-center overflow-hidden" style={{ height: "100dvh" }}>
      <div className="w-full max-w-[480px] h-full">
        <style jsx global>{`
          html, body {
            height: 100%;
            height: 100dvh;
            overflow: hidden;
          }
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
