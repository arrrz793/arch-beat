import type { Track } from "@/types";
import TrendingCard from "./TrendingCard";
import TrackTile from "./TrackTile";

export default function HomeSectionBlock({
  title,
  items,
  variant,
}: {
  title: string;
  items: Track[];
  variant: "trending" | "grid";
}) {
  if (items.length === 0) return null;

  if (variant === "trending") {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-[17px] font-bold text-base-50">{title}</h2>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
          {items.map((t) => (
            <TrendingCard key={t.videoId} track={t} queue={items} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-5 pb-2">
        <h2 className="text-[17px] font-bold text-base-50">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 px-3">
        {items.map((t) => (
          <TrackTile key={t.videoId} track={t} queue={items} />
        ))}
      </div>
    </section>
  );
}
