"use client";

import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
}

const optionLabels = ["A", "B", "C", "D"] as const;

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      {/* Câu hỏi */}
      <div>
        <span className="text-sm font-medium text-primary-600">
          Câu {questionNumber}
        </span>
        <h2 className="mt-1 text-lg font-semibold text-gray-900">
          {question.question_text}
        </h2>
      </div>

      {/* Các lựa chọn */}
      <div className="space-y-3">
        {optionLabels.map((label) => {
          const optionText = question.options[label];
          const isSelected = selectedAnswer === label;

          return (
            <button
              key={label}
              onClick={() => onSelectAnswer(label)}
              className={cn(
                "flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                isSelected
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                  : "border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  isSelected
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "pt-1 text-sm",
                  isSelected ? "font-medium text-primary-900" : "text-gray-700"
                )}
              >
                {optionText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
