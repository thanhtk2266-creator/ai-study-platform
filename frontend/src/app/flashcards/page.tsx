"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Plus, Trash2, GraduationCap, Sparkles } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteFlashcardDeck,
  generateFlashcardDeck,
  getDocuments,
  getFlashcardDecks,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Document, FlashcardDeckSummary } from "@/types";

export default function FlashcardsPage() {
  const router = useRouter();

  const [decks, setDecks] = useState<FlashcardDeckSummary[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái form tạo deck mới
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [numCards, setNumCards] = useState(15);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [deckData, docData] = await Promise.all([
          getFlashcardDecks(),
          getDocuments(),
        ]);
        setDecks(deckData);
        setDocuments(docData);
        const firstReady = docData.find((d) => d.status === "ready");
        if (firstReady) setSelectedDocId(firstReady.id);
      } catch {
        // Xử lý lỗi
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const readyDocuments = documents.filter((d) => d.status === "ready");

  const handleCreateDeck = async () => {
    if (!selectedDocId) {
      setError("Vui lòng chọn một tài liệu đã xử lý xong");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const deck = await generateFlashcardDeck(selectedDocId, numCards);
      router.push(`/flashcards/${deck.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? "AI không thể trích từ vựng từ tài liệu này. Vui lòng thử lại."
          : "Có lỗi khi tạo bộ flashcard."
      );
      setCreating(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteFlashcardDeck(deckId);
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
    } catch {
      // Xử lý lỗi
    }
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <Layers className="h-8 w-8 text-primary-600" />
              Flashcard từ vựng
            </h1>
            <p className="mt-1 text-gray-600">
              Học từ vựng AI trích xuất từ tài liệu của bạn
            </p>
          </div>
          <Button
            onClick={() => setShowCreate((s) => !s)}
            className="gap-2"
            disabled={readyDocuments.length === 0}
          >
            <Plus className="h-4 w-4" /> Tạo bộ mới
          </Button>
        </div>

        {/* Form tạo deck mới */}
        {showCreate && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary-600" />
                Tạo bộ flashcard từ tài liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {readyDocuments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Chưa có tài liệu nào sẵn sàng. Hãy{" "}
                  <Link href="/upload" className="font-medium text-primary-600">
                    tải lên tài liệu
                  </Link>{" "}
                  trước.
                </p>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Chọn tài liệu
                    </label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {readyDocuments.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Số thẻ từ vựng
                    </label>
                    <div className="flex gap-2">
                      {[10, 15, 20, 30].map((num) => (
                        <button
                          key={num}
                          onClick={() => setNumCards(num)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            numCards === num
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {num} từ
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-600">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleCreateDeck}
                    isLoading={creating}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    {creating ? "AI đang trích xuất từ vựng..." : "Tạo flashcard"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Danh sách deck */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : decks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Chưa có bộ flashcard nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tạo bộ đầu tiên từ tài liệu đã upload để bắt đầu học từ vựng
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                className="group relative cursor-pointer transition-shadow hover:shadow-md"
              >
                <div
                  onClick={() => router.push(`/flashcards/${deck.id}`)}
                  className="block"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2 flex items-start gap-3 text-base">
                      <Layers className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                      {deck.title || "Bộ từ vựng"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {deck.card_count} từ
                      </span>
                      <span>{formatDate(deck.created_at)}</span>
                    </div>
                  </CardContent>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDeck(deck.id);
                  }}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-300 opacity-0 transition-all hover:bg-danger-50 hover:text-danger-500 group-hover:opacity-100"
                  aria-label="Xóa bộ flashcard"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
