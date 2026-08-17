"use client";

import Image from "next/image";
import { Play, Pause, SkipForward } from "lucide-react";
import { usePlayerStore } from "@/store/player";

export default function MiniPlayer() {
  const { queue, currentIndex, isPlaying, isLoading, progress, duration, togglePlay, next, openSheet } =
    usePlayerStore();

  const track = queue[currentIndex];
  if (!track) return null;

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <button
      onClick={openSheet}
      className="press relative flex w-full items-center gap-3 border-t border-base-800 bg-base-850/95 px-3 py-2 text-left backdrop-blur-xl"
      aria-label="Buka pemutar"
    >
      <div
        className="absolute left-0 top-0 h-[2px] bg-base-100 transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-base-700">
        {track.thumbnail && (
          <Image
            src={track.thumbnail}
            alt={track.name}
            fill
            sizes="44px"
            className="mono-art object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-base-50">{track.name}</p>
        <p className="truncate text-[12px] text-base-400">{track.artist}</p>
      </div>
      <div className="flex items-center gap-1">
        <span
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="press flex h-9 w-9 items-center justify-center rounded-full bg-base-50 text-base-900"
        >
          {isLoading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-base-900/30 border-t-base-900" />
          ) : isPlaying ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" className="ml-0.5" />
          )}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="press flex h-9 w-9 items-center justify-center rounded-full text-base-100"
        >
          <SkipForward size={19} fill="currentColor" />
        </span>
      </div>
    </button>
  );
}
