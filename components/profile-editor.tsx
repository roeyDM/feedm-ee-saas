"use client";

import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionHelp } from "@/components/ui/section-help";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/upgrade-modal";
import { AvatarCropModal } from "@/components/avatar-crop-modal";
import { CustomLink, LeadFormSettings, SocialLink } from "./mobile-preview";
import {
  User,
  Palette,
  Link as LinkIcon,
  Plus,
  Trash2,
  Tag,
  Send,
  Lock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Upload,
  Edit2,
  Save,
  MessageCircle, // For WhatsApp
  Music, // For Spotify
  Share2,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanType, checkUsernameAvailability, validateHandle, sanitizeHandleInput, supabase } from "@/lib/supabase";

import { CountrySelector } from "./country-selector";

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
  planType?: PlanType;
}

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
  planType = "free",
}: ProfileEditorProps) {
  // New link form local state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newBadge, setNewBadge] = useState("");

  // Handle availability checking state
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleStatus, setHandleStatus] = useState<{ available: boolean; reason?: string } | null>(null);

  // Link Edit State
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CustomLink>>({});

  // Social Link Edit State
  const [editingSocialLinkId, setEditingSocialLinkId] = useState<string | null>(null);
  const [editSocialFormData, setEditSocialFormData] = useState<Partial<SocialLink>>({});
  const [socialEditError, setSocialEditError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Avatar Crop & Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(false);
    setAvatarError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropImageSrc(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCroppedAvatarUpload = async (croppedBlob: Blob) => {
    try {
      setIsUploadingAvatar(true);
      setAvatarError(null);
      
      const fileName = `avatar_${Math.random().toString(36).substring(2, 11)}_${Date.now()}.webp`;

      console.log("[AvatarUpload] Starting upload to Supabase avatars bucket...", fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedBlob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.warn("[AvatarUpload] Supabase Storage upload failed/restricted:", uploadError.message);
        
        // Fallback: Convert cropped blob to Base64 DataURL so user is NEVER stuck
        const base64Url = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.readAsDataURL(croppedBlob);
        });

        setAvatarUrl(base64Url);
        setAvatarError("Avatar applied locally (Supabase Storage 'avatars' bucket policy required).");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      console.log("[AvatarUpload] Supabase upload success! Public URL:", publicUrl);
      setAvatarUrl(publicUrl);
      setAvatarError(null);
    } catch (err: any) {
      console.error("[AvatarUpload] Exception during upload:", err);
      // Fallback DataURL
      const base64Url = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.readAsDataURL(croppedBlob);
      });
      setAvatarUrl(base64Url);
      setAvatarError("Avatar applied locally.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Debounced real-time handle availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setHandleStatus(null);
      setCheckingHandle(false);
      return;
    }

    setCheckingHandle(true);
    const timer = setTimeout(async () => {
      const result = await checkUsernameAvailability(username, username);
      setHandleStatus(result);
      setCheckingHandle(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const newLink: CustomLink = {
      id: crypto.randomUUID(),
      title: newTitle,
      url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
      badgeText: newBadge || undefined,
      isActive: true,
    };

    setCustomLinks([...customLinks, newLink]);
    setNewTitle("");
    setNewUrl("");
    setNewBadge("");
  };

  const handleDeleteLink = (id: string) => {
    setCustomLinks(customLinks.filter((l) => l.id !== id));
  };

  const handleEditClick = (link: CustomLink) => {
    setEditingLinkId(link.id);
    setEditFormData({ ...link });
  };

  const handleSaveEdit = () => {
    if (!editingLinkId) return;
    setCustomLinks(
      customLinks.map((link) =>
        link.id === editingLinkId ? { ...link, ...editFormData } as CustomLink : link
      )
    );
    setEditingLinkId(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setEditFormData({});
  };

  const onDragEndLinks = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(customLinks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCustomLinks(items);
  };

  const handleAddSocialLink = (platform: SocialLink["platform"]) => {
    setSocialEditError(null);
    // Check if it already exists, if so just edit it
    const existing = socialLinks.find(l => l.platform === platform);
    if (existing) {
      setEditingSocialLinkId(existing.id);
      setEditSocialFormData({ ...existing });
      return;
    }

    const newLink: SocialLink = {
      id: crypto.randomUUID(),
      platform,
      url: "",
      isActive: true,
      label: ""
    };
    setSocialLinks([...socialLinks, newLink]);
    setEditingSocialLinkId(newLink.id);
    setEditSocialFormData({ ...newLink });
  };

  const handleDeleteSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((l) => l.id !== id));
    if (editingSocialLinkId === id) {
      setEditingSocialLinkId(null);
      setSocialEditError(null);
    }
  };

  const handleSaveSocialEdit = () => {
    if (!editingSocialLinkId) return;
    if (!editSocialFormData.url || !editSocialFormData.url.trim()) {
      setSocialEditError("Please enter a valid link or remove this item before saving.");
      return;
    }
    setSocialEditError(null);
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === editingSocialLinkId ? { ...link, ...editSocialFormData } : link
      )
    );
    setEditingSocialLinkId(null);
    setEditSocialFormData({});
  };

  const PLATFORM_INFO: Record<
    SocialLink["platform"],
    { name: string; icon: React.ReactNode }
  > = {
    instagram: {
      name: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <defs>
            <linearGradient id="ig-gradient-builder" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="25%" stopColor="#e6683c" />
              <stop offset="50%" stopColor="#dc2743" />
              <stop offset="75%" stopColor="#cc2366" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-gradient-builder)" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="#ffffff" strokeWidth="1.8" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="#ffffff" />
        </svg>
      ),
    },
    tiktok: {
      name: "TikTok",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <rect width="24" height="24" rx="5" fill="#010101" />
          <path d="M16.6 8.2a4.4 4.4 0 0 1-2.9-1.2 4.6 4.6 0 0 1-1.2-2.7h-2.3v10.8a2.5 2.5 0 1 1-2.5-2.5c.3 0 .6.1.9.2V10.4a4.8 4.8 0 0 0-.9-.1 4.8 4.8 0 1 0 4.8 4.8V9.7a6.8 6.8 0 0 0 4.1 1.3V8.7a4.6 4.6 0 0 1-2-.5z" fill="#ffffff" />
        </svg>
      ),
    },
    twitter: {
      name: "X (Twitter)",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path d="M16.99 5h2.42l-5.29 6.05 6.22 8.22h-4.88l-3.82-5-4.37 5H4.85l5.65-6.46L4.5 5h5.01l3.47 4.58L16.99 5zm-.85 12.82h1.34L8.2 6.32H6.76l9.38 11.5z" fill="#ffffff" />
        </svg>
      ),
    },
    facebook: {
      name: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <circle cx="12" cy="12" r="12" fill="#1877F2" />
          <path d="M16 12.073c0-2.21-1.79-4.073-4-4.073v2.5h1.5l.3 2H12v6.5h-2.5v-6.5H8v-2h1.5V9c0-2.21 1.79-4 4-4H16v2.5h-1.5c-.83 0-1.5.67-1.5 1.5v1.073H16z" fill="#ffffff" />
        </svg>
      ),
    },
    youtube: {
      name: "YouTube",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <rect width="24" height="24" rx="5" fill="#FF0000" />
          <polygon points="9.5,16.5 16.5,12 9.5,7.5" fill="#ffffff" />
        </svg>
      ),
    },
    whatsapp: {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <circle cx="12" cy="12" r="12" fill="#25D366" />
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#ffffff" />
        </svg>
      ),
    },
    linkedin: {
      name: "LinkedIn",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <rect width="24" height="24" rx="5" fill="#0A66C2" />
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" fill="#ffffff" />
        </svg>
      ),
    },
    spotify: {
      name: "Spotify",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
          <circle cx="12" cy="12" r="12" fill="#1DB954" />
          <path d="M17.45 17.294c-.212.348-.675.458-1.023.245-2.805-1.713-6.33-2.1-10.485-1.15-.403.093-.807-.156-.9-.558-.093-.404.156-.807.558-.9 4.545-1.042 8.442-.602 11.606 1.34.348.213.458.675.245 1.023zm1.464-3.267c-.268.435-.852.576-1.287.31-3.21-1.974-8.15-2.573-11.96-1.41-.486.147-1.002-.128-1.15-.615-.146-.486.128-1.002.615-1.15 4.364-1.332 9.805-.672 13.473 1.578.436.267.577.852.31 1.287zm.123-3.415c-3.856-2.287-10.21-2.5-13.9-1.385-.572.173-1.173-.153-1.347-.725-.173-.57.153-1.17.725-1.343 4.296-1.298 11.31-1.05 15.76 1.59.516.305.687.973.382 1.487-.305.515-.973.687-1.488.383z" fill="#000000" />
        </svg>
      ),
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Basic Profile Info */}
      <Card id="profile-section" className="bg-white border-zinc-200/80 shadow-sm scroll-mt-28">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <User className="h-4.5 w-4.5 text-emerald-600" /> Profile Information
            <SectionHelp text="Update display name, handle, avatar and bio tagline" />
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 hidden md:block">
            Update display name, handle, avatar and bio tagline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3 items-start">
            {/* Display Name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between h-5">
                <Label className="text-xs font-bold text-zinc-700">Name</Label>
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivers"
                className="bg-zinc-50 border-zinc-200 text-base md:text-xs text-zinc-900 h-9"
              />
            </div>

            {/* Handle (@username) with Live Availability */}
            <div className="space-y-1">
              <div className="flex items-center justify-between h-5">
                <Label className="text-xs font-bold text-zinc-700">Handle (@username)</Label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Permanent Link
                </span>
              </div>

              <div className="relative">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="alexrivers"
                  className={`bg-zinc-50 text-base md:text-xs text-zinc-900 pr-8 ${
                    handleStatus
                      ? handleStatus.available
                        ? "border-emerald-500 focus:ring-emerald-500/30"
                        : "border-rose-500 focus:ring-rose-500/30"
                      : "border-zinc-200"
                  }`}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {checkingHandle ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                  ) : handleStatus ? (
                    handleStatus.available ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    )
                  ) : null}
                </div>
              </div>

              {/* Status indicator text */}
              {handleStatus && (
                <p className={`text-[10px] font-bold mt-1 ${handleStatus.available ? "text-emerald-600" : "text-rose-600"}`}>
                  {handleStatus.available ? `✓ feedm.ee/${username} is available!` : `✕ ${handleStatus.reason}`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-700">Bio Tagline</Label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your bio description..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-base md:text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-700">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div 
                className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl?.trim() ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">
                    <User className="h-8 w-8" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                
                {/* Loading state */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  ref={fileInputRef}
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold h-8 px-3 rounded-lg"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Upload Photo
                </Button>
                <p className="text-[11px] text-zinc-500">
                  Recommended: Square JPG, PNG or WebP. Max 5MB.
                </p>
                {avatarError && (
                  <p className="text-[10px] font-bold text-amber-700 mt-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    ⚠️ {avatarError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Quick Social Links */}
      <Card id="socials-section" className="bg-white border-zinc-200/80 shadow-sm scroll-mt-28">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <Share2 className="h-4.5 w-4.5 text-emerald-600" /> Social Links
            <SectionHelp text="Click to add a social platform icon to your profile header." />
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 hidden md:block">
            Click to add a social platform icon to your profile header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(PLATFORM_INFO) as SocialLink["platform"][]).map((platform) => {
              const info = PLATFORM_INFO[platform];
              const isAdded = socialLinks.some((l) => l.platform === platform);

              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handleAddSocialLink(platform)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group relative bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
                    isAdded
                      ? "border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/30"
                      : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <div className="flex items-center justify-center w-10 h-10 mb-2 transition-transform duration-200 group-hover:scale-110 drop-shadow-xs">
                    {info.icon}
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors">
                    {info.name}
                  </span>
                  {isAdded && (
                    <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="space-y-2 mt-4">
            {socialLinks.map((link) => (
              <div key={link.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                {editingSocialLinkId === link.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {PLATFORM_INFO[link.platform]?.icon}
                      </div>
                      <span className="text-xs font-bold text-zinc-900 capitalize">{PLATFORM_INFO[link.platform]?.name || link.platform}</span>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold text-zinc-600">
                        {link.platform === "whatsapp" ? "WhatsApp Number (with country code)" : `${PLATFORM_INFO[link.platform]?.name} URL`}
                      </Label>
                      <Input
                        value={editSocialFormData.url || ""}
                        onChange={(e) => {
                          setEditSocialFormData({ ...editSocialFormData, url: e.target.value });
                          if (socialEditError) setSocialEditError(null);
                        }}
                        placeholder={`e.g. https://${link.platform}.com/yourname`}
                        className={cn(
                          "bg-white border-zinc-200 text-xs text-zinc-900 h-8",
                          socialEditError && "border-rose-500 ring-2 ring-rose-500/20"
                        )}
                      />
                      {socialEditError && (
                        <p className="text-[10px] font-bold text-rose-600 mt-1">
                          {socialEditError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-zinc-500">Custom Label (Optional)</Label>
                      <Input
                        value={editSocialFormData.label || ""}
                        onChange={(e) => setEditSocialFormData({ ...editSocialFormData, label: e.target.value })}
                        placeholder="e.g. Follow me"
                        className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editSocialFormData.isActive !== false}
                          onChange={(e) => setEditSocialFormData({ ...editSocialFormData, isActive: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Active
                      </label>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingSocialLinkId(null)} className="h-7 text-xs font-bold text-zinc-500 hover:text-zinc-700">
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveSocialEdit} className="h-7 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                          <Save className="h-3 w-3 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={cn("h-9 w-9 shrink-0 flex items-center justify-center")}>
                        {PLATFORM_INFO[link.platform]?.icon}
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs font-bold truncate", link.isActive === false ? "text-zinc-400 line-through" : "text-zinc-900")}>
                          {PLATFORM_INFO[link.platform]?.name || link.platform} {link.label && <span className="text-zinc-500 font-normal ml-1">({link.label})</span>}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{link.url || "No URL set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSocialLinkId(link.id);
                          setEditSocialFormData({ ...link });
                        }}
                        className="h-7 w-7 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSocialLink(link.id)}
                        className="h-7 w-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Linktree Style Custom Links */}
      <Card id="links-section" className="bg-white border-zinc-200/80 shadow-sm scroll-mt-28">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <LinkIcon className="h-4.5 w-4.5 text-emerald-600" /> Custom Links
            <SectionHelp text="Add custom buttons with optional coupon / discount tags (e.g. '10% OFF code: ALEX10')" />
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 hidden md:block">
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
          <DragDropContext onDragEnd={onDragEndLinks}>
            <Droppable droppableId="custom-links">
              {(provided) => (
                <div 
                  className="space-y-2" 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                >
                  {customLinks.map((link, index) => (
                    <Draggable key={link.id} draggableId={link.id} index={index}>
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-3 rounded-xl bg-zinc-50 border border-zinc-200"
                        >
                          {editingLinkId === link.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500">Title</Label>
                        <Input
                          value={editFormData.title || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500">URL</Label>
                        <Input
                          value={editFormData.url || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                          className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500">Thumbnail URL</Label>
                        <Input
                          value={editFormData.thumbnailUrl || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, thumbnailUrl: e.target.value })}
                          placeholder="Optional image URL"
                          className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500">Discount Tag</Label>
                        <Input
                          value={editFormData.badgeText || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, badgeText: e.target.value })}
                          placeholder="Optional (e.g. 10% OFF)"
                          className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editFormData.isActive !== false}
                          onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                          className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Active
                      </label>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs font-bold text-zinc-500 hover:text-zinc-700">
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit} className="h-7 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                          <Save className="h-3 w-3 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div 
                        {...provided.dragHandleProps} 
                        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-1"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                      {link.thumbnailUrl?.trim() ? (
                        <div className="flex-shrink-0 h-8 w-8 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                          <img src={link.thumbnailUrl} alt={link.title} className="h-full w-full object-cover" />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <p className={cn("text-xs font-bold leading-tight line-clamp-2 break-words", link.isActive === false ? "text-zinc-400 line-through" : "text-zinc-900")}>
                          {link.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{link.url}</p>
                        {link.badgeText && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {link.badgeText}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(link)}
                        className="h-7 w-7 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)} className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
        </CardContent>
      </Card>

      {/* 4. Lead Form Settings */}
      <Card className="bg-white border-zinc-200/80 shadow-sm relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
              <Send className="h-4.5 w-4.5 text-emerald-600" /> Lead Form Settings
            </CardTitle>
            {planType === "free" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800 border border-amber-200">
                <Lock className="h-3 w-3" /> Pro Feature
              </span>
            )}
          </div>
          <CardDescription className="text-xs text-zinc-500">
            Configure contact form text content, field requirements, and submission routing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {planType === "free" ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 shadow-md">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black">Lead Capture Form is Locked</h4>
                <p className="text-xs font-semibold text-amber-800 mt-1 max-w-md">
                  Lead capture forms are available on the Pro plan ($7/mo). Upgrade to collect names, phone numbers, and email leads directly from your video feed.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs h-10 px-5 rounded-xl gap-2 cursor-pointer shadow-sm mt-1"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>Unlock Lead Capture Form</span>
              </Button>
            </div>
          ) : (
            <>
              {/* Section 1: Form Content */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-1.5">
                  Form Content
                </h4>
                
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-zinc-700">Form Title</Label>
                  <Input
                    value={leadForm.title}
                    onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                    placeholder="Get in Touch"
                    className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
                  />
                </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Form Subtitle / Description</Label>
              <Input
                value={leadForm.subtitle}
                onChange={(e) => setLeadForm({ ...leadForm, subtitle: e.target.value })}
                placeholder="Leave your details below and we'll get back to you shortly."
                className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Label className="text-xs font-bold text-zinc-700 block">Form Field Requirements</Label>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-xs font-bold text-zinc-800">Full Name</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Always Required
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <div>
                  <span className="text-xs font-bold text-zinc-800 block">Phone Field</span>
                  <span className="text-[10px] text-zinc-500">Collect visitor phone number</span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!leadForm.is_phone_required}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (!checked && !leadForm.is_email_required) {
                        return; // At least one contact field must remain enabled
                      }
                      setLeadForm({ ...leadForm, is_phone_required: checked });
                    }}
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {leadForm.is_phone_required ? "Required" : "Optional"}
                </label>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <div>
                  <span className="text-xs font-bold text-zinc-800 block">Email Address Field</span>
                  <span className="text-[10px] text-zinc-500">Collect visitor email address</span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!leadForm.is_email_required}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (!checked && !leadForm.is_phone_required) {
                        return; // At least one contact field must remain enabled
                      }
                      setLeadForm({ ...leadForm, is_email_required: checked });
                    }}
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {leadForm.is_email_required ? "Required" : "Optional"}
                </label>
              </div>

              <p className="text-[10px] text-zinc-500 italic">
                * Note: At least one contact field (Phone or Email) must be enabled so the form remains actionable.
              </p>
            </div>
          </div>

          {/* Section 2: Submission Routing */}
          <div className="space-y-3.5 pt-3 border-t border-zinc-100">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-1.5">
              Submission Routing
            </h4>
            
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Target Email (For Form Submissions) *</Label>
              <Input
                type="email"
                value={leadForm.target || ""}
                onChange={(e) => setLeadForm({ ...leadForm, target: e.target.value })}
                placeholder="mail@domain.com"
                className={cn(
                  "bg-zinc-50 text-xs text-zinc-900 font-mono",
                  (!leadForm.target || !leadForm.target.trim() || !leadForm.target.includes("@"))
                    ? "border-rose-400 focus:ring-rose-500/30"
                    : "border-zinc-200"
                )}
              />
              {(!leadForm.target || !leadForm.target.trim() || !leadForm.target.includes("@")) ? (
                <p className="text-[11px] font-extrabold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Please enter a valid email address to receive lead notifications.
                </p>
              ) : (
                <p className="text-[10px] text-zinc-500">Form entries will be routed to this destination email address.</p>
              )}
            </div>
          </div>
        </>
      )}
      </CardContent>
      </Card>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      <AvatarCropModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCroppedAvatarUpload}
      />
    </div>
  );
}
