"use client";

import React, { useRef, useState } from "react";
import { Play, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedItem {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: string;
  clicks: number;
}

interface FeedItemCardProps {
  item: FeedItem;
  onClick?: () => void;
  className?: string;
}

export function FeedItemCard({ item, onClick, className }: FeedItemCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        // Autoplay might be blocked, fallback gracefully
        console.log("Autoplay blocked", err);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/10 hover:shadow-2xl border border-zinc-800",
        className
      )}
    >
      {/* Thumbnail Image */}
      <img
        src={item.thumbnailUrl}
        alt={item.title}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          isHovered ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Video Element (Plays on hover) */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        loop
        muted
        playsInline
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 bg-black",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* Views count Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md border border-white/10">
        <Eye className="h-3.5 w-3.5 text-zinc-300" />
        <span>{item.views}</span>
      </div>

      {/* Play indicator */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/35">
          <Play className="h-5 w-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Content info (Title) */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="rounded-xl bg-black/40 p-3 backdrop-blur-md border border-white/5 transition-colors group-hover:bg-black/60">
          <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">
            {item.title}
          </p>
        </div>
      </div>
    </div>
  );
}
