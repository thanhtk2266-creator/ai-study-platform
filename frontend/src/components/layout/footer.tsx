import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-gray-500">
            <Brain className="h-5 w-5" />
            <span className="text-sm">
              AI Study Platform © {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Được xây dựng với ❤️ và AI
          </p>
        </div>
      </div>
    </footer>
  );
}
