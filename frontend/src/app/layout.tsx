import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jakarta",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "AI Study Platform - Nền tảng ôn thi thông minh",
  description:
    "Upload tài liệu, AI tự động tạo câu hỏi trắc nghiệm để ôn tập. Chấm điểm và giải thích đáp án chi tiết.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${jakarta.variable} ${sora.variable}`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
