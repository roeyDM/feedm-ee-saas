"use client";

import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { VideoReel, LeadFormSettings } from "./mobile-preview";
import { CountrySelector } from "@/components/country-selector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "@/components/upgrade-modal";
import {
  Film,
  Trash2,
  Plus,
  MessageCircle,
  Phone,
  Heart,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Link2,
  Zap,
  ArrowRight,
  GripVertical,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface FeedItemEditorProps {
  reels: VideoReel[];
  setReels: (reels: VideoReel[]) => void;
  planType?: string;
  leadForm?: LeadFormSettings;
  setLeadForm?: (form: LeadFormSettings) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 30;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"]; // .mp4 & .mov

const PRESET_CLIPS = [
  {
    url: "/demo-video-1.mp4",
    caption: "Still using text links from 2018? Meet FeedM.ee — the video-first bio link. 🚀",
  },
  {
    url: "/demo-video-2.mp4",
    caption: "Stop letting your best Reels disappear! Turn top content into a 24/7 sales engine. 💰",
  },
  {
    url: "/demo-video-3.mp4",
    caption: "Build your video bio link in under 60 seconds! Connect, upload & convert. ⚡",
  },
];

// ─── Toast Banner Helper ────────────────────────────────────────────────────────
type ToastType = "error" | "success" | "info";

interface Toast {
  type: ToastType;
  message: string;
}

function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles: Record<ToastType, string> = {
    error: "bg-rose-600 text-white",
    success: "bg-emerald-600 text-white",
    info: "bg-blue-600 text-white",
  };
  const icons: Record<ToastType, React.ReactNode> = {
    error: <AlertCircle className="h-4 w-4 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    info: <UploadCloud className="h-4 w-4 shrink-0" />,
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-bold shadow-md",
        styles[toast.type]
      )}
    >
      <div className="flex items-center gap-2">
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
      <button onClick={onDismiss} className="opacity-70 hover:opacity-100 transition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────────────────────
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function FeedItemEditor({ reels, setReels, planType = "pro", leadForm, setLeadForm }: FeedItemEditorProps) {
  // Form state
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");

  // Upload state
  const [uploadMode, setUploadMode] = useState<"url" | "file">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ─── File Selection Validation ────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (planType === "free") {
      setShowUpgradeModal(true);
      if (e.target) e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Type check
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast("error", "Invalid file type. Please upload a .mp4 or .mov video file.");
      e.target.value = "";
      return;
    }

    // Size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      showToast(
        "error",
        `File too large (${sizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
      );
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setVideoUrl(""); // clear any manual URL
    showToast("info", `"${file.name}" selected (${(file.size / 1024 / 1024).toFixed(1)} MB). Ready to upload.`);
  };

  // ─── Supabase Storage Upload ──────────────────────────────────────────────────
  const uploadToSupabase = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    // Unique path: username-timestamp-filename
    const ext = selectedFile.name.split(".").pop();
    const fileName = `reel-${Date.now()}.${ext}`;
    const filePath = `uploads/${fileName}`;

    try {
      // Simulate progress via polling (Supabase JS client does not expose upload progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + Math.random() * 12;
        });
      }, 300);

      const { data, error } = await supabase.storage
        .from("creator-videos")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      setUploadProgress(100);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("creator-videos")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast("error", err.message || "Upload failed. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  // ─── Add Reel Handler ─────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (planType === "free") {
      setShowUpgradeModal(true);
      return;
    }

    if (reels.length >= 3) {
      showToast("error", "Maximum 3 video reels allowed.");
      return;
    }

    if (!caption.trim()) {
      showToast("error", "Please enter a caption for this reel.");
      return;
    }

    let finalUrl = "";

    // Direct file upload required
    if (selectedFile) {
      const uploadedUrl = await uploadToSupabase();
      if (!uploadedUrl) return; // abort if upload failed
      finalUrl = uploadedUrl;
      showToast("success", "Video uploaded successfully!");
    } else {
      showToast("error", "Please select a video file (.mp4 or .mov) to upload.");
      return;
    }

    const newReel: VideoReel = {
      id: Math.random().toString(36).substring(2, 9),
      videoUrl: finalUrl,
      caption,
      likes: Math.floor(Math.random() * 300) + 100,
    };

    setReels([...reels, newReel]);

    // Reset form
    setCaption("");
    setVideoUrl("");
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    setReels(reels.filter((r) => r.id !== id));
  };

  const handleUpdateCaption = (id: string, newCaption: string) => {
    setReels(reels.map((r) => (r.id === id ? { ...r, caption: newCaption } : r)));
  };

  const handleUpdateReel = (id: string, updates: Partial<VideoReel>) => {
    // Check if user is trying to enable promo but is on free plan
    if (updates.promoEnabled && planType === "free") {
      setShowUpgradeModal(true);
      return;
    }
    setReels(reels.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const onDragEndReels = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(reels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setReels(items);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Universal Upgrade Modal */}
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />

      {/* Toast Notification Banner */}
      {toast && (
        <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      )}

      {/* Free Plan Lock Warning Banner */}
      {planType === "free" && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm font-black">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black">Video Reels &amp; Pages 2–4 Locked</h4>
              <p className="text-[11px] font-semibold text-amber-800 mt-0.5">
                Upgrade to Pro to unlock 3 vertical video reels, lead form, and remove branding.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs h-9 px-3.5 rounded-xl shrink-0 gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Unlock Pro</span> <Zap className="h-3.5 w-3.5 fill-current" />
          </Button>
        </div>
      )}

      {/* Add Reel Form */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <Film className="h-4.5 w-4.5 text-emerald-600" /> Reels Manager
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Upload .mp4 or .mov files directly from your device (max {MAX_FILE_SIZE_MB} MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">

            {/* ── File Upload ── */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-700">
                Video File (.mp4, .mov — max {MAX_FILE_SIZE_MB} MB)
              </Label>

              {/* Drop-zone styled input */}
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer",
                  selectedFile
                    ? "border-emerald-500/60 bg-emerald-50"
                    : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,video/mp4,video/quicktime"
                  onChange={handleFileSelect}
                  className="sr-only"
                />

                {selectedFile ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <div className="text-center">
                      <p className="text-xs font-black text-emerald-800 truncate max-w-[220px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB — Ready to upload
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-zinc-600 hover:text-rose-600 shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-zinc-400" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-zinc-700">
                        Click to browse or drag & drop
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        .mp4 or .mov — maximum {MAX_FILE_SIZE_MB} MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Upload Progress Bar */}
              {(isUploading || uploadProgress > 0) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-zinc-600">
                      {isUploading ? "Uploading to Supabase..." : "Upload complete!"}
                    </span>
                    <span className={isUploading ? "text-zinc-500" : "text-emerald-600"}>
                      {Math.round(Math.min(uploadProgress, 100))}%
                    </span>
                  </div>
                  <ProgressBar percent={Math.min(uploadProgress, 100)} />
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Video Caption</Label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption text overlay for this video..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            {/* Quick Presets (only in URL mode) */}
            {uploadMode === "url" && (
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Quick Video Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_CLIPS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setVideoUrl(p.url);
                        setCaption(p.caption);
                      }}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 transition"
                    >
                      Preset {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={reels.length >= 3 || isUploading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs h-10 shadow-sm"
            >
              {isUploading ? (
                <>
                  <span className="animate-pulse">Uploading…</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  {uploadMode === "file" && selectedFile
                    ? "Upload & Add Reel"
                    : `Add Reel (${reels.length}/3)`}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Reels List */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900">
              Active Reels ({reels.length}/3)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Each reel forms a vertical snap page in your public profile
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4">
          {reels.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 flex flex-col items-center justify-center">
              <Sparkles className="h-6 w-6 text-zinc-300 mb-2" />
              <p className="text-xs font-medium">No video reels added yet.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Upload a file or paste a URL above.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEndReels}>
              <Droppable droppableId="active-reels">
                {(provided) => (
                  <div 
                    className="flex flex-col gap-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {reels.map((reel, index) => (
                      <Draggable key={reel.id} draggableId={reel.id} index={index}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="p-4 flex flex-col gap-3 bg-white rounded-xl border border-zinc-200 shadow-sm"
                          >
                            {/* Top Row: Info & Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0 w-full">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 mt-2"
                                >
                                  <GripVertical className="h-5 w-5" />
                                </div>
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 font-black text-xs text-zinc-700 mt-1">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <textarea
                        rows={2}
                        value={reel.caption}
                        onChange={(e) => handleUpdateCaption(reel.id, e.target.value)}
                        className="w-full text-xs font-bold text-zinc-900 rounded-md border border-transparent hover:border-zinc-200 focus:border-zinc-300 focus:ring-2 focus:ring-emerald-500/30 p-1 resize-none bg-transparent hover:bg-zinc-50 focus:bg-white transition"
                        placeholder="Edit caption..."
                      />
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-zinc-500 px-1">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-rose-500 fill-current" /> {reel.likes} Likes
                        </span>
                        {reel.videoUrl.includes("supabase") && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">
                            Supabase ↑
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:shrink-0 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(reel.id)}
                      className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                {/* Promo Settings Toggle */}
                <div className="w-full pt-2 border-t border-zinc-100 flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!reel.promoEnabled}
                      onChange={(e) => handleUpdateReel(reel.id, { promoEnabled: e.target.checked })}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Enable Video Promo / Deal
                  </label>
                  
                  {reel.promoEnabled && (
                    <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 mt-1 grid gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-zinc-500">Call-to-Action (CTA)</Label>
                          <select
                            value={reel.promoCta || "Get Deal 🚀"}
                            onChange={(e) => handleUpdateReel(reel.id, { promoCta: e.target.value })}
                            className="w-full rounded-md border border-zinc-200 bg-white p-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 h-8"
                          >
                            <option value="Get Deal 🚀">Get Deal 🚀</option>
                            <option value="Shop Now 🛍️">Shop Now 🛍️</option>
                            <option value="Open Link 🔗">Open Link 🔗</option>
                            <option value="Book Now 📅">Book Now 📅</option>
                            <option value="Visit Website 🌐">Visit Website 🌐</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-zinc-500">Promo Title</Label>
                          <Input
                            value={reel.promoTitle || ""}
                            onChange={(e) => handleUpdateReel(reel.id, { promoTitle: e.target.value })}
                            placeholder="e.g. 15% discount on Ninja Ice Cream"
                            className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-zinc-500">Coupon Code (Optional)</Label>
                          <Input
                            value={reel.promoCode || ""}
                            onChange={(e) => handleUpdateReel(reel.id, { promoCode: e.target.value })}
                            placeholder="e.g. NINJA15"
                            className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-zinc-500">Target URL</Label>
                          <Input
                            value={reel.promoUrl || ""}
                            onChange={(e) => handleUpdateReel(reel.id, { promoUrl: e.target.value })}
                            placeholder="https://example.com/product"
                            className="bg-white border-zinc-200 text-xs text-zinc-900 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-zinc-500">Display Delay</Label>
                          <select
                            value={reel.promoDelaySeconds ?? 3}
                            onChange={(e) => handleUpdateReel(reel.id, { promoDelaySeconds: parseInt(e.target.value) })}
                            className="w-full rounded-md border border-zinc-200 bg-white p-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 h-8"
                          >
                            <option value={0}>0s (Immediate)</option>
                            <option value={3}>3s</option>
                            <option value={5}>5s</option>
                            <option value={8}>8s</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </Draggable>
          ))}
          {provided.placeholder}
          </div>
          )}
          </Droppable>
          </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Reel Action Buttons & Contact Phone */}
      {leadForm && setLeadForm && (
        <Card className="bg-white border-zinc-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
              <MessageCircle className="h-4.5 w-4.5 text-emerald-600" /> Reel Action Buttons & Contact Phone
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Configure the floating WhatsApp and Call action buttons displayed on your video reels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Target Phone (For WhatsApp & Call Buttons)</Label>
              <div className="flex gap-2">
                <CountrySelector 
                  value={leadForm.phoneCountryCode || "1"} 
                  onChange={(val) => setLeadForm({ ...leadForm, phoneCountryCode: val })} 
                />
                <Input
                  value={leadForm.phoneTarget || ""}
                  onChange={(e) => setLeadForm({ ...leadForm, phoneTarget: e.target.value })}
                  placeholder="Local phone number (e.g. 5551234567)"
                  className="flex-1 bg-zinc-50 border-zinc-200 text-xs text-zinc-900 h-10"
                />
              </div>
              <p className="text-[10px] text-zinc-500 pt-0.5">The phone number is formatted automatically for WhatsApp API & Direct Calls.</p>
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <Label className="text-xs font-bold text-zinc-700 block mb-2">Reel Action Overlay Buttons</Label>
              <div className="flex items-center gap-6 mt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={leadForm.showWhatsappButton || false}
                    onChange={(e) => setLeadForm({ ...leadForm, showWhatsappButton: e.target.checked })}
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
                      WA
                    </span>
                    WhatsApp Button
                  </div>
                </label>
                
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={leadForm.showCallButton || false}
                    onChange={(e) => setLeadForm({ ...leadForm, showCallButton: e.target.checked })}
                    className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-[10px]">
                      Call
                    </span>
                    Phone Call Button
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
