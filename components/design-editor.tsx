"use client";

import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "@/components/upgrade-modal";
import { 
  Palette, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Sparkles, 
  ImageIcon, 
  Paintbrush, 
  Type, 
  Layers,
  Check,
  User,
  Link as LinkIcon,
  Share2,
  UploadCloud,
  X,
  Grid,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppearanceSettings, DEFAULT_APPEARANCE, useGoogleFont } from "./mobile-preview";

interface DesignEditorProps {
  customHexColor: string;
  setCustomHexColor: (hex: string) => void;
  appearance?: AppearanceSettings;
  setAppearance?: (app: AppearanceSettings) => void;
  planType?: string;
  onRegisterActions?: (actions: {
    reset: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  }) => void;
}

export const THEME_PRESETS: {
  id: string;
  name: string;
  description: string;
  bgPreviewStyle: React.CSSProperties;
  settings: AppearanceSettings;
}[] = [
  {
    id: "emerald-champagne",
    name: "Emerald & Champagne",
    description: "Rich emerald green with warm champagne cards",
    bgPreviewStyle: { backgroundColor: "#0A4E3B" },
    settings: {
      bgType: "solid",
      bgColor: "#0A4E3B",
      bgGradientStart: "#0A4E3B",
      bgGradientEnd: "#0A4E3B",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Inter",
      avatarBorderEnabled: true,
      avatarBorderColor: "#F2E7CD",
      avatarBorderWidth: 4,
      headlineColor: "#F2E7CD",
      bioColor: "#E2D7BE",
      cardBgColor: "#F2E7CD",
      cardTextColor: "#0F172A",
      cardBorderColor: "#F2E7CD",
      socialIconBgColor: "#F2E7CD",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "butter-royal-iris",
    name: "Butter & Royal Iris",
    description: "Deep royal iris blue with buttery yellow cards",
    bgPreviewStyle: { backgroundColor: "#2A00A3" },
    settings: {
      bgType: "solid",
      bgColor: "#2A00A3",
      bgGradientStart: "#2A00A3",
      bgGradientEnd: "#2A00A3",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Outfit",
      avatarBorderEnabled: true,
      avatarBorderColor: "#FFF275",
      avatarBorderWidth: 4,
      headlineColor: "#FFF275",
      bioColor: "#FDE68A",
      cardBgColor: "#FFF275",
      cardTextColor: "#0F172A",
      cardBorderColor: "#FFF275",
      socialIconBgColor: "#FFF275",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "cyber-grape-acid-lime",
    name: "Cyber Grape & Acid Lime",
    description: "Vibrant purple with electric acid lime cards",
    bgPreviewStyle: { backgroundColor: "#5A00F4" },
    settings: {
      bgType: "solid",
      bgColor: "#5A00F4",
      bgGradientStart: "#5A00F4",
      bgGradientEnd: "#5A00F4",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "pill",
      fontFamily: "Urbanist",
      avatarBorderEnabled: true,
      avatarBorderColor: "#D7FF00",
      avatarBorderWidth: 4,
      headlineColor: "#D7FF00",
      bioColor: "#F4FF81",
      cardBgColor: "#D7FF00",
      cardTextColor: "#0F172A",
      cardBorderColor: "#D7FF00",
      socialIconBgColor: "#D7FF00",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "raspberry-pale-sky",
    name: "Raspberry & Pale Sky",
    description: "Bold raspberry pink with sky blue cards",
    bgPreviewStyle: { backgroundColor: "#C21B5B" },
    settings: {
      bgType: "solid",
      bgColor: "#C21B5B",
      bgGradientStart: "#C21B5B",
      bgGradientEnd: "#C21B5B",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Montserrat",
      avatarBorderEnabled: true,
      avatarBorderColor: "#E0F2FE",
      avatarBorderWidth: 4,
      headlineColor: "#E0F2FE",
      bioColor: "#BAE6FD",
      cardBgColor: "#E0F2FE",
      cardTextColor: "#0F172A",
      cardBorderColor: "#E0F2FE",
      socialIconBgColor: "#E0F2FE",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "deep-graphite-lime",
    name: "Deep Graphite & Lime Compute",
    description: "Dark graphite charcoal with neon lime cards",
    bgPreviewStyle: { backgroundColor: "#1F2329" },
    settings: {
      bgType: "solid",
      bgColor: "#1F2329",
      bgGradientStart: "#1F2329",
      bgGradientEnd: "#1F2329",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "sharp",
      fontFamily: "Inter",
      avatarBorderEnabled: true,
      avatarBorderColor: "#B0FF2E",
      avatarBorderWidth: 4,
      headlineColor: "#B0FF2E",
      bioColor: "#D4FF70",
      cardBgColor: "#B0FF2E",
      cardTextColor: "#0F172A",
      cardBorderColor: "#B0FF2E",
      socialIconBgColor: "#B0FF2E",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "blueberry-cream-soda",
    name: "Blueberry & Cream Soda",
    description: "Deep navy blueberry with cream soda cards",
    bgPreviewStyle: { backgroundColor: "#243B9B" },
    settings: {
      bgType: "solid",
      bgColor: "#243B9B",
      bgGradientStart: "#243B9B",
      bgGradientEnd: "#243B9B",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Poppins",
      avatarBorderEnabled: true,
      avatarBorderColor: "#FFF0D3",
      avatarBorderWidth: 4,
      headlineColor: "#FFF0D3",
      bioColor: "#FDE68A",
      cardBgColor: "#FFF0D3",
      cardTextColor: "#0F172A",
      cardBorderColor: "#FFF0D3",
      socialIconBgColor: "#FFF0D3",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "cyber-teal-aqua-foam",
    name: "Cyber Teal & Aqua Foam",
    description: "Dark cyber teal with aqua foam cards",
    bgPreviewStyle: { backgroundColor: "#033B3A" },
    settings: {
      bgType: "solid",
      bgColor: "#033B3A",
      bgGradientStart: "#033B3A",
      bgGradientEnd: "#033B3A",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "pill",
      fontFamily: "Urbanist",
      avatarBorderEnabled: true,
      avatarBorderColor: "#A6FFED",
      avatarBorderWidth: 4,
      headlineColor: "#A6FFED",
      bioColor: "#C7FFFA",
      cardBgColor: "#A6FFED",
      cardTextColor: "#0F172A",
      cardBorderColor: "#A6FFED",
      socialIconBgColor: "#A6FFED",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "neon-lime-violet-ink",
    name: "Neon Lime & Violet Ink",
    description: "Deep violet ink with neon lime cards",
    bgPreviewStyle: { backgroundColor: "#2C1959" },
    settings: {
      bgType: "solid",
      bgColor: "#2C1959",
      bgGradientStart: "#2C1959",
      bgGradientEnd: "#2C1959",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Outfit",
      avatarBorderEnabled: true,
      avatarBorderColor: "#C3FF3D",
      avatarBorderWidth: 4,
      headlineColor: "#C3FF3D",
      bioColor: "#D9FF75",
      cardBgColor: "#C3FF3D",
      cardTextColor: "#0F172A",
      cardBorderColor: "#C3FF3D",
      socialIconBgColor: "#C3FF3D",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "sky-mint-graphite",
    name: "Sky Mint & Graphite",
    description: "Dark graphite with sky mint cards",
    bgPreviewStyle: { backgroundColor: "#2B2D32" },
    settings: {
      bgType: "solid",
      bgColor: "#2B2D32",
      bgGradientStart: "#2B2D32",
      bgGradientEnd: "#2B2D32",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "sharp",
      fontFamily: "Inter",
      avatarBorderEnabled: true,
      avatarBorderColor: "#B8F7E4",
      avatarBorderWidth: 4,
      headlineColor: "#B8F7E4",
      bioColor: "#D5F9EE",
      cardBgColor: "#B8F7E4",
      cardTextColor: "#0F172A",
      cardBorderColor: "#B8F7E4",
      socialIconBgColor: "#B8F7E4",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "warm-lime-olive-ink",
    name: "Warm Lime & Olive Ink",
    description: "Deep olive ink green with warm lime cards",
    bgPreviewStyle: { backgroundColor: "#2F3A1D" },
    settings: {
      bgType: "solid",
      bgColor: "#2F3A1D",
      bgGradientStart: "#2F3A1D",
      bgGradientEnd: "#2F3A1D",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Montserrat",
      avatarBorderEnabled: true,
      avatarBorderColor: "#CFF774",
      avatarBorderWidth: 4,
      headlineColor: "#CFF774",
      bioColor: "#E1FB9B",
      cardBgColor: "#CFF774",
      cardTextColor: "#0F172A",
      cardBorderColor: "#CFF774",
      socialIconBgColor: "#CFF774",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "electric-indigo-lilac",
    name: "Electric Indigo & Soft Lilac",
    description: "Electric indigo with soft lilac cards",
    bgPreviewStyle: { backgroundColor: "#5830F5" },
    settings: {
      bgType: "solid",
      bgColor: "#5830F5",
      bgGradientStart: "#5830F5",
      bgGradientEnd: "#5830F5",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "pill",
      fontFamily: "Outfit",
      avatarBorderEnabled: true,
      avatarBorderColor: "#E6DEFF",
      avatarBorderWidth: 4,
      headlineColor: "#E6DEFF",
      bioColor: "#F3EEFF",
      cardBgColor: "#E6DEFF",
      cardTextColor: "#0F172A",
      cardBorderColor: "#E6DEFF",
      socialIconBgColor: "#E6DEFF",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
  {
    id: "ultra-violet-apricot",
    name: "Ultra Violet & Soft Apricot",
    description: "Deep ultra violet with soft apricot cards",
    bgPreviewStyle: { backgroundColor: "#6A00F4" },
    settings: {
      bgType: "solid",
      bgColor: "#6A00F4",
      bgGradientStart: "#6A00F4",
      bgGradientEnd: "#6A00F4",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Playfair Display",
      avatarBorderEnabled: true,
      avatarBorderColor: "#FFD6A5",
      avatarBorderWidth: 4,
      headlineColor: "#FFD6A5",
      bioColor: "#FFE5C4",
      cardBgColor: "#FFD6A5",
      cardTextColor: "#0F172A",
      cardBorderColor: "#FFD6A5",
      socialIconBgColor: "#FFD6A5",
      socialLogoMode: "brand",
      socialFlatColor: "#0F172A",
    },
  },
];

// EXPANDED GALLERY: 10 Curated Modern Presets
const EXPANDED_BACKGROUND_GALLERY = [
  { name: "Abstract Waves", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" },
  { name: "Dark Marble", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop" },
  { name: "Cosmic Nebula", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop" },
  { name: "Minimal Concrete", url: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop" },
  { name: "Fluid Neon Gradient", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop" },
  { name: "Golden Sunset", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop" },
  { name: "Cyber Matrix", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop" },
  { name: "Pastel Clouds", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop" },
  { name: "Emerald Geometry", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop" },
  { name: "Subtle White Mesh", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" },
];

export function DesignEditor({
  customHexColor,
  setCustomHexColor,
  appearance = DEFAULT_APPEARANCE,
  setAppearance,
  planType = "pro",
  onRegisterActions,
}: DesignEditorProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [history, setHistory] = useState<AppearanceSettings[]>([appearance]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentApp: AppearanceSettings = {
    ...DEFAULT_APPEARANCE,
    ...(customHexColor ? { bgColor: customHexColor } : {}),
    ...appearance,
  };

  // Dynamic Google Font Injection
  useGoogleFont(currentApp.fontFamily);

  useEffect(() => {
    if (onRegisterActions) {
      onRegisterActions({
        reset: handleResetDefault,
        undo: handleUndo,
        redo: handleRedo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
      });
    }
  }, [currentIndex, history.length]);

  const updateAppearance = (newSettings: Partial<AppearanceSettings>) => {
    const updated: AppearanceSettings = {
      ...currentApp,
      ...newSettings,
    };

    if (setAppearance) {
      setAppearance(updated);
    }
    if (newSettings.bgColor) {
      setCustomHexColor(newSettings.bgColor);
    }

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(updated);
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const handleApplyPreset = (preset: typeof THEME_PRESETS[0]) => {
    updateAppearance(preset.settings);
  };

  const handleResetDefault = () => {
    updateAppearance(DEFAULT_APPEARANCE);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const prev = history[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      if (setAppearance) setAppearance(prev);
      if (prev.bgColor) setCustomHexColor(prev.bgColor);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      const next = history[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      if (setAppearance) setAppearance(next);
      if (next.bgColor) setCustomHexColor(next.bgColor);
    }
  };

  // Direct File Upload Handler
  const handleFileUpload = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateAppearance({
          bgType: "image",
          bgImageUrl: e.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Helper for rendering standardized HEX color picker swatch
  const renderColorSwatchPicker = (
    label: string,
    value: string | undefined,
    defaultHex: string,
    onChangeKey: keyof AppearanceSettings
  ) => {
    const rawVal = value || defaultHex;
    const hexVal = rawVal.startsWith("#") ? rawVal : `#${rawVal}`;

    return (
      <div className="space-y-1">
        <Label className="text-xs font-bold text-zinc-700">{label}</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hexVal}
            onChange={(e) => updateAppearance({ [onChangeKey]: e.target.value } as any)}
            className="h-9 w-9 rounded-lg cursor-pointer border border-zinc-300 p-0.5 bg-white shrink-0 shadow-xs"
          />
          <Input
            value={hexVal}
            onChange={(e) => updateAppearance({ [onChangeKey]: e.target.value } as any)}
            placeholder={defaultHex}
            className="font-mono text-xs uppercase bg-white border-zinc-200 text-zinc-900 h-9"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* TIER 1: PRESETS / THEMES */}
      <Card id="preset-themes-section" className="bg-white border-zinc-200/80 shadow-sm scroll-mt-28">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Sparkles className="h-4 w-4 text-emerald-600" /> 1. Theme Presets (Quick Apply)
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Select a high-contrast theme preset pair to instantly transform background, cards, and typography.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected =
                currentApp.bgType === preset.settings.bgType &&
                (preset.settings.bgType === "solid"
                  ? currentApp.bgColor.toLowerCase() === preset.settings.bgColor.toLowerCase()
                  : currentApp.bgGradientStart === preset.settings.bgGradientStart);

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 relative group cursor-pointer bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5",
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <div
                    style={preset.bgPreviewStyle}
                    className="w-full h-16 rounded-xl mb-2.5 shadow-inner border border-black/10 flex items-center justify-center p-2 relative overflow-hidden"
                  >
                    <div 
                      style={{ backgroundColor: preset.settings.cardBgColor }}
                      className="w-full py-1.5 px-2 rounded-md shadow-xs border text-center font-bold text-[10px] truncate"
                    >
                      <span style={{ color: preset.settings.cardTextColor }}>{preset.name}</span>
                    </div>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium line-clamp-1">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* TIER 2: BACKGROUND CUSTOMIZATION & UPLOAD */}
      <Card id="color-picker-section" className="bg-white border-zinc-200/80 shadow-sm scroll-mt-28">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Paintbrush className="h-4 w-4 text-emerald-600" /> Background
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Choose a solid color, multi-tone gradient, or upload a background image directly from your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-xl bg-zinc-100 p-1.5 border border-zinc-200">
            <button
              type="button"
              onClick={() => updateAppearance({ bgType: "solid" })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-bold transition-all cursor-pointer",
                currentApp.bgType === "solid"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Palette className="h-3.5 w-3.5 text-emerald-600" /> Solid Color
            </button>

            <button
              type="button"
              onClick={() => updateAppearance({ bgType: "gradient" })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-bold transition-all cursor-pointer",
                currentApp.bgType === "gradient"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-600" /> Gradient
            </button>

            <button
              type="button"
              onClick={() => {
                const firstStockUrl = EXPANDED_BACKGROUND_GALLERY[0].url;
                const isCurrentInStock = EXPANDED_BACKGROUND_GALLERY.some((g) => g.url === currentApp.bgImageUrl);
                updateAppearance({
                  bgType: "image",
                  bgImageUrl: isCurrentInStock ? currentApp.bgImageUrl : firstStockUrl,
                });
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-bold transition-all cursor-pointer",
                currentApp.bgType === "image" && EXPANDED_BACKGROUND_GALLERY.some((g) => g.url === currentApp.bgImageUrl)
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Grid className="h-3.5 w-3.5 text-blue-600" /> Stock Gallery
            </button>

            <button
              type="button"
              onClick={() => {
                const isCurrentInStock = EXPANDED_BACKGROUND_GALLERY.some((g) => g.url === currentApp.bgImageUrl);
                updateAppearance({
                  bgType: "image",
                  bgImageUrl: isCurrentInStock ? "" : currentApp.bgImageUrl,
                });
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-bold transition-all cursor-pointer",
                currentApp.bgType === "image" && !EXPANDED_BACKGROUND_GALLERY.some((g) => g.url === currentApp.bgImageUrl)
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <UploadCloud className="h-3.5 w-3.5 text-amber-600" /> Upload Image
            </button>
          </div>

          {/* TAB 1: SOLID COLOR */}
          {currentApp.bgType === "solid" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              {renderColorSwatchPicker("Solid Background Color", currentApp.bgColor, "#BAD1CB", "bgColor")}
            </div>
          )}

          {/* TAB 2: GRADIENT CONTROLS */}
          {currentApp.bgType === "gradient" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {renderColorSwatchPicker("Start Color", currentApp.bgGradientStart, "#FBCFE8", "bgGradientStart")}
                {renderColorSwatchPicker("End Color", currentApp.bgGradientEnd, "#E0F2FE", "bgGradientEnd")}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700">Gradient Angle</Label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[0, 45, 90, 135, 180, 270].map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => updateAppearance({ bgGradientAngle: angle })}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                        currentApp.bgGradientAngle === angle
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      )}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOCK GALLERY */}
          {currentApp.bgType === "image" && EXPANDED_BACKGROUND_GALLERY.some((g) => g.url === currentApp.bgImageUrl) && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-800">Curated Stock Backgrounds</Label>
                <span className="text-[10px] text-zinc-500 font-semibold">1-Click Selection</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {EXPANDED_BACKGROUND_GALLERY.map((pattern) => (
                  <button
                    key={pattern.name}
                    type="button"
                    onClick={() => updateAppearance({ bgType: "image", bgImageUrl: pattern.url })}
                    className={cn(
                      "group relative flex flex-col items-center p-1.5 rounded-xl border text-center transition hover:scale-105 bg-white cursor-pointer overflow-hidden",
                      currentApp.bgImageUrl === pattern.url
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <div
                      style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "cover" }}
                      className="w-full h-14 rounded-lg mb-1 shadow-inner border border-black/10 relative"
                    >
                      {currentApp.bgImageUrl === pattern.url && (
                        <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-700 truncate w-full">
                      {pattern.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD CUSTOM IMAGE */}
          {currentApp.bgType === "image" && !EXPANDED_BACKGROUND_GALLERY.some((g) => g.url === currentApp.bgImageUrl) && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700">Upload Background Image from Device</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center bg-white",
                    dragActive
                      ? "border-emerald-500 bg-emerald-50/40"
                      : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                  )}
                >
                  <UploadCloud className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-zinc-900">
                    Click to upload or drag &amp; drop an image
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">
                    Supports JPG, PNG, WEBP, or SVG (Up to 10MB)
                  </span>
                </div>

                {currentApp.bgImageUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{ backgroundImage: `url(${currentApp.bgImageUrl})`, backgroundSize: "cover" }}
                        className="h-10 w-10 rounded-lg shrink-0 border border-zinc-200 shadow-inner"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          Active Custom Image Loaded
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Displaying live on simulator
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAppearance({ bgImageUrl: "" });
                      }}
                      className="text-xs text-rose-600 hover:bg-rose-50 h-8"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AVATAR BORDER CONTROL */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <User className="h-4 w-4 text-emerald-600" /> Avatar Image Border Ring
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Configure profile image border ring color and thickness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <span className="text-xs font-bold text-zinc-800">Enable Border Ring</span>
            <input
              type="checkbox"
              checked={currentApp.avatarBorderEnabled !== false}
              onChange={(e) => updateAppearance({ avatarBorderEnabled: e.target.checked })}
              className="h-4 w-4 accent-emerald-600 cursor-pointer"
            />
          </div>

          {currentApp.avatarBorderEnabled !== false && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              {renderColorSwatchPicker("Border Ring Color", currentApp.avatarBorderColor, "#FFFFFF", "avatarBorderColor")}

              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700">Border Thickness</Label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[2, 4, 6].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => updateAppearance({ avatarBorderWidth: w })}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                        (currentApp.avatarBorderWidth || 4) === w
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      )}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TYPOGRAPHY & SEPARATE TEXT COLORS */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Type className="h-4 w-4 text-emerald-600" /> Typography &amp; Text Colors
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Select Google font family and customize separate Headline and Bio text colors with visual swatches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700">Font Pairings</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { name: "Inter", family: "'Inter', sans-serif" },
                { name: "Outfit", family: "'Outfit', sans-serif" },
                { name: "Montserrat", family: "'Montserrat', sans-serif" },
                { name: "Urbanist", family: "'Urbanist', sans-serif" },
                { name: "Playfair Display", family: "'Playfair Display', serif" },
                { name: "Poppins", family: "'Poppins', sans-serif" },
                { name: "Rubik", family: "'Rubik', sans-serif" },
              ].map((font) => {
                const isSelected = currentApp.fontFamily === font.name;

                return (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => {
                      console.log("Font Dropdown Changed To:", font.name);
                      updateAppearance({ fontFamily: font.name as any });
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer bg-white shadow-xs hover:border-zinc-300",
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                        : "border-zinc-200"
                    )}
                  >
                    <span style={{ fontFamily: font.family }} className="text-base font-black text-zinc-900 mb-0.5">
                      Aa
                    </span>
                    <span className="text-xs font-semibold text-zinc-700 truncate w-full">
                      {font.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            {renderColorSwatchPicker("Headline Color (Name / Titles)", currentApp.headlineColor, "#09090B", "headlineColor")}
            {renderColorSwatchPicker("Bio / Description Color", currentApp.bioColor, "#27272A", "bioColor")}
          </div>
        </CardContent>
      </Card>

      {/* CUSTOM LINK STYLES & UNIFIED HEX */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <LinkIcon className="h-4 w-4 text-emerald-600" /> Custom Link Card Styles
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Configure card shapes, background colors, text colors, and border strokes using visual swatches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700">Button Card Shape</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { shape: "sharp", label: "Sharp", class: "rounded-none" },
                { shape: "rounded", label: "Rounded", class: "rounded-xl" },
                { shape: "pill", label: "Pill", class: "rounded-full" },
                { shape: "outline", label: "Outline", class: "rounded-xl border-2 bg-transparent" },
              ].map((item) => {
                const isSelected = currentApp.buttonShape === item.shape;

                return (
                  <button
                    key={item.shape}
                    type="button"
                    onClick={() => updateAppearance({ buttonShape: item.shape as any })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer bg-white shadow-xs hover:border-zinc-300",
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                        : "border-zinc-200"
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-8 border border-zinc-400 bg-zinc-200/60 mb-2 flex items-center justify-center text-[10px] font-bold text-zinc-700",
                        item.class
                      )}
                    >
                      Sample
                    </div>
                    <span className="text-xs font-bold text-zinc-800">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            {renderColorSwatchPicker("Card Background Color", currentApp.cardBgColor, "#FFFFFF", "cardBgColor")}
            {renderColorSwatchPicker("Link Text & Icon Color", currentApp.cardTextColor, "#09090B", "cardTextColor")}
            {renderColorSwatchPicker("Card Border Color", currentApp.cardBorderColor, "#E4E4E7", "cardBorderColor")}
          </div>
        </CardContent>
      </Card>

      {/* SOCIAL BUTTONS STYLES & BRAND COLORS */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Share2 className="h-4 w-4 text-emerald-600" /> Social Icons Customization
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Customize social background pill colors with visual swatches and toggle between original brand logos or flat single-color.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            {renderColorSwatchPicker("Icon Background Pill Color", currentApp.socialIconBgColor, "#FFFFFF", "socialIconBgColor")}

            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Logo Color Mode</Label>
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => updateAppearance({ socialLogoMode: "brand" })}
                  className={cn(
                    "flex-1 py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer",
                    currentApp.socialLogoMode !== "flat"
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  )}
                >
                  Original Brand Colors
                </button>
                <button
                  type="button"
                  onClick={() => updateAppearance({ socialLogoMode: "flat" })}
                  className={cn(
                    "flex-1 py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer",
                    currentApp.socialLogoMode === "flat"
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  )}
                >
                  Flat Monochrome
                </button>
              </div>
            </div>
          </div>

          {currentApp.socialLogoMode === "flat" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              {renderColorSwatchPicker("Flat Monochrome Logo Color", currentApp.socialFlatColor, "#18181B", "socialFlatColor")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FEEDMEE BRANDING WATERMARK CARD */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
              <Sparkles className="h-4 w-4 text-emerald-600" /> FeedM.ee Branding Watermark
            </CardTitle>
            {planType === "free" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800 border border-amber-200">
                <Lock className="h-3 w-3" /> Pro Feature
              </span>
            )}
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Control the visibility of the "Powered by FeedM.ee" watermark at the bottom of your feed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <div>
              <p className="text-xs font-bold text-zinc-900">Remove FeedM.ee Branding</p>
              <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                {planType === "free"
                  ? "Requires Pro Plan to hide watermark (currently visible on Starter)"
                  : "Hide watermark for a 100% white-label creator feed"}
              </p>
            </div>
            <input
              type="checkbox"
              checked={planType !== "free" && !!currentApp.hideBranding}
              disabled={planType === "free"}
              onChange={(e) => {
                if (planType === "free") {
                  setShowUpgradeModal(true);
                  return;
                }
                updateAppearance({ hideBranding: e.target.checked });
              }}
              className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
