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
  X
} from "lucide-react";

import { CookieModal } from "./cookie-modal";
import { ReportModal } from "./report-modal";
import { cn } from "@/lib/utils";

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
  thumbnailUrl?: string;
  caption: string;
  likes: number;
  promoEnabled?: boolean;
  promoTitle?: string;
  promoCode?: string;
  promoUrl?: string;
  promoDelaySeconds?: number;
  promoCta?: string;
}

export const DEFAULT_DEMO_REEL_URL = "/demo-video-1.mp4";

export const DEFAULT_DEMO_REEL: VideoReel = {
  id: "demo-fallback-reel",
  videoUrl: DEFAULT_DEMO_REEL_URL,
  caption: "Welcome to FeedM.ee! ✨ Create high-converting video reels & bio links.",
  likes: 248,
};

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
  avatarBorderColor: "#FFFFFF",
  avatarBorderWidth: 4,

  headlineColor: "#09090B",
  bioColor: "#27272A",

  cardBgColor: "#FFFFFF",
  cardTextColor: "#09090B",
  cardBorderColor: "#E4E4E7",

  socialIconBgColor: "#FFFFFF",
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

export function sanitizeLeadForm(lf?: Partial<LeadFormSettings> | null): LeadFormSettings {
  const DEFAULT_TITLE = "Get in Touch";
  const DEFAULT_SUBTITLE = "Leave your details below and we'll get back to you shortly.";

  const rawTitle = lf?.title?.trim() || "";
  const rawSubtitle = lf?.subtitle?.trim() || "";

  const isOldHebrewTitle =
    !rawTitle ||
    rawTitle.includes("רוצים להיות חלק") ||
    rawTitle.includes("לפניות עסקיות");

  const isOldHebrewSubtitle =
    !rawSubtitle ||
    rawSubtitle.includes("השאירו פרטים") ||
    rawSubtitle.includes("נחזור אליכם");

  const rawTarget = lf?.target?.trim() || "";
  const isInvalidEmailTarget = /^\d+$/.test(rawTarget) || (!rawTarget.includes("@") && rawTarget.length > 0);
  const cleanTarget = isInvalidEmailTarget ? "" : rawTarget;

  return {
    title: isOldHebrewTitle ? DEFAULT_TITLE : rawTitle,
    subtitle: isOldHebrewSubtitle ? DEFAULT_SUBTITLE : rawSubtitle,
    routeType: lf?.routeType || "email",
    target: cleanTarget,
    is_phone_required: lf?.is_phone_required,
    is_email_required: lf?.is_email_required,
    phoneCountryCode: lf?.phoneCountryCode || "1",
    phoneTarget: lf?.phoneTarget || "",
    showWhatsappButton: lf?.showWhatsappButton,
    showCallButton: lf?.showCallButton,
  };
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
  appearance?: AppearanceSettings;
  fontFamily?: string;
  isDemoMode?: boolean;
  activeTab?: string;
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
    <div className="absolute bottom-28 left-4 right-16 z-30 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-lg flex flex-col gap-2 animate-in slide-in-from-bottom-5 fade-in duration-500">
        <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-white/60 hover:text-white pointer-events-auto transition">
          <X className="h-3 w-3" />
        </button>
        <div className="pr-5">
          <h4 className="text-[11px] font-bold text-white leading-tight">{reel.promoTitle || "Special Offer!"}</h4>
          {reel.promoCode && (
             <div className="mt-1.5 inline-block bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded border border-white/30">
               Code: {reel.promoCode}
             </div>
          )}
        </div>
        <a 
          href={reel.promoUrl || "#"} 
          target="_blank" 
          rel="noreferrer" 
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
}: MobilePreviewProps) {
  const cleanLeadForm = sanitizeLeadForm(leadForm);

  // Appearance settings derivation
  const activeAppearance: AppearanceSettings = {
    ...DEFAULT_APPEARANCE,
    ...(customHexColor ? { bgColor: customHexColor } : {}),
    ...appearance,
  };

  const activeFont = fontFamily || appearance?.fontFamily || activeAppearance.fontFamily || "Inter";

  // Video playback state
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fallback demo reel logic: Use custom reels if uploaded, otherwise fallback to DEFAULT_DEMO_REEL
  const displayReels = reels && reels.length > 0 ? reels.slice(0, 3) : [DEFAULT_DEMO_REEL];

  // Initialize like counts
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    displayReels.forEach((r) => {
      initialCounts[r.id] = r.likes || 142;
    });
    setLikeCounts((prev) => ({ ...initialCounts, ...prev }));
  }, [reels]);

  // Auto-scroll simulator when activeTab changes
  useEffect(() => {
    const root = document.getElementById("simulator-root");
    if (root) {
      if (activeTab === "bio") {
        root.scrollTo({ top: 0, behavior: "smooth" });
      } else if (activeTab === "reels") {
        root.scrollTo({ top: root.clientHeight, behavior: "smooth" });
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    if (leadForm.is_phone_required && !formPhone) return;
    if (leadForm.is_email_required && !formEmail) return;
    
    console.log("Form submitted via email", { formName, formPhone, formEmail });
    setFormSubmitted(true);
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
    const customIconBg = activeAppearance.socialIconBgColor || "#FFFFFF";
    const customIconColor = isFlat
      ? (activeAppearance.socialFlatColor || "#18181b")
      : (BRAND_COLORS[link.platform] || "#18181b");

    const iconClass =
      "flex h-9 w-9 items-center justify-center rounded-full shadow-sm border border-white/40 transition-all duration-200 hover:scale-110 shrink-0";

    const iconStyle: React.CSSProperties = {
      backgroundColor: customIconBg,
      color: customIconColor,
    };

    if (link.label) {
      return (
        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={iconStyle} className={cn("group flex items-center gap-2", iconClass, "w-auto px-3")}>
          {iconElement}
          <span className="text-[10px] font-bold" style={{ color: customIconColor }}>{link.label}</span>
        </a>
      );
    }

    return (
      <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={iconStyle} className={iconClass}>
        {iconElement}
      </a>
    );
  };

  // Dynamic font loading
  useGoogleFont(activeFont);

  const hexColor = activeAppearance.bgColor.startsWith("#")
    ? activeAppearance.bgColor
    : `#${activeAppearance.bgColor}`;

  let mainContainerStyle: React.CSSProperties = {
    fontFamily: `'${activeFont}', sans-serif`,
    ["--selected-profile-font" as any]: `'${activeFont}', sans-serif`,
    ["--user-font-family" as any]: `'${activeFont}', sans-serif`,
    ["--client-font-family" as any]: `'${activeFont}', sans-serif`,
    ["--font-sans" as any]: `'${activeFont}', sans-serif`,
  };

  if (activeAppearance.bgType === "gradient") {
    mainContainerStyle.background = `linear-gradient(${activeAppearance.bgGradientAngle}deg, ${activeAppearance.bgGradientStart}, ${activeAppearance.bgGradientEnd})`;
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
      style={mainContainerStyle}
      className="client-page-root relative h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth text-zinc-900 selection:bg-zinc-900 selection:text-white"
    >
      <style>{`
        .client-page-root, 
        .client-page-root * {
          font-family: var(--client-font-family), sans-serif !important;
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
                backgroundColor: activeAppearance.avatarBorderEnabled ? (activeAppearance.avatarBorderColor || "#ffffff") : "transparent",
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
            .map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
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
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {link.thumbnailUrl && (
                  <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-lg border border-zinc-200/40">
                    <img src={link.thumbnailUrl} alt={link.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span 
                    style={{ color: activeAppearance.cardTextColor || "#09090b" }}
                    className="text-sm font-bold truncate"
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
      {displayReels.map((reel, idx) => (
        <div
          key={reel.id || idx}
          className="snap-start snap-always relative h-full w-full overflow-hidden bg-black text-white"
        >
          {/* Full Screen Video Element */}
          <video
            key={reel.videoUrl || "/demo-video-1.mp4"}
            ref={(el) => {
              if (el) {
                el.muted = isMuted;
                el.play().catch((err) => console.error("Play error:", err));
              }
            }}
            src={reel.videoUrl || "/demo-video-1.mp4"}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onLoadedData={() => console.log("Video loaded successfully!")}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith("/demo-video-1.mp4")) {
                target.src = "/demo-video-1.mp4";
              }
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            className="absolute inset-0 h-full w-full object-cover object-center z-0"
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
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white border border-emerald-400 shadow-lg shadow-emerald-500/30 transition hover:scale-110"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
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

            {/* Bottom Left Video Overlay Footer */}
            <div className="absolute bottom-6 left-4 right-16 z-20 flex flex-col gap-2">
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
              <p className="text-xs font-medium text-white/95 line-clamp-3 leading-relaxed drop-shadow-md pr-2">
                {reel.caption}
              </p>
            </div>

            {/* Promo Banner Overlay */}
            <PromoOverlay reel={reel} />

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
          <h2 className="text-xl font-black text-zinc-900 tracking-tight text-center">
            {cleanLeadForm.title}
          </h2>
          <p className="mt-1 text-xs font-medium text-zinc-700 text-center">
            {cleanLeadForm.subtitle}
          </p>
        </div>

        {/* Lead Form Card */}
        <div className="relative z-10 my-auto rounded-3xl bg-white/90 p-5 shadow-xl shadow-black/5 border border-white/80 backdrop-blur-md">
          {formSubmitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-2 animate-bounce" />
              <h3 className="text-base font-bold text-zinc-900">Thank you!</h3>
              <p className="text-xs text-zinc-600 mt-1">We will get back to you shortly.</p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="mt-4 text-xs font-bold text-zinc-800 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Phone Number {!leadForm.is_phone_required && "(Optional)"}
                </label>
                <input
                  type="tel"
                  required={leadForm.is_phone_required}
                  placeholder="+1 (555) 000-0000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Email Address {!leadForm.is_email_required && "(Optional)"}
                </label>
                <input
                  type="email"
                  required={leadForm.is_email_required}
                  placeholder="john@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-black"
              >
                <Send className="h-3.5 w-3.5" /> Submit
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
            href="https://feedm.ee"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-zinc-600 hover:text-zinc-900 transition"
          >
            <span>Powered by</span>
            <span className="font-extrabold text-zinc-950">FeedM.ee</span>
          </a>

          <div className="flex items-center gap-3 text-[9px] font-medium text-zinc-500">
            <button onClick={() => setIsCookieModalOpen(true)} className="hover:text-zinc-800 transition">
              Manage Cookies
            </button>
            <span>&bull;</span>
            <a href="/privacy" target="_blank" className="hover:text-zinc-800 transition">
              Privacy Policy
            </a>
            <span>&bull;</span>
            <button onClick={() => setIsReportModalOpen(true)} className="hover:text-zinc-800 transition">
              Report Profile
            </button>
          </div>
        </div>
      </div>

      <CookieModal open={isCookieModalOpen} onOpenChange={setIsCookieModalOpen} />
      <ReportModal 
        open={isReportModalOpen} 
        onOpenChange={setIsReportModalOpen} 
        reportedProfileUrl={`https://feedm.ee/${username}`} 
      />
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
