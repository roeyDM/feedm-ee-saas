"use client";

import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Image as ImageOutline
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppearanceSettings, DEFAULT_APPEARANCE } from "./mobile-preview";

interface DesignEditorProps {
  customHexColor: string;
  setCustomHexColor: (hex: string) => void;
  appearance?: AppearanceSettings;
  setAppearance?: (app: AppearanceSettings) => void;
}

export const THEME_PRESETS: {
  id: string;
  name: string;
  description: string;
  bgPreviewStyle: React.CSSProperties;
  settings: AppearanceSettings;
}[] = [
  {
    id: "classic",
    name: "Classic Clean",
    description: "Soft sage green with rounded cards",
    bgPreviewStyle: { backgroundColor: "#BAD1CB" },
    settings: {
      bgType: "solid",
      bgColor: "#BAD1CB",
      bgGradientStart: "#BAD1CB",
      bgGradientEnd: "#BAD1CB",
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
    },
  },
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    description: "Deep obsidian theme with crisp white typography",
    bgPreviewStyle: { backgroundColor: "#121212" },
    settings: {
      bgType: "solid",
      bgColor: "#121212",
      bgGradientStart: "#121212",
      bgGradientEnd: "#18181B",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "sharp",
      fontFamily: "Montserrat",
      avatarBorderEnabled: true,
      avatarBorderColor: "#3F3F46",
      avatarBorderWidth: 4,
      headlineColor: "#FFFFFF",
      bioColor: "#E4E4E7",
      cardBgColor: "#1E1E1E",
      cardTextColor: "#FFFFFF",
      cardBorderColor: "#3F3F46",
      socialIconBgColor: "#27272A",
      socialLogoMode: "brand",
      socialFlatColor: "#FFFFFF",
    },
  },
  {
    id: "pastel-dream",
    name: "Pastel Dream",
    description: "Soft pink to sky blue gradient",
    bgPreviewStyle: { background: "linear-gradient(135deg, #FBCFE8, #E0F2FE)" },
    settings: {
      bgType: "gradient",
      bgColor: "#FBCFE8",
      bgGradientStart: "#FBCFE8",
      bgGradientEnd: "#E0F2FE",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Outfit",
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
    },
  },
  {
    id: "neon-vibe",
    name: "Neon Vibe",
    description: "Dark electric indigo with bright neon contrast",
    bgPreviewStyle: { background: "linear-gradient(135deg, #0F172A, #3B0764)" },
    settings: {
      bgType: "gradient",
      bgColor: "#0F172A",
      bgGradientStart: "#0F172A",
      bgGradientEnd: "#3B0764",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "pill",
      fontFamily: "Urbanist",
      avatarBorderEnabled: true,
      avatarBorderColor: "#A855F7",
      avatarBorderWidth: 4,
      headlineColor: "#FFFFFF",
      bioColor: "#E2E8F0",
      cardBgColor: "#1E1B4B",
      cardTextColor: "#FFFFFF",
      cardBorderColor: "#A855F7",
      socialIconBgColor: "#312E81",
      socialLogoMode: "brand",
      socialFlatColor: "#A855F7",
    },
  },
  {
    id: "ocean-gradient",
    name: "Ocean Gradient",
    description: "Vibrant cyan to deep ocean blue",
    bgPreviewStyle: { background: "linear-gradient(135deg, #0EA5E9, #2563EB)" },
    settings: {
      bgType: "gradient",
      bgColor: "#0EA5E9",
      bgGradientStart: "#0EA5E9",
      bgGradientEnd: "#2563EB",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "pill",
      fontFamily: "Inter",
      avatarBorderEnabled: true,
      avatarBorderColor: "#FFFFFF",
      avatarBorderWidth: 4,
      headlineColor: "#FFFFFF",
      bioColor: "#F0F9FF",
      cardBgColor: "#FFFFFF",
      cardTextColor: "#0F172A",
      cardBorderColor: "#E0F2FE",
      socialIconBgColor: "#FFFFFF",
      socialLogoMode: "brand",
      socialFlatColor: "#0284C7",
    },
  },
  {
    id: "glassmorphic",
    name: "Glassmorphic",
    description: "Frosted purple with translucent outline cards",
    bgPreviewStyle: { background: "linear-gradient(135deg, #A855F7, #EC4899)" },
    settings: {
      bgType: "gradient",
      bgColor: "#A855F7",
      bgGradientStart: "#A855F7",
      bgGradientEnd: "#EC4899",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "outline",
      fontFamily: "Outfit",
      avatarBorderEnabled: true,
      avatarBorderColor: "#FFFFFF",
      avatarBorderWidth: 4,
      headlineColor: "#FFFFFF",
      bioColor: "#FAF5FF",
      cardBgColor: "#FFFFFF",
      cardTextColor: "#FFFFFF",
      cardBorderColor: "#FFFFFF",
      socialIconBgColor: "#FFFFFF",
      socialLogoMode: "brand",
      socialFlatColor: "#FFFFFF",
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
}: DesignEditorProps) {
  const [history, setHistory] = useState<AppearanceSettings[]>([appearance]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentApp: AppearanceSettings = {
    ...DEFAULT_APPEARANCE,
    ...(customHexColor ? { bgColor: customHexColor } : {}),
    ...appearance,
  };

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
      {/* Top Header Card with Actions */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
              <Palette className="h-4.5 w-4.5 text-emerald-600" /> Appearance &amp; Theme Studio
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Curated themes, custom background uploads, typography, and card colors
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefault}
              className="text-xs font-bold text-zinc-700 hover:bg-zinc-100 border-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1 text-zinc-500" /> Reset Default
            </Button>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
              <button
                onClick={handleUndo}
                disabled={currentIndex === 0}
                title="Undo"
                className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={currentIndex === history.length - 1}
                title="Redo"
                className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* TIER 1: PRESETS / THEMES */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Sparkles className="h-4 w-4 text-emerald-600" /> 1. Theme Presets (Quick Apply)
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Select a curated theme preset to instantly transform background, typography, and contrast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    <div className="w-full h-6 rounded-lg bg-white/80 backdrop-blur-md shadow-xs border border-white/60 flex items-center px-2">
                      <div className="h-2 w-12 rounded-full bg-zinc-800/60" />
                    </div>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-black">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 leading-tight mt-0.5 line-clamp-1">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* TIER 2: BACKGROUND CUSTOMIZATION & UPLOAD */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Paintbrush className="h-4 w-4 text-emerald-600" /> 2. Background Customization &amp; File Upload
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Choose a solid color, multi-tone gradient, or upload a background image directly from your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 border border-zinc-200">
            <button
              type="button"
              onClick={() => updateAppearance({ bgType: "solid" })}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
                currentApp.bgType === "solid"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Palette className="h-3.5 w-3.5" /> Solid Color
            </button>
            <button
              type="button"
              onClick={() => updateAppearance({ bgType: "gradient" })}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
                currentApp.bgType === "gradient"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Layers className="h-3.5 w-3.5" /> Gradient
            </button>
            <button
              type="button"
              onClick={() => updateAppearance({ bgType: "image" })}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer",
                currentApp.bgType === "image"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <ImageIcon className="h-3.5 w-3.5" /> Image Upload &amp; Gallery
            </button>
          </div>

          {/* SOLID COLOR */}
          {currentApp.bgType === "solid" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              {renderColorSwatchPicker("Solid Background Color", currentApp.bgColor, "#BAD1CB", "bgColor")}
            </div>
          )}

          {/* GRADIENT CONTROLS */}
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

          {/* REQUIREMENT 1: DIRECT FILE UPLOAD & EXPANDED GALLERY */}
          {currentApp.bgType === "image" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
              {/* Drag and Drop File Input Area */}
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
                    Supports JPG, PNG, WEBP, or SVG
                  </span>
                </div>

                {currentApp.bgImageUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{ backgroundImage: `url(${currentApp.bgImageUrl})`, backgroundSize: "cover" }}
                        className="h-10 w-10 rounded-lg shrink-0 border border-zinc-200"
                      />
                      <span className="text-xs font-semibold text-zinc-800 truncate">
                        Active Image Loaded
                      </span>
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

              {/* EXPANDED GALLERY GRID (10 Modern Presets) */}
              <div className="space-y-2 pt-2 border-t border-zinc-200/80">
                <Label className="text-xs font-bold text-zinc-700">Or Pick From Expanded Background Gallery</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {EXPANDED_BACKGROUND_GALLERY.map((pattern) => (
                    <button
                      key={pattern.name}
                      type="button"
                      onClick={() => updateAppearance({ bgType: "image", bgImageUrl: pattern.url })}
                      className={cn(
                        "flex flex-col items-center p-1.5 rounded-xl border text-center transition hover:scale-105 bg-white cursor-pointer",
                        currentApp.bgImageUrl === pattern.url
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div
                        style={{ backgroundImage: `url(${pattern.url})`, backgroundSize: "cover" }}
                        className="w-full h-12 rounded-lg mb-1 shadow-inner border border-black/10"
                      />
                      <span className="text-[10px] font-bold text-zinc-700 truncate w-full">
                        {pattern.name}
                      </span>
                    </button>
                  ))}
                </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: "Inter", family: "'Inter', sans-serif" },
                { name: "Outfit", family: "'Outfit', sans-serif" },
                { name: "Montserrat", family: "'Montserrat', sans-serif" },
                { name: "Urbanist", family: "'Urbanist', sans-serif" },
              ].map((font) => {
                const isSelected = currentApp.fontFamily === font.name;

                return (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => updateAppearance({ fontFamily: font.name as any })}
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
    </div>
  );
}
