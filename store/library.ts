"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types";

interface LibraryState {
  liked: Track[];
  recent: Track[];
  isLiked: (videoId: string) => boolean;
  toggleLike: (track: Track) => void;
  addRecent: (track: Track) => void;
  clearRecent: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      liked: [],
      recent: [],

      isLiked: (videoId) => get().liked.some((t) => t.videoId === videoId),

      toggleLike: (track) =>
        set((s) => {
          const exists = s.liked.some((t) => t.videoId === track.videoId);
          return {
            liked: exists
              ? s.liked.filter((t) => t.videoId !== track.videoId)
              : [track, ...s.liked],
          };
        }),

      addRecent: (track) =>
        set((s) => {
          const withoutDup = s.recent.filter((t) => t.videoId !== track.videoId);
          return { recent: [track, ...withoutDup].slice(0, 30) };
        }),

      clearRecent: () => set({ recent: [] }),
    }),
    { name: "archbeat-library" }
  )
);
