"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Send, Timer, AlertCircle } from "lucide-react";
import { QuestionCard } from "@/components/quiz/question-card";
import { AuthGuard } from "@/components/auth/auth-guard";
import { QuizProgress } from "@/components/quiz/quiz-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getQuiz, submitQuiz } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Quiz } from "@/types";

/** Format giây thành mm:ss */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Đồng hồ đếm thời gian làm bài
  useEffect(() => {
    if (!quiz || submitting) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [quiz, submitting]);

  // Fetch quiz data
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const data = await getQuiz(quizId);
        setQuiz(data);
      } catch {
        setError("Không thể tải bài thi. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  const handleSelectAnswer = (answer: string) => {
    if (!quiz) return;
    const questionId = quiz.questions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setConfirmSubmit(false);

    try {
      await submitQuiz(quizId, answers);
      router.push(`/quiz/${quizId}/results`);
    } catch {
      setError("Có lỗi khi nộp bài. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  const requestSubmit = () => {
    const unanswered = quiz ? quiz.questions.length - Object.keys(answers).length : 0;
    if (unanswered > 0) {
      setConfirmSubmit(true);
    } else {
      handleSubmit();
    }
  };

  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-gray-600">Đang tải bài thi...</p>
        </div>
      </div>
    );
  } else if (error || !quiz) {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-danger-600">{error || "Không tìm thấy bài thi"}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard")}
            >
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    const currentQuestion = quiz.questions[currentIndex];
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === quiz.questions.length - 1;
    const answeredCount = Object.keys(answers).length;

    content = (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Quiz Header + Timer */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <div
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums",
              elapsed > 20 * 60
                ? "bg-danger-50 text-danger-600"
                : "bg-primary-50 text-primary-700"
            )}
            aria-label="Thời gian đã làm"
          >
            <Timer className="h-4 w-4" />
            {formatTime(elapsed)}
          </div>
        </div>
        <div className="mt-3">
          <QuizProgress
            current={currentIndex + 1}
            total={quiz.questions.length}
          />
        </div>
      </div>

      {/* Bảng điều hướng nhanh */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-8 w-8 rounded-lg text-xs font-semibold transition-colors",
              i === currentIndex
                ? "bg-primary-600 text-white"
                : answers[q.id]
                ? "bg-success-100 text-success-700 hover:bg-success-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
            aria-label={`Câu ${i + 1}${answers[q.id] ? " (đã trả lời)" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <Card>
        <CardContent className="pt-6">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedAnswer={answers[currentQuestion.id] || null}
            onSelectAnswer={handleSelectAnswer}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirstQuestion}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Câu trước
        </Button>

        <span className="text-sm text-gray-500">
          Đã trả lời: {answeredCount}/{quiz.questions.length}
        </span>

        {isLastQuestion ? (
          <Button
            onClick={requestSubmit}
            isLoading={submitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" /> Nộp bài
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="gap-2"
          >
            Câu tiếp <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Xác nhận nộp bài khi còn câu bỏ trống */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-warning-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bạn còn câu chưa trả lời
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Bạn đã trả lời {answeredCount}/{quiz.questions.length} câu.
                    Các câu bỏ trống sẽ bị tính là sai. Nộp bài bây giờ?
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
                  Làm tiếp
                </Button>
                <Button onClick={handleSubmit} isLoading={submitting}>
                  Nộp bài
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    );
  }

  return <AuthGuard>{content}</AuthGuard>;
}
