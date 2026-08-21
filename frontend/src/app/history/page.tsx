"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, ArrowLeft, Search } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card, CardContent } from "@/components/ui/card";
import { getMyAttempts } from "@/lib/api";
import { formatDate, formatScore } from "@/lib/utils";
import type { RecentAttempt } from "@/types";

function scoreBadgeClass(correct: number, total: number): string {
  const pct = total > 0 ? (correct / total) * 100 : 0;
  if (pct >= 80) return "bg-success-50 text-success-600";
  if (pct >= 50) return "bg-warning-50 text-warning-600";
  return "bg-danger-50 text-danger-600";
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<RecentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const data = await getMyAttempts();
        setAttempts(data);
      } catch {
        // Xử lý lỗi
      } finally {
        setLoading(false);
      }
    }
    fetchAttempts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return attempts;
    return attempts.filter(
      (a) =>
        a.quiz_title.toLowerCase().includes(q) ||
        (a.document_name || "").toLowerCase().includes(q)
    );
  }, [attempts, search]);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <HistoryIcon className="h-8 w-8 text-primary-600" />
              Lịch sử bài làm
            </h1>
            <p className="mt-1 text-gray-600">
              Toàn bộ các bài thi bạn đã hoàn thành
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" /> Về bảng điều khiển
          </Link>
        </div>

        {/* Tìm kiếm */}
        {attempts.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên bài hoặc tài liệu..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HistoryIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {attempts.length === 0
                  ? "Chưa có bài làm nào"
                  : "Không tìm thấy bài làm phù hợp"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {attempts.length === 0
                  ? "Hãy upload tài liệu và làm bài đầu tiên của bạn"
                  : "Thử từ khóa khác"}
              </p>
              {attempts.length === 0 && (
                <Link
                  href="/upload"
                  className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Bắt đầu luyện tập
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((attempt) => (
              <Card key={attempt.attempt_id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {attempt.quiz_title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {attempt.document_name || "Không có tên tài liệu"} ·{" "}
                      {formatDate(attempt.submitted_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {attempt.correct_count}/{attempt.total_questions} câu đúng
                      </p>
                      <p className="text-xs text-gray-400">
                        {attempt.score.toFixed(1)}/10 điểm
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreBadgeClass(
                        attempt.correct_count,
                        attempt.total_questions
                      )}`}
                    >
                      {formatScore(attempt.correct_count, attempt.total_questions)}
                    </span>
                    <Link
                      href={`/quiz/${attempt.quiz_id}/results`}
                      className="rounded-lg border border-primary-300 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
                    >
                      Xem lại
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
