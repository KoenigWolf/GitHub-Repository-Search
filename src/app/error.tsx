"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/ErrorPanel";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <ErrorPanel
        title="エラーが発生しました"
        message="予期しないエラーが発生しました。時間をおいて再度お試しください。"
        digest={error.digest}
      >
        <Button onClick={reset} className="mt-6" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          再試行
        </Button>
      </ErrorPanel>
    </div>
  );
}
