"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { clearToken, isAuthenticated } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/upload", label: "Tải tài liệu" },
  { href: "/dashboard", label: "Bảng điều khiển" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">AI Study</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {link.label}
            </Link>
          ))}
          {authed ? (
            <button
              onClick={() => {
                clearToken();
                setAuthed(false);
                window.location.href = "/login";
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Đăng xuất
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Đăng nhập
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="flex flex-col p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {link.label}
              </Link>
            ))}
            {authed ? (
              <button
                onClick={() => {
                  clearToken();
                  setAuthed(false);
                  window.location.href = "/login";
                }}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
