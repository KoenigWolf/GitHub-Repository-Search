"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { ErrorPanel } from "@/components/ErrorPanel";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ja">
      <body className="min-h-screen bg-background">
        <div
          role="alert"
          className="flex min-h-screen items-center justify-center p-4"
        >
          <ErrorPanel
            title="重大なエラーが発生しました"
            message={
              error.message ||
              "アプリケーションで予期しないエラーが発生しました。"
            }
            digest={error.digest}
          >
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              再試行
            </button>
          </ErrorPanel>
        </div>
      </body>
    </html>
  );
}
