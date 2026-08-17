"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Clock, Trash2 } from "lucide-react";
import { useLibraryStore } from "@/store/library";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/types";

export default function LibraryPage() {
  const [tab, setTab] = useState<"liked" | "recent">("liked");
  const liked = useLibraryStore((s) => s.liked);
  const recent = useLibraryStore((s) => s.recent);
  const clearRecent = useLibraryStore((s) => s.clearRecent);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const items = tab === "liked" ? liked : recent;

  return (
    <div className="animate-fade-in px-5 pt-4">
      <h1 className="mb-4 text-[19px] font-bold text-base-50">Pustaka</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("liked")}
          className={`press flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium ${
            tab === "liked" ? "bg-base-50 text-base-950" : "bg-base-850 text-base-300"
          }`}
        >
          <Heart size={14} /> Disukai
        </button>
        <button
          onClick={() => setTab("recent")}
          className={`press flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium ${
            tab === "recent" ? "bg-base-50 text-base-950" : "bg-base-850 text-base-300"
          }`}
        >
          <Clock size={14} /> Baru diputar
        </button>
        {tab === "recent" && recent.length > 0 && (
          <button
            onClick={clearRecent}
            className="press ml-auto flex h-9 w-9 items-center justify-center rounded-full text-base-500"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-base-500">
          <p className="text-sm">
            {tab === "liked"
              ? "Belum ada lagu yang disukai. Ketuk ikon hati saat memutar lagu."
              : "Belum ada riwayat pemutaran."}
          </p>
        </div>
      ) : (
        <div className="space-y-1 pb-4">
          {items.map((track: Track, i) => (
            <button
              key={`${track.videoId}-${i}`}
              onClick={() => playTrack(track, items)}
              className="press flex w-full items-center gap-3 rounded-2xl p-1.5 text-left"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-base-800">
                {track.thumbnail && (
                  <Image
                    src={track.thumbnail}
                    alt={track.name}
                    fill
                    sizes="48px"
                    className="mono-art object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-base-50">{track.name}</p>
                <p className="truncate text-[12px] text-base-500">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
