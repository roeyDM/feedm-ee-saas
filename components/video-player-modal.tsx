"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, Eye } from "lucide-react";
import { FeedItem } from "./feed-item-card";
import { cn } from "@/lib/utils";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FeedItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  creatorName?: string;
  creatorAvatar?: string;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate,
  creatorName = "Creator",
  creatorAvatar,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => console.log("Play failed", err));
      }
    }
  }, [currentIndex, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, items.length]);

  if (!isOpen || !currentItem) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => console.log("Play failed", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickPercent = clickX / width;
      videoRef.current.currentTime = clickPercent * videoRef.current.duration;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg transition-all duration-300">
      {/* Background click closes modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Main Container */}
      <div className="relative flex h-full max-h-[100dvh] w-full max-w-[480px] flex-col items-center justify-center overflow-hidden bg-zinc-950 sm:h-[85vh] sm:rounded-3xl sm:border sm:border-zinc-800 sm:shadow-2xl">
        
        {/* Navigation - Left Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-4 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/5 transition hover:bg-black/60 hover:scale-105"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Navigation - Right Arrow */}
        {currentIndex < items.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-4 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/5 transition hover:bg-black/60 hover:scale-105"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Video Wrapper */}
        <div className="relative h-full w-full cursor-pointer bg-black" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={currentItem.videoUrl}
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="h-full w-full object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

          {/* Top Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
            {/* Creator Badge */}
            <div className="flex items-center gap-2.5 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-md border border-white/10">
              {creatorAvatar ? (
                <img src={creatorAvatar} alt={creatorName} className="h-6 w-6 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black uppercase">
                  {creatorName.substring(0, 2)}
                </div>
              )}
              <span className="text-xs font-semibold text-white">@{creatorName}</span>
            </div>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md border border-white/10 transition hover:bg-black/50"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Big Play/Pause Center Indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md scale-100 transition-all duration-300">
                <Play className="h-8 w-8 fill-current ml-1 text-emerald-400" />
              </div>
            </div>
          )}

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
            <div className="flex flex-col gap-2 max-w-[85%] text-left">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold tracking-wider uppercase">
                <Eye className="h-3.5 w-3.5" /> {currentItem.views} Views
              </span>
              <h2 className="text-lg font-bold text-white leading-tight drop-shadow-md">
                {currentItem.title}
              </h2>
            </div>
          </div>

          {/* Custom Timeline Scrubber */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/25 cursor-pointer z-40 transition-all hover:h-2"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-lg opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
