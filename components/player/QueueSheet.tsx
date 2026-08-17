"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripVertical } from "lucide-react";
import { usePlayerStore } from "@/store/player";

export default function QueueSheet({ onClose }: { onClose: () => void }) {
  const { queue, currentIndex, playQueueAt } = usePlayerStore();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="mx-auto flex max-h-[75vh] w-full max-w-[560px] flex-col rounded-t-4xl bg-base-850 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-3">
            <div className="mx-auto h-1 w-10 rounded-full bg-base-600" />
          </div>
          <div className="flex items-center justify-between px-5 pb-3">
            <h3 className="text-base font-semibold text-base-50">
              Antrean · {queue.length} lagu
            </h3>
            <button onClick={onClose} className="press text-base-400">
              <X size={20} />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
            {queue.map((t, i) => (
              <button
                key={`${t.videoId}-${i}`}
                onClick={() => playQueueAt(i)}
                className={`press flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left ${
                  i === currentIndex ? "bg-base-800" : ""
                }`}
              >
                <GripVertical size={16} className="shrink-0 text-base-600" />
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-base-700">
                  {t.thumbnail && (
                    <Image src={t.thumbnail} alt={t.name} fill sizes="44px" className="mono-art object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[13.5px] font-medium ${
                      i === currentIndex ? "text-base-50" : "text-base-200"
                    }`}
                  >
                    {t.name}
                  </p>
                  <p className="truncate text-[12px] text-base-500">{t.artist}</p>
                </div>
                {i === currentIndex && (
                  <span className="flex gap-0.5">
                    <span className="h-3 w-[3px] animate-pulse-soft rounded-full bg-base-100" />
                    <span className="h-3 w-[3px] animate-pulse-soft rounded-full bg-base-100 [animation-delay:0.2s]" />
                    <span className="h-3 w-[3px] animate-pulse-soft rounded-full bg-base-100 [animation-delay:0.4s]" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
