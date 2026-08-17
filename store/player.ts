"use client";

import { create } from "zustand";
import type { Track, RepeatMode } from "@/types";

interface PlayerState {
  queue: Track[];
  originalQueue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number; // seconds
  duration: number; // seconds
  volume: number; // 0-1
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  isSheetOpen: boolean;
  lyricsOpen: boolean;

  currentTrack: () => Track | null;

  playTrack: (track: Track, queue?: Track[]) => void;
  playQueueAt: (index: number) => void;
  togglePlay: () => void;
  setPlaying: (v: boolean) => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setProgress: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setLoading: (v: boolean) => void;
  openSheet: () => void;
  closeSheet: () => void;
  toggleLyrics: () => void;
  enqueueRelated: (tracks: Track[]) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  volume: 1,
  muted: false,
  repeat: "off",
  shuffle: false,
  isSheetOpen: false,
  lyricsOpen: false,

  currentTrack: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },

  playTrack: (track, queue) => {
    const baseQueue = queue && queue.length > 0 ? queue : [track];
    const idx = baseQueue.findIndex((t) => t.videoId === track.videoId);
    set({
      originalQueue: baseQueue,
      queue: get().shuffle ? shuffleArray(baseQueue) : baseQueue,
      currentIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
      isLoading: true,
      progress: 0,
      isSheetOpen: true,
    });
  },

  playQueueAt: (index) => {
    set({ currentIndex: index, isPlaying: true, isLoading: true, progress: 0 });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (v) => set({ isPlaying: v }),

  next: () => {
    const { queue, currentIndex, repeat } = get();
    if (queue.length === 0) return;
    if (repeat === "one") {
      set({ progress: 0, isPlaying: true });
      return;
    }
    const isLast = currentIndex >= queue.length - 1;
    if (isLast) {
      if (repeat === "all") {
        set({ currentIndex: 0, progress: 0, isPlaying: true, isLoading: true });
      } else {
        set({ isPlaying: false });
      }
      return;
    }
    set({ currentIndex: currentIndex + 1, progress: 0, isPlaying: true, isLoading: true });
  },

  previous: () => {
    const { queue, currentIndex, progress } = get();
    if (queue.length === 0) return;
    // Restart current track if we're more than 3s in (standard player UX).
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }
    const newIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
    set({ currentIndex: newIndex, progress: 0, isPlaying: true, isLoading: true });
  },

  seek: (time) => set({ progress: time }),
  setProgress: (t) => set({ progress: t }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => set({ volume: v, muted: v === 0 }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),

  toggleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),

  toggleShuffle: () =>
    set((s) => {
      const shuffle = !s.shuffle;
      const current = s.queue[s.currentIndex];
      const base = shuffle ? shuffleArray(s.originalQueue) : s.originalQueue;
      const newIndex = current ? base.findIndex((t) => t.videoId === current.videoId) : 0;
      return { shuffle, queue: base, currentIndex: Math.max(newIndex, 0) };
    }),

  setLoading: (v) => set({ isLoading: v }),
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false, lyricsOpen: false }),
  toggleLyrics: () => set((s) => ({ lyricsOpen: !s.lyricsOpen })),

  enqueueRelated: (tracks) =>
    set((s) => {
      const existingIds = new Set(s.queue.map((t) => t.videoId));
      const fresh = tracks.filter((t) => !existingIds.has(t.videoId));
      return {
        queue: [...s.queue, ...fresh],
        originalQueue: [...s.originalQueue, ...fresh],
      };
    }),
}));
