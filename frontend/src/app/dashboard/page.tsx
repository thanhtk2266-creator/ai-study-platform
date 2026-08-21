"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Clock,
  BookOpen,
  Flame,
  BarChart3,
  TrendingUp,
  PieChart,
  History as HistoryIcon,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { CategoryStats } from "@/components/dashboard/category-stats";
import { getDashboardStats, getDocuments } from "@/lib/api";
import { formatDate, formatScore } from "@/lib/utils";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { DashboardStats, Document } from "@/types";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [docData, statData] = await Promise.all([
          getDocuments(),
          getDashboardStats(),
        ]);
        setDocuments(docData);
        setStats(statData);
      } catch {
        // Xử lý lỗi
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
            <p className="mt-1 text-gray-600">
              Theo dõi tiến độ học tập và phân tích điểm yếu của bạn
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Link href="/flashcards">
              <Button variant="outline" className="gap-2">
                <Layers className="h-4 w-4" /> Học flashcard
              </Button>
            </Link>
            <Link href="/upload">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Tải tài liệu mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary-100 p-3">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_documents ?? documents.length}
                </p>
                <p className="text-sm text-gray-500">Tài liệu</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-success-50 p-3">
                <BookOpen className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_attempts ?? 0}</p>
                <p className="text-sm text-gray-500">Bài đã làm</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-warning-50 p-3">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? `${stats.average_score.toFixed(1)}/10` : "--"}
                </p>
                <p className="text-sm text-gray-500">Điểm TB</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-orange-50 p-3">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.study_streak_days ?? 0}</p>
                <p className="text-sm text-gray-500">Ngày liên tiếp</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-sky-50 p-3">
                <BarChart3 className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.ready_documents ?? 0}</p>
                <p className="text-sm text-gray-500">Sẵn sàng luyện</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ tiến bộ + Phân tích điểm yếu */}
        <div className="mb-8 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                Tiến bộ điểm số
              </CardTitle>
              {stats && stats.score_history.length > 1 && (
                <span className="text-xs text-gray-400">Thang điểm 10</span>
              )}
            </CardHeader>
            <CardContent>
              <ScoreChart data={stats?.score_history ?? []} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-5 w-5 text-primary-600" />
                Phân tích điểm yếu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryStats stats={stats?.category_stats ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* Lịch sử làm bài gần đây */}
        {!loading && stats && stats.recent_attempts.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Lịch sử làm bài gần đây</h2>
              <Link
                href="/history"
                className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <HistoryIcon className="h-4 w-4" /> Xem tất cả
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {stats.recent_attempts.slice(0, 4).map((attempt) => (
                <Card key={attempt.attempt_id} className="transition-shadow hover:shadow-md">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="line-clamp-1 font-semibold text-gray-900">{attempt.quiz_title}</p>
                        <p className="text-sm text-gray-500">
                          {attempt.document_name || "Không có tên tài liệu"}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700">
                        {formatScore(attempt.correct_count, attempt.total_questions)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {attempt.correct_count}/{attempt.total_questions} câu đúng ·{" "}
                        {attempt.score.toFixed(1)}/10
                      </span>
                      <span>{formatDate(attempt.submitted_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Documents List */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Tài liệu đã upload</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có tài liệu nào</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Bắt đầu bằng cách tải lên tài liệu đầu tiên
                </p>
                <Link href="/upload">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" /> Tải lên ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <Card key={doc.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3 text-base">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                      <span className="line-clamp-2">{doc.filename}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          doc.status === "ready"
                            ? "bg-success-50 text-success-600"
                            : doc.status === "processing"
                            ? "bg-warning-50 text-warning-600"
                            : "bg-danger-50 text-danger-600"
                        }`}
                      >
                        {doc.status === "ready"
                          ? "Sẵn sàng"
                          : doc.status === "processing"
                          ? "Đang xử lý"
                          : "Lỗi"}
                      </span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
