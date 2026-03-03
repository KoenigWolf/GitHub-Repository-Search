"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <div className="flex min-h-screen items-center justify-center p-4">
          <ErrorPanel
            title="重大なエラーが発生しました"
            message="アプリケーションで予期しないエラーが発生しました。時間をおいて再度お試しください。"
            digest={error.digest}
          >
            <Button onClick={reset} className="mt-6" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              再試行
            </Button>
          </ErrorPanel>
        </div>
      </body>
    </html>
  );
}
