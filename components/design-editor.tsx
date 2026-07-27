"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesignEditorProps {
  customHexColor: string;
  setCustomHexColor: (hex: string) => void;
}

const PRESET_PALETTES = [
  { name: "Sage Green", hex: "#bad1cb", bgPreview: "bg-[#bad1cb]" },
  { name: "Sunset Glow", hex: "#fde68a", bgPreview: "bg-[#fde68a]" },
  { name: "Clean Pastel", hex: "#e0f2fe", bgPreview: "bg-[#e0f2fe]" },
  { name: "Cyber Pop", hex: "#fbcfe8", bgPreview: "bg-[#fbcfe8]" },
  { name: "Minimal Light", hex: "#ffffff", bgPreview: "bg-white border-zinc-300" },
];

export function DesignEditor({ customHexColor, setCustomHexColor }: DesignEditorProps) {
  const [history, setHistory] = useState<string[]>([customHexColor]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync history if external color changes (e.g. on mount)
  useEffect(() => {
    if (history.length === 1 && history[0] !== customHexColor) {
      setHistory([customHexColor]);
      setCurrentIndex(0);
    }
  }, [customHexColor, history]);

  const handleColorChange = (newColor: string) => {
    setCustomHexColor(newColor);
    
    // If the new color is the same as the current history head, do nothing
    if (history[currentIndex] === newColor) return;

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newColor);
    
    // Keep history at a reasonable max size, e.g. 20
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const prevColor = history[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setCustomHexColor(prevColor);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      const nextColor = history[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setCustomHexColor(nextColor);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
              <Palette className="h-4.5 w-4.5 text-emerald-600" /> Theme &amp; Custom Hex Color
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-1">
              Select a vibrant preset or enter any exact Hex code (e.g. #bad1cb)
            </CardDescription>
          </div>
          
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
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset Palettes */}
          <div className="grid grid-cols-5 gap-2">
            {PRESET_PALETTES.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => handleColorChange(p.hex)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all duration-200 hover:scale-105",
                  customHexColor.toLowerCase() === p.hex.toLowerCase()
                    ? "border-zinc-900 ring-2 ring-zinc-900/10 bg-zinc-50"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <div className={cn("h-7 w-7 rounded-full shadow-inner border border-black/10", p.bgPreview)} />
                <span className="text-[10px] font-bold text-zinc-700 leading-none">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Custom Hex Input */}
          <div className="pt-2">
            <Label htmlFor="custom-hex" className="text-xs font-bold text-zinc-700">Custom Hex Code</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="color"
                value={customHexColor.startsWith("#") ? customHexColor : `#${customHexColor}`}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-9 w-9 rounded-lg cursor-pointer border border-zinc-300 p-0.5 bg-white"
              />
              <Input
                id="custom-hex"
                value={customHexColor}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#bad1cb"
                className="font-mono text-xs uppercase bg-zinc-50 border-zinc-200 text-zinc-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
