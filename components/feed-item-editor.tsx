"use client";

import React, { useState, useRef } from "react";
import { VideoReel } from "./mobile-preview";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface FeedItemEditorProps {
  reels: VideoReel[];
  setReels: (reels: VideoReel[]) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 30;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"]; // .mp4 & .mov

const PRESET_CLIPS = [
  {
    url: "https://assets.mixkit.co/videos/preview/mixkit-mysterious-pale-looking-woman-with-neon-make-up-42322-large.mp4",
    caption: "Chasing neon nights and urban vibes 🌆✨ What do you think?",
  },
  {
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-taking-selfie-in-front-of-neon-sign-42326-large.mp4",
    caption: "Golden hour sunset by the coast 🌊🌅 Follow for more reels!",
  },
  {
    url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-in-autumn-48906-large.mp4",
    caption: "Fall season is finally here 🍂💛 Loving this yellow glow.",
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
export function FeedItemEditor({ reels, setReels }: FeedItemEditorProps) {
  // Form state
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  const [showCall, setShowCall] = useState(false);

  // Upload state
  const [uploadMode, setUploadMode] = useState<"url" | "file">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ─── File Selection Validation ────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (reels.length >= 3) {
      showToast("error", "Maximum 3 video reels allowed.");
      return;
    }

    if (!caption.trim()) {
      showToast("error", "Please enter a caption for this reel.");
      return;
    }

    let finalUrl = videoUrl.trim();

    // If a file was selected, upload it first
    if (selectedFile && uploadMode === "file") {
      const uploadedUrl = await uploadToSupabase();
      if (!uploadedUrl) return; // abort if upload failed
      finalUrl = uploadedUrl;
      showToast("success", "Video uploaded successfully to Supabase!");
    }

    if (!finalUrl) {
      showToast("error", "Please select a video file or enter a URL.");
      return;
    }

    const newReel: VideoReel = {
      id: Math.random().toString(36).substring(2, 9),
      videoUrl: finalUrl,
      caption,
      likes: Math.floor(Math.random() * 300) + 100,
      showWhatsapp,
      showCall,
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

  const toggleReelWhatsapp = (id: string) => {
    setReels(reels.map((r) => (r.id === id ? { ...r, showWhatsapp: !r.showWhatsapp } : r)));
  };

  const toggleReelCall = (id: string) => {
    setReels(reels.map((r) => (r.id === id ? { ...r, showCall: !r.showCall } : r)));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification Banner */}
      {toast && (
        <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      )}

      {/* Add Reel Form */}
      <Card className="bg-white border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
            <Film className="h-4.5 w-4.5 text-emerald-600" /> Video Reels Manager (Pages 2–4)
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Upload .mp4 or .mov files (max {MAX_FILE_SIZE_MB} MB) or paste an external URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all",
                  uploadMode === "file"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <UploadCloud className="h-4 w-4" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all",
                  uploadMode === "url"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <Link2 className="h-4 w-4" /> Paste URL
              </button>
            </div>

            {/* ── File Upload Mode ── */}
            {uploadMode === "file" && (
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
            )}

            {/* ── URL Mode ── */}
            {uploadMode === "url" && (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700">Video Source URL (MP4)</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="bg-zinc-50 border-zinc-200 text-xs text-zinc-900"
                />
              </div>
            )}

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

            {/* Action Toggles */}
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showWhatsapp}
                  onChange={(e) => setShowWhatsapp(e.target.checked)}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp Button
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCall}
                  onChange={(e) => setShowCall(e.target.checked)}
                  className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                />
                <Phone className="h-4 w-4 text-cyan-600" /> Call Button
              </label>
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
        <CardContent className="divide-y divide-zinc-100 p-0">
          {reels.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 flex flex-col items-center justify-center">
              <Sparkles className="h-6 w-6 text-zinc-300 mb-2" />
              <p className="text-xs font-medium">No video reels added yet.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Upload a file or paste a URL above.</p>
            </div>
          ) : (
            reels.map((reel, idx) => (
              <div key={reel.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 font-black text-xs text-zinc-700">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate max-w-[200px]">
                      {reel.caption}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-zinc-500">
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReelWhatsapp(reel.id)}
                    className={cn(
                      "h-7 px-2 rounded-lg text-[10px] font-bold border transition flex items-center gap-1",
                      reel.showWhatsapp
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-zinc-50 text-zinc-400 border-zinc-200"
                    )}
                  >
                    <MessageCircle className="h-3 w-3" /> WA
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleReelCall(reel.id)}
                    className={cn(
                      "h-7 px-2 rounded-lg text-[10px] font-bold border transition flex items-center gap-1",
                      reel.showCall
                        ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                        : "bg-zinc-50 text-zinc-400 border-zinc-200"
                    )}
                  >
                    <Phone className="h-3 w-3" /> Call
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reel.id)}
                    className="h-7 w-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
