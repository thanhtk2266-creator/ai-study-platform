"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateQuiz } from "@/lib/api";
import type { Document } from "@/types";

type UploadState = "idle" | "uploaded" | "generating";

export default function UploadPage() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [document, setDocument] = useState<Document | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (doc: Document) => {
    setDocument(doc);
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
              <p className="text-sm text-gray-500">
                Trạng thái:{" "}
                <span className="font-medium text-success-600">
                  {document.status === "ready" ? "Sẵn sàng" : "Đang xử lý..."}
                </span>
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
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
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

            {/* Nút tạo đề */}
            <Button
              onClick={handleGenerateQuiz}
              isLoading={state === "generating"}
              className="w-full gap-2"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              {state === "generating"
                ? "AI đang tạo đề thi..."
                : "Tạo đề thi"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </AuthGuard>
  );
}
