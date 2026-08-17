"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/types";

export default function TrendingCard({ track, queue }: { track: Track; queue: Track[] }) {
  const playTrack = usePlayerStore((s) => s.playTrack);

  return (
    <button
      onClick={() => playTrack(track, queue)}
      className="press relative aspect-square w-[168px] shrink-0 overflow-hidden rounded-3xl bg-base-800 text-left"
    >
      {track.thumbnail && (
        <Image
          src={track.thumbnail}
          alt={track.name}
          fill
          sizes="168px"
          className="mono-art object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="line-clamp-2 text-[13.5px] font-semibold leading-tight text-base-50">
          {track.name}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] text-base-300">{track.artist}</p>
      </div>
      <div className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-base-50/90">
        <Play size={14} fill="black" className="ml-0.5 text-black" />
      </div>
    </button>
  );
}
