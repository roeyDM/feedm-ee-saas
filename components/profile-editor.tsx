"use client";

import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { PlanType, checkUsernameAvailability, supabase } from "@/lib/supabase";

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

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error("Avatar upload failed:", err.message);
      alert("Failed to upload avatar. Please make sure the 'avatars' storage bucket exists and is public.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    if (editingLinkId === id) {
      setEditingLinkId(null);
    }
  };

  const handleEditClick = (link: CustomLink) => {
    setEditingLinkId(link.id);
    setEditFormData({ ...link });
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setEditFormData({});
  };

  const handleSaveEdit = () => {
    if (!editingLinkId || !editFormData.title || !editFormData.url) return;
    
    setCustomLinks(
      customLinks.map((link) =>
        link.id === editingLinkId ? { ...link, ...editFormData, url: editFormData.url?.startsWith("http") ? editFormData.url : `https://${editFormData.url}` } : link
      )
    );
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
    }
  };

  const handleSaveSocialEdit = () => {
    if (!editingSocialLinkId) return;
    
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === editingSocialLinkId ? { ...link, ...editSocialFormData } : link
      )
    );
    setEditingSocialLinkId(null);
    setEditSocialFormData({});
  };

  const platformIcons: Record<SocialLink["platform"], React.ReactNode> = {
    instagram: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    tiktok: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39v7.76c-.05 2.42-1.34 4.78-3.56 5.82-2.23 1.08-5.07.96-7.17-.32-2.22-1.33-3.41-3.99-2.92-6.55.39-2.22 2.14-4.09 4.36-4.53 1.21-.24 2.48-.06 3.56.55v4.2c-.88-.41-1.92-.48-2.78-.05-.98.47-1.57 1.57-1.45 2.66.1 1.07.94 1.99 2 2.08 1.15.11 2.25-.66 2.46-1.79.05-.28.06-.57.06-.85V.02z"/></svg>,
    twitter: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    facebook: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    youtube: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
    whatsapp: <MessageCircle className="h-5 w-5" />,
    linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    spotify: <Music className="h-5 w-5" />
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Basic Profile Info */}
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
            {/* Display Name */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivers"
                className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
              />
            </div>

            {/* Handle (@username) with Live Availability & Plan Lock */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-700">Handle (@username)</Label>
                {planType === "free" && (
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <Lock className="h-3 w-3" /> Pro Feature
                  </span>
                )}
              </div>

              {planType === "free" ? (
                <div className="relative">
                  <Input
                    disabled
                    value={username}
                    className="bg-zinc-100 border-zinc-200 text-xs text-zinc-500 font-medium cursor-not-allowed pr-20"
                  />
                  <Link href="/pricing" className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-black text-zinc-950 hover:bg-amber-400 transition flex items-center gap-1 shadow-sm">
                      <Zap className="h-3 w-3 fill-current" /> Upgrade
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="alexrivers"
                    className={`bg-zinc-50 text-xs text-zinc-900 pr-8 ${
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
              )}

              {/* Status indicator text */}
              {planType !== "free" && handleStatus && (
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold text-zinc-700">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div 
                className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 m-auto mt-4 text-zinc-400" />
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                
                {/* Loading state */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold rounded-xl h-9"
                >
                  {isUploadingAvatar ? "Uploading..." : "Change Photo"}
                </Button>
                <p className="text-[10px] text-zinc-500 mt-1.5 font-medium">
                  Recommended: Square image, at least 300x300px.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Quick Social Links */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <Share2 className="h-4.5 w-4.5 text-emerald-600" /> Social Links / Quick Add
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Click to add a social platform icon to your profile header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {(Object.keys(platformIcons) as SocialLink["platform"][]).map((platform) => (
              <Button
                key={platform}
                variant="outline"
                size="icon"
                onClick={() => handleAddSocialLink(platform)}
                className="w-full aspect-square h-auto rounded-xl border-zinc-200 hover:bg-zinc-100 hover:text-black text-zinc-600 bg-white shadow-sm"
              >
                {platformIcons[platform]}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2 mt-4">
            {socialLinks.map((link) => (
              <div key={link.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                {editingSocialLinkId === link.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                         {platformIcons[link.platform]}
                      </div>
                      <span className="text-xs font-bold capitalize text-zinc-800">{link.platform}</span>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-zinc-500">URL or Username</Label>
                      <Input
                        value={editSocialFormData.url || ""}
                        onChange={(e) => setEditSocialFormData({ ...editSocialFormData, url: e.target.value })}
                        placeholder={`e.g. https://${link.platform}.com/yourname`}
                        className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                      />
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
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", link.isActive === false ? "bg-zinc-200 text-zinc-400" : "bg-white text-zinc-800 shadow-sm border border-zinc-200")}>
                        {platformIcons[link.platform]}
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs font-bold capitalize truncate", link.isActive === false ? "text-zinc-400 line-through" : "text-zinc-900")}>
                          {link.platform} {link.label && <span className="text-zinc-500 font-normal ml-1">({link.label})</span>}
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
                      {link.thumbnailUrl && (
                        <div className="flex-shrink-0 h-8 w-8 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                          <img src={link.thumbnailUrl} alt={link.title} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={cn("text-xs font-bold truncate", link.isActive === false ? "text-zinc-400 line-through" : "text-zinc-900")}>
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

          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-700">Target Email (For Form Submissions)</Label>
            <Input
              value={leadForm.target}
              onChange={(e) => setLeadForm({ ...leadForm, target: e.target.value })}
              placeholder="mail@domain.com"
              className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-zinc-700">Target Phone (For WhatsApp & Call Buttons)</Label>
            <div className="flex gap-2">
              <CountrySelector 
                value={leadForm.phoneCountryCode || "972"} 
                onChange={(val) => setLeadForm({ ...leadForm, phoneCountryCode: val })} 
              />
              <Input
                value={leadForm.phoneTarget || ""}
                onChange={(e) => setLeadForm({ ...leadForm, phoneTarget: e.target.value })}
                placeholder="Local number (e.g. 501234567)"
                className="flex-1 bg-zinc-50 border-zinc-200 text-xs text-zinc-900 h-10"
              />
            </div>
            <p className="text-[10px] text-zinc-500 pt-1">The local number will be automatically sanitized and formatted.</p>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex flex-col gap-3">
            <Label className="text-xs font-bold text-zinc-700 block">Form Field Requirements</Label>
            
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!leadForm.is_phone_required}
                onChange={(e) => setLeadForm({ ...leadForm, is_phone_required: e.target.checked })}
                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              Require Phone Number
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!leadForm.is_email_required}
                onChange={(e) => setLeadForm({ ...leadForm, is_email_required: e.target.checked })}
                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              Require Email Address
            </label>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <Label className="text-xs font-bold text-zinc-700 block mb-2">Global Action Buttons (Shown on all Reels)</Label>
            <div className="flex items-center gap-5 mt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={leadForm.showWhatsappButton || false}
                  onChange={(e) => setLeadForm({ ...leadForm, showWhatsappButton: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-1">
                  <span className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    WA
                  </span>
                  WhatsApp
                </div>
              </label>
              
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={leadForm.showCallButton || false}
                  onChange={(e) => setLeadForm({ ...leadForm, showCallButton: e.target.checked })}
                  className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                />
                <div className="flex items-center gap-1">
                  <span className="h-4 w-4 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    Call
                  </span>
                  Phone Call
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
