import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface ResultCardProps {
  question: Question;
  userAnswer: string;
  questionNumber: number;
}

const optionLabels = ["A", "B", "C", "D"] as const;

export function ResultCard({
  question,
  userAnswer,
  questionNumber,
}: ResultCardProps) {
  const isCorrect = userAnswer === question.correct_answer;

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-6",
        isCorrect ? "border-success-500/30 bg-success-50/30" : "border-danger-500/30 bg-danger-50/30"
      )}
    >
      {/* Header: số câu + đúng/sai */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          Câu {questionNumber}
        </span>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            isCorrect
              ? "bg-success-500/10 text-success-600"
              : "bg-danger-500/10 text-danger-600"
          )}
        >
          {isCorrect ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" /> Đúng
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" /> Sai
            </>
          )}
        </div>
      </div>

      {/* Câu hỏi */}
      <h3 className="mb-4 font-semibold text-gray-900">
        {question.question_text}
      </h3>

      {/* Các đáp án với color coding */}
      <div className="mb-4 space-y-2">
        {optionLabels.map((label) => {
          const isUserAnswer = userAnswer === label;
          const isCorrectAnswer = question.correct_answer === label;

          return (
            <div
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-sm",
                isCorrectAnswer
                  ? "border-success-500 bg-success-50 font-medium text-success-800"
                  : isUserAnswer
                  ? "border-danger-500 bg-danger-50 text-danger-800"
                  : "border-gray-200 bg-white text-gray-600"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isCorrectAnswer
                    ? "bg-success-500 text-white"
                    : isUserAnswer
                    ? "bg-danger-500 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {label}
              </span>
              <span className="flex-1">{question.options[label]}</span>
              {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-success-500" />}
              {isUserAnswer && !isCorrectAnswer && (
                <XCircle className="h-4 w-4 text-danger-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Giải thích */}
      {question.explanation && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
          <p className="mb-1 text-xs font-semibold uppercase text-primary-600">
            Giải thích
          </p>
          <p className="text-sm text-primary-900">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
