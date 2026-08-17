"use client";

import Image from "next/image";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/types";

export default function TrackTile({ track, queue }: { track: Track; queue: Track[] }) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.queue[s.currentIndex]);
  const isActive = currentTrack?.videoId === track.videoId;

  return (
    <button
      onClick={() => playTrack(track, queue)}
      className={`press flex items-center gap-3 rounded-2xl p-2 text-left ${
        isActive ? "bg-base-800" : ""
      }`}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-base-800">
        {track.thumbnail && (
          <Image src={track.thumbnail} alt={track.name} fill sizes="56px" className="mono-art object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`truncate text-[13.5px] font-semibold ${
            isActive ? "text-base-50" : "text-base-100"
          }`}
        >
          {track.name}
        </p>
        <p className="truncate text-[12px] text-base-500">{track.artist}</p>
      </div>
    </button>
  );
}
