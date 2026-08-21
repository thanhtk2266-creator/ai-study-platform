"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { QuestionCard } from "@/components/quiz/question-card";
import { AuthGuard } from "@/components/auth/auth-guard";
import { QuizProgress } from "@/components/quiz/quiz-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getQuiz, submitQuiz } from "@/lib/api";
import type { Quiz } from "@/types";

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

    try {
      await submitQuiz(quizId, answers);
      router.push(`/quiz/${quizId}/results`);
    } catch {
      setError("Có lỗi khi nộp bài. Vui lòng thử lại.");
      setSubmitting(false);
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
      {/* Quiz Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
        <div className="mt-3">
          <QuizProgress
            current={currentIndex + 1}
            total={quiz.questions.length}
          />
        </div>
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
            onClick={handleSubmit}
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
      </div>
    );
  }

  return <AuthGuard>{content}</AuthGuard>;
}
