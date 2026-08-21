"use client";

import { AlertTriangle, Target } from "lucide-react";
import type { CategoryStatItem } from "@/types";

function accuracyColor(accuracy: number): { bar: string; text: string; badge: string } {
  if (accuracy < 50)
    return {
      bar: "bg-danger-500",
      text: "text-danger-600",
      badge: "bg-danger-50 text-danger-600",
    };
  if (accuracy < 75)
    return {
      bar: "bg-warning-500",
      text: "text-warning-600",
      badge: "bg-warning-50 text-warning-600",
    };
  return {
    bar: "bg-success-500",
    text: "text-success-600",
    badge: "bg-success-50 text-success-600",
  };
}

/**
 * Phân tích điểm yếu theo dạng câu hỏi.
 * Danh sách đã được backend sắp xếp accuracy tăng dần (yếu nhất lên đầu).
 */
export function CategoryStats({ stats }: { stats: CategoryStatItem[] }) {
  if (stats.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        Chưa có dữ liệu phân tích — hãy làm vài bài để AI xác định điểm yếu của bạn
      </div>
    );
  }

  const weakest = stats[0];

  return (
    <div className="space-y-5">
      {/* Gợi ý tập trung */}
      <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
        <p className="text-sm text-orange-900">
          Bạn nên tập trung vào{" "}
          <span className="font-semibold">"{weakest.category}"</span> — mới đúng{" "}
          <span className="font-semibold">{weakest.accuracy}%</span> (
          {weakest.correct_count}/{weakest.total_answered} câu).
        </p>
      </div>

      {/* Các thanh thống kê */}
      <div className="space-y-4">
        {stats.map((stat) => {
          const color = accuracyColor(stat.accuracy);
          return (
            <div key={stat.category}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Target className="h-4 w-4 text-gray-400" />
                  {stat.category}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {stat.correct_count}/{stat.total_answered} câu
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color.badge}`}
                  >
                    {stat.accuracy}%
                  </span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color.bar}`}
                  style={{ width: `${Math.max(stat.accuracy, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
