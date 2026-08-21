"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, Layers, CheckCircle, Loader2, Info } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateQuiz, generateFlashcardDeck, getDocument } from "@/lib/api";
import type { Document } from "@/types";

type UploadState = "idle" | "uploaded" | "generating";

/** Poll trạng thái tài liệu đến khi ready (AI cần thời gian xử lý xong mới tạo đề được) */
function useDocumentStatus(initial: Document | null) {
  const [document, setDocument] = useState<Document | null>(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDocument(initial);
  }, [initial]);

  useEffect(() => {
    if (!document || document.status !== "processing") return;

    const poll = async () => {
      try {
        const updated = await getDocument(document.id);
        setDocument(updated);
        if (updated.status === "processing") {
          timerRef.current = setTimeout(poll, 2000);
        }
      } catch {
        timerRef.current = setTimeout(poll, 3000);
      }
    };
    timerRef.current = setTimeout(poll, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [document]);

  return document;
}

export default function UploadPage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const document = useDocumentStatus(uploadedDoc);

  const handleUploadComplete = (doc: Document) => {
    setUploadedDoc(doc);
    setState("uploaded");
  };

  const handleGenerateQuiz = async () => {
    if (!document) return;

    setState("generating");
    setError(null);

    try {
      const quiz = await generateQuiz(document.id, numQuestions);
      router.push(`/quiz/${quiz.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi khi tạo đề thi. Vui lòng thử lại."
      );
      setState("uploaded");
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!document) return;

    setState("generating");
    setError(null);

    try {
      const deck = await generateFlashcardDeck(document.id, 15);
      router.push(`/flashcards/${deck.id}`);
    } catch {
      setError("Có lỗi khi tạo flashcard. Vui lòng thử lại.");
      setState("uploaded");
    }
  };

  const isProcessing = document?.status === "processing";
  const isError = document?.status === "error";
  const isGenerating = state === "generating";

  return (
    <AuthGuard>
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Tải lên tài liệu</h1>
        <p className="mt-2 text-gray-600">
          Upload file PDF hoặc PowerPoint, AI sẽ phân tích và tạo câu hỏi cho
          bạn
        </p>
      </div>

      {/* Gợi ý định dạng để AI đọc được nội dung */}
      {state === "idle" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-sky-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div className="text-sm text-sky-900">
            <p className="font-medium">Mẹo để AI tạo câu hỏi chất lượng:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-sky-800">
              <li>Dùng file PDF chứa chữ (scan ảnh không đọc được) hoặc file PPTX</li>
              <li>Nội dung tiếng Anh càng nhiều, câu hỏi càng chất lượng</li>
              <li>Sau khi upload, đợi trạng thái "Sẵn sàng" rồi mới tạo đề</li>
            </ul>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {state === "idle" && (
        <FileDropzone onUploadComplete={handleUploadComplete} />
      )}

      {/* Document uploaded - Cấu hình tạo quiz */}
      {state !== "idle" && document && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Tài liệu đã tải lên
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Thông tin file */}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-medium text-gray-900">{document.filename}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-warning-600" />
                    <span className="text-warning-600">
                      AI đang phân tích tài liệu... (thường mất 5–15 giây)
                    </span>
                  </>
                ) : isError ? (
                  <span className="font-medium text-danger-600">
                    Xử lý lỗi — file có thể là bản scan ảnh, hãy thử file khác
                  </span>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-success-600" />
                    <span className="font-medium text-success-600">Sẵn sàng</span>
                    {document.chunk_count > 0 && (
                      <span className="text-gray-500">
                        · {document.chunk_count} đoạn nội dung đã phân tích
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Chọn số câu hỏi */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Số câu hỏi
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    disabled={isProcessing || isError}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                      numQuestions === num
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {num} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-600">
                {error}
              </div>
            )}

            {/* Nút hành động */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerateQuiz}
                isLoading={isGenerating}
                disabled={isProcessing || isError}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating
                  ? "AI đang tạo đề thi..."
                  : isProcessing
                  ? "Đang chờ tài liệu sẵn sàng..."
                  : "Tạo đề thi"}
              </Button>
              <Button
                onClick={handleGenerateFlashcards}
                disabled={isGenerating || isProcessing || isError}
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <Layers className="h-4 w-4" />
                Tạo flashcard từ vựng từ tài liệu này
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </AuthGuard>
  );
}
