"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Search as SearchIcon, X } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { usePlayerStore } from "@/store/player";
import type { SearchResults } from "@/types";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const playTrack = usePlayerStore((s) => s.playTrack);

  const { data, isLoading } = useSWR<SearchResults>(
    query ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  function submit() {
    setQuery(input.trim());
  }

  return (
    <div className="animate-fade-in px-5 pt-4">
      <h1 className="mb-4 text-[19px] font-bold text-base-50">Cari</h1>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-base-850 px-4 py-3">
        <SearchIcon size={18} className="shrink-0 text-base-500" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Cari lagu, artis, atau album"
          className="w-full bg-transparent text-[14.5px] text-base-50 placeholder-base-500 outline-none"
        />
        {input && (
          <button
            onClick={() => {
              setInput("");
              setQuery("");
            }}
            className="press text-base-500"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-1.5">
              <div className="h-12 w-12 animate-pulse rounded-xl bg-base-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 animate-pulse rounded bg-base-800" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-base-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && query && data?.songs.length === 0 && (
        <p className="mt-10 text-center text-sm text-base-500">
          Tidak ada hasil untuk &ldquo;{query}&rdquo;.
        </p>
      )}

      {!isLoading && data && data.songs.length > 0 && (
        <div className="space-y-1 pb-4">
          {data.songs.map((track) => (
            <button
              key={track.videoId}
              onClick={() => playTrack(track, data.songs)}
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

      {!query && (
        <p className="mt-10 text-center text-sm text-base-600">
          Ketik judul lagu, nama artis, atau album lalu tekan Enter.
        </p>
      )}
    </div>
  );
}
