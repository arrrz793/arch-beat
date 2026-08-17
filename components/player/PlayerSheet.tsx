"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Heart,
  Share2,
  MoreHorizontal,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  ListMusic,
  Mic2,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayerStore } from "@/store/player";
import { useLibraryStore } from "@/store/library";
import LyricsView from "./LyricsView";
import QueueSheet from "./QueueSheet";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerSheet() {
  const {
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    progress,
    duration,
    volume,
    muted,
    repeat,
    shuffle,
    isSheetOpen,
    lyricsOpen,
    closeSheet,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleLyrics,
  } = usePlayerStore();

  const [queueOpen, setQueueOpen] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const isLiked = useLibraryStore((s) => s.isLiked);
  const toggleLike = useLibraryStore((s) => s.toggleLike);

  const track = queue[currentIndex];
  const liked = track ? isLiked(track.videoId) : false;

  if (!track) return null;

  const shownProgress = dragProgress ?? progress;
  const pct = duration > 0 ? Math.min(100, (shownProgress / duration) * 100) : 0;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 34, stiffness: 280 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 800) closeSheet();
          }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-base-950"
        >
          {/* Blurred monochrome backdrop derived from the current cover art */}
          <div className="pointer-events-none absolute inset-0">
            {track.thumbnail && (
              <Image
                src={track.thumbnail}
                alt=""
                fill
                className="mono-art scale-125 object-cover opacity-25 blur-3xl"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-base-950/60 via-base-950/85 to-base-950" />
          </div>

          {/* Header */}
          <div className="safe-top relative z-10 flex items-center justify-between px-4 pt-3">
            <button onClick={closeSheet} className="press flex h-10 w-10 items-center justify-center rounded-full">
              <ChevronDown size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[11px] uppercase tracking-wide text-base-400">
                Sedang Diputar
              </span>
              <span className="max-w-[220px] truncate text-[13px] font-medium text-base-200">
                {track.album ?? track.artist}
              </span>
            </div>
            <button
              onClick={() => setQueueOpen(true)}
              className="press flex h-10 w-10 items-center justify-center rounded-full"
            >
              <ListMusic size={20} />
            </button>
          </div>

          {/* Body: cover or lyrics, animated crossfade */}
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-6 pt-4">
            <AnimatePresence mode="wait">
              {lyricsOpen ? (
                <motion.div
                  key="lyrics"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-base-800">
                      {track.thumbnail && (
                        <Image src={track.thumbnail} alt="" fill sizes="44px" className="mono-art object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold">{track.name}</p>
                      <p className="truncate text-[12.5px] text-base-400">{track.artist}</p>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1">
                    <LyricsView videoId={track.videoId} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="cover"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-1 flex-col items-center justify-center"
                >
                  <motion.div
                    key={track.videoId}
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative aspect-square w-full max-w-[340px] overflow-hidden rounded-3xl bg-base-800 shadow-2xl shadow-black/60"
                  >
                    {track.thumbnail && (
                      <Image
                        src={track.thumbnail}
                        alt={track.name}
                        fill
                        sizes="340px"
                        className="mono-art object-cover"
                        priority
                      />
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Track info + actions */}
          <div className="relative z-10 px-6 pt-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[21px] font-bold text-base-50">{track.name}</h2>
                <p className="truncate text-[14px] text-base-400">{track.artist}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button className="press flex h-9 w-9 items-center justify-center rounded-full text-base-200">
                  <Share2 size={19} />
                </button>
                <button
                  onClick={() => toggleLike(track)}
                  className="press flex h-9 w-9 items-center justify-center rounded-full"
                >
                  <Heart
                    size={20}
                    className={liked ? "text-base-50" : "text-base-200"}
                    fill={liked ? "currentColor" : "none"}
                  />
                </button>
                <button className="press flex h-9 w-9 items-center justify-center rounded-full text-base-200">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={shownProgress}
                onChange={(e) => setDragProgress(parseFloat(e.target.value))}
                onPointerUp={(e) => {
                  seek(parseFloat((e.target as HTMLInputElement).value));
                  setDragProgress(null);
                }}
                className="range-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-base-700 accent-white"
                style={{
                  background: `linear-gradient(to right, #fafafa ${pct}%, #262626 ${pct}%)`,
                }}
              />
              <div className="mt-1.5 flex justify-between text-[11.5px] text-base-500">
                <span>{formatTime(shownProgress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport controls */}
            <div className="mt-2 flex items-center justify-between px-1">
              <button
                onClick={toggleShuffle}
                className={`press flex h-10 w-10 items-center justify-center rounded-full ${
                  shuffle ? "text-base-50" : "text-base-500"
                }`}
              >
                <Shuffle size={20} />
              </button>
              <button onClick={previous} className="press flex h-11 w-11 items-center justify-center rounded-full text-base-50">
                <SkipBack size={26} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="press flex h-16 w-16 items-center justify-center rounded-full bg-base-50 text-base-950 shadow-lg shadow-black/40"
              >
                {isLoading ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-base-900/25 border-t-base-900" />
                ) : isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" className="ml-1" />
                )}
              </button>
              <button onClick={next} className="press flex h-11 w-11 items-center justify-center rounded-full text-base-50">
                <SkipForward size={26} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`press flex h-10 w-10 items-center justify-center rounded-full ${
                  repeat !== "off" ? "text-base-50" : "text-base-500"
                }`}
              >
                <RepeatIcon size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="mt-1 flex items-center gap-3 px-1">
              <button onClick={toggleMute} className="press text-base-400">
                <VolumeIcon size={18} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full"
                style={{
                  background: `linear-gradient(to right, #a3a3a3 ${
                    (muted ? 0 : volume) * 100
                  }%, #262626 ${(muted ? 0 : volume) * 100}%)`,
                }}
              />
            </div>

            {/* Bottom pill row */}
            <div className="mb-[calc(20px+env(safe-area-inset-bottom))] mt-4 flex items-center gap-2.5">
              <button
                onClick={() => setQueueOpen(true)}
                className="press flex flex-1 items-center justify-center gap-2 rounded-full bg-base-800/80 py-2.5 text-[13px] font-medium text-base-200"
              >
                <ListMusic size={16} /> Antrean
              </button>
              <button
                onClick={toggleLyrics}
                className={`press flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-medium ${
                  lyricsOpen ? "bg-base-50 text-base-950" : "bg-base-800/80 text-base-200"
                }`}
              >
                <Mic2 size={16} /> Lirik
              </button>
            </div>
          </div>

          {queueOpen && <QueueSheet onClose={() => setQueueOpen(false)} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
