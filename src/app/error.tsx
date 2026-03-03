"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/ErrorPanel";
import { resolveLocale, DEFAULT_LOCALE } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function ErrorContent({ error, reset }: ErrorProps) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const m = getMessages(locale);

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <ErrorPanel
        title={m.genericErrorTitle}
        message={m.unexpectedErrorMessage}
        digest={error.digest}
        locale={locale}
      >
        <Button onClick={reset} className="mt-6" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          {m.retry}
        </Button>
      </ErrorPanel>
    </div>
  );
}

function ErrorFallback({ error, reset }: ErrorProps) {
  const m = getMessages(DEFAULT_LOCALE);

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <ErrorPanel
        title={m.genericErrorTitle}
        message={m.unexpectedErrorMessage}
        digest={error.digest}
      >
        <Button onClick={reset} className="mt-6" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          {m.retry}
        </Button>
      </ErrorPanel>
    </div>
  );
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <Suspense fallback={<ErrorFallback error={error} reset={reset} />}>
      <ErrorContent error={error} reset={reset} />
    </Suspense>
  );
}
