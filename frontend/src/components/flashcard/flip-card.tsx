"use client";

import { useState } from "react";
import { RotateCw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/types";

interface FlipCardProps {
  card: Flashcard;
}

/**
 * Thẻ lật: mặt trước là từ + phiên âm IPA,
 * mặt sau là nghĩa, câu ví dụ và từ đồng nghĩa.
 */
export function FlipCard({ card }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const speak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-xl [perspective:1200px]"
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-label={flipped ? "Xem mặt trước" : "Xem mặt sau"}
    >
      <div
        className={cn(
          "relative h-80 w-full cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Mặt trước: từ + IPA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-primary-100 bg-white p-8 shadow-sm [backface-visibility:hidden]">
          <span className="text-4xl font-bold text-gray-900">{card.word}</span>
          {card.ipa && (
            <span className="mt-3 font-mono text-lg text-primary-600">{card.ipa}</span>
          )}
          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak();
              }}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600"
              aria-label="Phát âm từ"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <RotateCw className="h-3.5 w-3.5" /> Nhấn để lật thẻ
            </span>
          </div>
        </div>

        {/* Mặt sau: nghĩa + ví dụ + từ đồng nghĩa */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 p-8 text-white shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-center text-xl font-semibold">{card.meaning}</p>
          {card.example && (
            <p className="mt-4 max-w-md text-center italic text-primary-100">
              "{card.example}"
            </p>
          )}
          {card.synonyms && card.synonyms.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {card.synonyms.map((syn) => (
                <span
                  key={syn}
                  className="rounded-full bg-white/15 px-3 py-1 text-sm"
                >
                  ≈ {syn}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
