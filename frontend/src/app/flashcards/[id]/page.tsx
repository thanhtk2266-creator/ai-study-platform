"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { FlipCard } from "@/components/flashcard/flip-card";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getFlashcardDeck } from "@/lib/api";
import type { FlashcardDeck } from "@/types";

export default function FlashcardStudyPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchDeck() {
      try {
        const data = await getFlashcardDeck(deckId);
        setDeck(data);
      } catch {
        setDeck(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDeck();
  }, [deckId]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!deck || deck.cards.length === 0) {
    return (
      <AuthGuard>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Không tìm thấy bộ flashcard</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/flashcards")}
            >
              Về danh sách flashcard
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const cards = deck.cards;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === cards.length - 1;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Layers className="h-5 w-5 text-primary-600" />
                {deck.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Thẻ {currentIndex + 1} / {cards.length}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/flashcards")}>
             Thoàn thành
            </Button>
          </div>
          <div className="mt-4">
            <Progress
              value={((currentIndex + 1) / cards.length) * 100}
              color="primary"
            />
          </div>
        </div>

        {/* Thẻ hiện tại — key để reset trạng thái lật khi chuyển thẻ */}
        <FlipCard key={cards[currentIndex].id} card={cards[currentIndex]} />

        {/* Điều hướng */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={isFirst}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Thẻ trước
          </Button>

          {/* Chuyển nhanh đến thẻ bất kỳ */}
          <div className="hidden max-w-md flex-wrap justify-center gap-1.5 sm:flex">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
                  i === currentIndex
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-primary-100"
                }`}
                aria-label={`Đến thẻ ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {isLast ? (
            <Button onClick={() => router.push("/flashcards")} className="gap-2">
              Kết thúc học
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="gap-2"
            >
              Thẻ tiếp <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
