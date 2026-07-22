"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomLink, LeadFormSettings, SocialLink } from "./mobile-preview";
import { User, Camera, Palette, Link as LinkIcon, Plus, Trash2, Tag, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileEditorProps {
  name: string;
  setName: (name: string) => void;
  username: string;
  setUsername: (username: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  customHexColor: string;
  setCustomHexColor: (hex: string) => void;
  socialLinks: SocialLink[];
  setSocialLinks: (links: SocialLink[]) => void;
  customLinks: CustomLink[];
  setCustomLinks: (links: CustomLink[]) => void;
  leadForm: LeadFormSettings;
  setLeadForm: (form: LeadFormSettings) => void;
}

const PRESET_PALETTES = [
  { name: "Sage Green", hex: "#bad1cb", bgPreview: "bg-[#bad1cb]" },
  { name: "Sunset Glow", hex: "#fde68a", bgPreview: "bg-[#fde68a]" },
  { name: "Clean Pastel", hex: "#e0f2fe", bgPreview: "bg-[#e0f2fe]" },
  { name: "Cyber Pop", hex: "#fbcfe8", bgPreview: "bg-[#fbcfe8]" },
  { name: "Minimal Light", hex: "#ffffff", bgPreview: "bg-white border-zinc-300" },
];

export function ProfileEditor({
  name,
  setName,
  username,
  setUsername,
  bio,
  setBio,
  avatarUrl,
  setAvatarUrl,
  customHexColor,
  setCustomHexColor,
  socialLinks,
  setSocialLinks,
  customLinks,
  setCustomLinks,
  leadForm,
  setLeadForm,
}: ProfileEditorProps) {
  // New link form local state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newBadge, setNewBadge] = useState("");

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const item: CustomLink = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle,
      url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
      badgeText: newBadge.trim() || undefined,
    };

    setCustomLinks([...customLinks, item]);
    setNewTitle("");
    setNewUrl("");
    setNewBadge("");
  };

  const handleDeleteLink = (id: string) => {
    setCustomLinks(customLinks.filter((l) => l.id !== id));
  };

  const handleSocialChange = (platform: "instagram" | "youtube" | "twitter" | "tiktok" | "facebook", val: string) => {
    const updated = [...socialLinks];
    const index = updated.findIndex((l) => l.platform === platform);

    if (val.trim() === "") {
      if (index !== -1) {
        updated.splice(index, 1);
        setSocialLinks(updated);
      }
    } else {
      const url = val.startsWith("http") ? val : `https://${platform}.com/${val}`;
      if (index !== -1) {
        updated[index].url = url;
      } else {
        updated.push({ platform, url });
      }
      setSocialLinks(updated);
    }
  };

  const getSocialValue = (platform: "instagram" | "youtube" | "twitter" | "tiktok" | "facebook"): string => {
    const link = socialLinks.find((l) => l.platform === platform);
    if (!link) return "";
    try {
      const parts = link.url.split("/");
      return parts[parts.length - 1] || "";
    } catch {
      return link.url;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Theme & Custom Hex Picker */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <Palette className="h-4.5 w-4.5 text-emerald-600" /> Theme & Custom Hex Color
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Select a vibrant preset or enter any exact Hex code (e.g. #bad1cb)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset Palettes */}
          <div className="grid grid-cols-5 gap-2">
            {PRESET_PALETTES.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => setCustomHexColor(p.hex)}
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
                onChange={(e) => setCustomHexColor(e.target.value)}
                className="h-9 w-9 rounded-lg cursor-pointer border border-zinc-300 p-0.5 bg-white"
              />
              <Input
                id="custom-hex"
                value={customHexColor}
                onChange={(e) => setCustomHexColor(e.target.value)}
                placeholder="#bad1cb"
                className="font-mono text-xs uppercase bg-zinc-50 border-zinc-200 text-zinc-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Basic Profile Info */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <User className="h-4.5 w-4.5 text-emerald-600" /> Profile Information
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Update display name, handle, avatar and bio tagline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivers"
                className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Handle (@username)</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="alexrivers"
                className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-700">Bio Tagline</Label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your bio description..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-700">Avatar Image URL</Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Linktree Style Custom Links */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <LinkIcon className="h-4.5 w-4.5 text-emerald-600" /> Custom Bio Links (Page 1)
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Add custom buttons with optional coupon / discount tags (e.g. "10% OFF code: ALEX10")
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Link Form */}
          <form onSubmit={handleAddLink} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Link Title (e.g. Shop My Gear)"
                className="bg-white border-zinc-200 text-xs text-zinc-900"
                required
              />
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="URL (e.g. https://...)"
                className="bg-white border-zinc-200 text-xs text-zinc-900"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="Optional Discount Tag (e.g. 10% OFF code: ALEX10)"
                  className="pl-8 bg-white border-zinc-200 text-xs text-zinc-900"
                />
              </div>
              <Button type="submit" size="sm" className="bg-zinc-900 hover:bg-black text-white font-bold text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
              </Button>
            </div>
          </form>

          {/* Links list */}
          <div className="space-y-2">
            {customLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-zinc-900 truncate">{link.title}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{link.url}</p>
                  {link.badgeText && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {link.badgeText}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteLink(link.id)}
                  className="h-7 w-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Lead Form Settings */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <Send className="h-4.5 w-4.5 text-emerald-600" /> Lead Form Settings (Page 5)
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Configure contact form headline and submission routing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-700">Form Title</Label>
            <Input
              value={leadForm.title}
              onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
              placeholder="רוצים להיות חלק? / לפניות עסקיות"
              className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Routing Mode</Label>
              <select
                value={leadForm.routeType}
                onChange={(e) => setLeadForm({ ...leadForm, routeType: e.target.value as "email" | "whatsapp" })}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none"
              >
                <option value="whatsapp">WhatsApp Direct Redirect</option>
                <option value="email">Email Notification</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Target Phone or Email</Label>
              <Input
                value={leadForm.target}
                onChange={(e) => setLeadForm({ ...leadForm, target: e.target.value })}
                placeholder="1234567890 or mail@domain.com"
                className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
