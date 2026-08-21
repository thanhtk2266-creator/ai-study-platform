"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocuments } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Document } from "@/types";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch {
        // Xử lý lỗi
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
          <p className="mt-1 text-gray-600">
            Quản lý tài liệu và lịch sử làm bài
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Tải tài liệu mới
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary-100 p-3">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.length}
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
              <p className="text-2xl font-bold text-gray-900">0</p>
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
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">Điểm TB</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Tài liệu đã upload
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Chưa có tài liệu nào
              </h3>
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
              <Card key={doc.id}>
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
  );
}
