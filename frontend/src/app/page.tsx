import Link from "next/link";
import { Upload, Brain, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Upload tài liệu",
    description: "Tải lên PDF hoặc slide bài giảng. Hệ thống tự động phân tích nội dung.",
  },
  {
    icon: Brain,
    title: "AI tạo câu hỏi",
    description: "AI đọc hiểu tài liệu và tự động sinh bộ câu hỏi trắc nghiệm chất lượng.",
  },
  {
    icon: CheckCircle,
    title: "Luyện đề & xem giải thích",
    description: "Làm bài trực tuyến, chấm điểm tự động và xem giải thích đáp án chi tiết.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Ôn thi thông minh
              <span className="block text-primary-600">với AI</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Upload tài liệu bài giảng, AI sẽ tự động tạo bộ câu hỏi trắc
              nghiệm để bạn ôn tập. Chấm điểm tự động và giải thích đáp án chi
              tiết cho từng câu.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/upload">
                <Button size="lg" className="gap-2">
                  Bắt đầu ngay <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Xem Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Quy trình đơn giản, hiệu quả cao
            </h2>
            <p className="mt-3 text-gray-600">
              Chỉ cần 3 bước để bắt đầu ôn thi hiệu quả
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100">
                    <feature.icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
