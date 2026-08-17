"use client";

const MOODS = [
  "Bersantai",
  "Tidur",
  "Senang",
  "Sedih",
  "Fokus",
  "Mengisi energi",
  "Olahraga",
  "Perjalanan",
];

export default function MoodChips({
  active,
  onSelect,
}: {
  active: string | null;
  onSelect: (mood: string | null) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
      {MOODS.map((mood) => {
        const isActive = active === mood;
        return (
          <button
            key={mood}
            onClick={() => onSelect(isActive ? null : mood)}
            className={`press shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
              isActive
                ? "border-base-50 bg-base-50 text-base-950"
                : "border-base-700 bg-base-850 text-base-300"
            }`}
          >
            {mood}
          </button>
        );
      })}
    </div>
  );
}
