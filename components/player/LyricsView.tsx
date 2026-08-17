"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { usePlayerStore } from "@/store/player";
import type { LyricsResponse } from "@/types";

/**
 * Mirrors the reference app's lyrics screen: the active line is bold and
 * fully opaque, the lines around it fade out with distance, and the list
 * auto-scrolls so the active line stays vertically centered. Tapping a
 * line seeks playback to that line, same as the reference.
 */
export default function LyricsView({ videoId }: { videoId: string }) {
  const { data, isLoading } = useSWR<LyricsResponse>(`/api/lyrics/${videoId}`, fetcher);
  const progress = usePlayerStore((s) => s.progress);
  const seek = usePlayerStore((s) => s.seek);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  const lines = data?.lines ?? [];
  const synced = data?.synced && lines.some((l) => l.time != null);

  const currentIdx = useMemo(() => {
    if (!synced) return -1;
    let idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i].time ?? 0) <= progress) idx = i;
      else break;
    }
    return idx;
  }, [progress, lines, synced]);

  useEffect(() => {
    if (currentIdx >= 0) setActiveIndex(currentIdx);
  }, [currentIdx]);

  useEffect(() => {
    const el = lineRefs.current[activeIndex];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-base-500">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-base-700 border-t-base-100" />
        <p className="text-sm">Memuat lirik…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 px-8 text-center text-base-500">
        <p className="text-sm">Lirik tidak tersedia untuk lagu ini.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="no-scrollbar h-full overflow-y-auto px-7 py-[40%] text-gradient-fade"
    >
      <div className="flex flex-col gap-6">
        {lines.map((line, i) => {
          const isActive = synced ? i === activeIndex : false;
          const distance = synced ? Math.abs(i - activeIndex) : 1;
          return (
            <button
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              onClick={() => line.time != null && seek(line.time)}
              className={`press block text-left leading-snug transition-all duration-300 ease-smooth ${
                isActive
                  ? "text-[22px] font-bold text-base-50"
                  : distance <= 2
                  ? "text-[19px] font-semibold text-base-400"
                  : "text-[19px] font-semibold text-base-700"
              }`}
            >
              {line.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
