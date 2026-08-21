"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { ResultCard } from "@/components/quiz/result-card";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getQuizResults } from "@/lib/api";
import { formatScore } from "@/lib/utils";
import type { QuizResult } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const data = await getQuizResults(quizId);
        setResult(data);
      } catch {
        // Xử lý lỗi
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [quizId]);

  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  } else if (!result) {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">Không tìm thấy kết quả</p>
      </div>
    );
  } else {
    const { attempt, questions, user_answers } = result;
    const scorePercentage = (attempt.correct_count / attempt.total_questions) * 100;
    const scoreColor =
      scorePercentage >= 80
        ? "success"
        : scorePercentage >= 50
        ? "warning"
        : "danger";

    content = (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Score Summary */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Trophy className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kết quả bài thi</h1>

            <div className="mt-6">
              <p className="text-5xl font-extrabold text-gray-900">
                {attempt.correct_count}
                <span className="text-2xl font-normal text-gray-400">
                  /{attempt.total_questions}
                </span>
              </p>
              <p className="mt-1 text-lg text-gray-500">
                {formatScore(attempt.correct_count, attempt.total_questions)} đúng
              </p>
            </div>

            <div className="mx-auto mt-6 max-w-xs">
              <Progress
                value={scorePercentage}
                color={scoreColor}
                showLabel
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mb-8 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="gap-2"
        >
          <Home className="h-4 w-4" /> Dashboard
        </Button>
        <Button
          onClick={() => router.push("/upload")}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" /> Làm bài mới
        </Button>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Chi tiết từng câu</h2>
        {questions.map((question, index) => (
          <ResultCard
            key={question.id}
            question={question}
            userAnswer={user_answers[question.id] || ""}
            questionNumber={index + 1}
          />
        ))}
      </div>
      </div>
    );
  }

  return <AuthGuard>{content}</AuthGuard>;
}
