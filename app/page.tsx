"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import TopBar from "@/components/shared/TopBar";
import MoodChips from "@/components/home/MoodChips";
import HomeSectionBlock from "@/components/home/HomeSectionBlock";
import type { HomeSection, Track } from "@/types";

export default function HomePage() {
  const [mood, setMood] = useState<string | null>(null);

  const { data, isLoading } = useSWR<{ sections: HomeSection[] }>("/api/home", fetcher, {
    revalidateOnFocus: false,
  });

  const { data: moodData, isLoading: moodLoading } = useSWR<{ songs: Track[] }>(
    mood ? `/api/search?q=${encodeURIComponent(mood + " indonesia")}` : null,
    fetcher
  );

  const sections = data?.sections ?? [];

  return (
    <div className="animate-fade-in">
      <TopBar />
      <MoodChips active={mood} onSelect={setMood} />

      {mood ? (
        <div className="min-h-[40vh]">
          {moodLoading ? (
            <SkeletonGrid />
          ) : (
            <HomeSectionBlock
              title={`Pilihan untuk ${mood}`}
              items={moodData?.songs ?? []}
              variant="grid"
            />
          )}
        </div>
      ) : isLoading ? (
        <div className="space-y-6">
          <SkeletonTrending />
          <SkeletonGrid />
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-8 py-16 text-center text-base-500">
          <p className="text-sm">
            Tidak dapat memuat beranda. Periksa koneksi atau coba lagi nanti.
          </p>
        </div>
      ) : (
        sections.map((section, i) => (
          <HomeSectionBlock
            key={section.title}
            title={section.title}
            items={section.items as Track[]}
            variant={i === 0 ? "trending" : "grid"}
          />
        ))
      )}
    </div>
  );
}

function SkeletonTrending() {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-square w-[168px] shrink-0 animate-pulse rounded-3xl bg-base-800" />
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 px-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-base-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-base-800" />
            <div className="h-2.5 w-2/3 animate-pulse rounded bg-base-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
