import Link from "next/link";
import { Upload, Brain, CheckCircle, ArrowRight, Gauge, Shield, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Upload,
    title: "Đưa tài liệu vào hệ thống",
    description: "Tải PDF hoặc PPTX, hệ thống tự trích xuất nội dung và chuẩn hóa dữ liệu.",
  },
  {
    icon: Brain,
    title: "Sinh đề theo mục tiêu",
    description: "Tạo quiz nhanh theo số câu, mức độ, và bám sát nội dung học của bạn.",
  },
  {
    icon: CheckCircle,
    title: "Làm bài và phân tích kết quả",
    description: "Nộp bài, nhận điểm tự động cùng giải thích chi tiết từng câu hỏi.",
  },
];

const highlights = [
  { icon: Gauge, title: "Nhanh", value: "Tạo đề trong vài giây" },
  { icon: Shield, title: "Riêng tư", value: "Dữ liệu theo tài khoản" },
  { icon: Timer, title: "Tập trung", value: "Flow học không gián đoạn" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col pb-16">
      <section className="hero-grid relative overflow-hidden border-b border-blue-100/70">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-blue-300/35 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="fade-up">
              <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                AI Study Platform
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Biến tài liệu học thành
                <span className="block text-blue-600">phòng luyện đề cá nhân</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-600">
                Một biến thể học tập hiện đại: upload nội dung, sinh đề thực chiến,
                theo dõi tiến độ và giữ nhịp học ổn định mỗi ngày.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Tạo tài khoản miễn phí <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button size="lg" variant="outline">
                    Bắt đầu tạo đề
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="glass fade-up border-0" style={{ animationDelay: "0.12s" }}>
              <CardContent className="space-y-4 p-6">
                <p className="text-sm font-semibold text-slate-700">Ưu điểm nổi bật</p>
                {highlights.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-xl bg-white/80 p-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.value}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-slate-900 p-4 text-white">
                  <p className="text-sm text-slate-300">Sẵn sàng vào chế độ học sâu?</p>
                  <p className="mt-1 text-base font-semibold">Thiết kế cho việc luyện đề hằng ngày.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Flow luyện đề 3 bước</h2>
            <p className="mt-2 text-slate-600">
              Tối ưu để học nhanh, nhớ lâu, và tiến bộ đều qua từng ngày.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((feature, index) => (
              <Card key={index} className="glass border-0 text-left fade-up" style={{ animationDelay: `${0.1 * index}s` }}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <feature.icon className="h-6 w-6 text-blue-700" />
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Bước {index + 1}</p>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
