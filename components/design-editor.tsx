"use client";

import React, { useState, useEffect } from "react";
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
  Square, 
  Circle, 
  Layers,
  Check
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
    bgPreviewStyle: { backgroundColor: "#bad1cb" },
    settings: {
      bgType: "solid",
      bgColor: "#bad1cb",
      bgGradientStart: "#bad1cb",
      bgGradientEnd: "#bad1cb",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Inter",
      textColor: "#18181b",
    },
  },
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    description: "Deep obsidian theme with sharp cards",
    bgPreviewStyle: { backgroundColor: "#121212" },
    settings: {
      bgType: "solid",
      bgColor: "#121212",
      bgGradientStart: "#121212",
      bgGradientEnd: "#18181b",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "sharp",
      fontFamily: "Montserrat",
      textColor: "#f4f4f5",
    },
  },
  {
    id: "pastel-dream",
    name: "Pastel Dream",
    description: "Soft pink to sky blue gradient",
    bgPreviewStyle: { background: "linear-gradient(135deg, #fbcfe8, #e0f2fe)" },
    settings: {
      bgType: "gradient",
      bgColor: "#fbcfe8",
      bgGradientStart: "#fbcfe8",
      bgGradientEnd: "#e0f2fe",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "rounded",
      fontFamily: "Outfit",
      textColor: "#09090b",
    },
  },
  {
    id: "neon-vibe",
    name: "Neon Vibe",
    description: "Dark electric indigo with sleek pills",
    bgPreviewStyle: { background: "linear-gradient(135deg, #0f172a, #3b0764)" },
    settings: {
      bgType: "gradient",
      bgColor: "#0f172a",
      bgGradientStart: "#0f172a",
      bgGradientEnd: "#3b0764",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "pill",
      fontFamily: "Urbanist",
      textColor: "#f4f4f5",
    },
  },
  {
    id: "ocean-gradient",
    name: "Ocean Gradient",
    description: "Vibrant cyan to deep ocean blue",
    bgPreviewStyle: { background: "linear-gradient(135deg, #0ea5e9, #2563eb)" },
    settings: {
      bgType: "gradient",
      bgColor: "#0ea5e9",
      bgGradientStart: "#0ea5e9",
      bgGradientEnd: "#2563eb",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "pill",
      fontFamily: "Inter",
      textColor: "#ffffff",
    },
  },
  {
    id: "glassmorphic",
    name: "Glassmorphic",
    description: "Frosted purple with outline cards",
    bgPreviewStyle: { background: "linear-gradient(135deg, #a855f7, #ec4899)" },
    settings: {
      bgType: "gradient",
      bgColor: "#a855f7",
      bgGradientStart: "#a855f7",
      bgGradientEnd: "#ec4899",
      bgGradientAngle: 135,
      bgImageUrl: "",
      buttonShape: "outline",
      fontFamily: "Outfit",
      textColor: "#ffffff",
    },
  },
];

const PRESET_PATTERNS = [
  { name: "Abstract Waves", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" },
  { name: "Dark Marble", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop" },
  { name: "Cosmic Nebula", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop" },
  { name: "Minimal Concrete", url: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop" },
];

export function DesignEditor({
  customHexColor,
  setCustomHexColor,
  appearance = DEFAULT_APPEARANCE,
  setAppearance,
}: DesignEditorProps) {
  const [history, setHistory] = useState<AppearanceSettings[]>([appearance]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card with Actions */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
              <Palette className="h-4.5 w-4.5 text-emerald-600" /> Appearance & Theme Studio
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Customize presets, dynamic backgrounds, button shapes, and typography
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
                className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={currentIndex === history.length - 1}
                title="Redo"
                className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
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
            Select a curated theme preset to instantly transform your background, button styling, and fonts.
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

      {/* TIER 2: BACKGROUND CUSTOMIZATION */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Paintbrush className="h-4 w-4 text-emerald-600" /> 2. Background Customization
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Choose between a solid color, custom multi-tone gradient, or background image texture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Segmented Control */}
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
              <ImageIcon className="h-3.5 w-3.5" /> Image / Pattern
            </button>
          </div>

          {/* SOLID COLOR CONTROLS */}
          {currentApp.bgType === "solid" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <Label className="text-xs font-bold text-zinc-700">Solid Hex Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentApp.bgColor.startsWith("#") ? currentApp.bgColor : `#${currentApp.bgColor}`}
                  onChange={(e) => updateAppearance({ bgColor: e.target.value })}
                  className="h-9 w-9 rounded-lg cursor-pointer border border-zinc-300 p-0.5 bg-white"
                />
                <Input
                  value={currentApp.bgColor}
                  onChange={(e) => updateAppearance({ bgColor: e.target.value })}
                  placeholder="#bad1cb"
                  className="font-mono text-xs uppercase bg-white border-zinc-200 text-zinc-900"
                />
              </div>
            </div>
          )}

          {/* GRADIENT CONTROLS */}
          {currentApp.bgType === "gradient" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-700">Start Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentApp.bgGradientStart}
                      onChange={(e) => updateAppearance({ bgGradientStart: e.target.value })}
                      className="h-8 w-8 rounded-lg cursor-pointer border border-zinc-300 p-0.5 bg-white shrink-0"
                    />
                    <Input
                      value={currentApp.bgGradientStart}
                      onChange={(e) => updateAppearance({ bgGradientStart: e.target.value })}
                      className="font-mono text-xs uppercase bg-white border-zinc-200 text-zinc-900 h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-700">End Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentApp.bgGradientEnd}
                      onChange={(e) => updateAppearance({ bgGradientEnd: e.target.value })}
                      className="h-8 w-8 rounded-lg cursor-pointer border border-zinc-300 p-0.5 bg-white shrink-0"
                    />
                    <Input
                      value={currentApp.bgGradientEnd}
                      onChange={(e) => updateAppearance({ bgGradientEnd: e.target.value })}
                      className="font-mono text-xs uppercase bg-white border-zinc-200 text-zinc-900 h-8"
                    />
                  </div>
                </div>
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

          {/* IMAGE / PATTERN CONTROLS */}
          {currentApp.bgType === "image" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700">Custom Image URL</Label>
                <Input
                  value={currentApp.bgImageUrl || ""}
                  onChange={(e) => updateAppearance({ bgImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs bg-white border-zinc-200 text-zinc-900"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold text-zinc-700">Preset Textures & Backgrounds</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_PATTERNS.map((pattern) => (
                    <button
                      key={pattern.name}
                      type="button"
                      onClick={() => updateAppearance({ bgImageUrl: pattern.url })}
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

      {/* TIER 3: BUTTON STYLES & TYPOGRAPHY */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900">
            <Type className="h-4 w-4 text-emerald-600" /> 3. Button Shapes & Typography
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Customize the corner curvature of your link cards and font pairings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Button Shape Options */}
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

          {/* Typography Selector */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <Label className="text-xs font-bold text-zinc-700">Font Pairings</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: "Inter", label: "Inter (Clean)", family: "sans-serif" },
                { name: "Outfit", label: "Outfit (Trendy)", family: "'Outfit', sans-serif" },
                { name: "Montserrat", label: "Montserrat (Bold)", family: "'Montserrat', sans-serif" },
                { name: "Urbanist", label: "Urbanist (Sleek)", family: "'Urbanist', sans-serif" },
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
        </CardContent>
      </Card>
    </div>
  );
}
