"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { ErrorPanel } from "@/components/common";
import { resolveLocale, type Locale, DEFAULT_LOCALE, getMessages } from "@/lib/i18n";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLocale(resolveLocale(params.get("lang")));
  }, []);

  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  const m = getMessages(locale);

  return (
    <html lang={locale === "en-US" ? "en" : "ja"}>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center p-4">
          <ErrorPanel
            title={m.criticalErrorTitle}
            message={m.criticalErrorMessage}
            digest={error.digest}
            locale={locale}
          >
            <Button onClick={reset} className="mt-6" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              {m.retry}
            </Button>
          </ErrorPanel>
        </div>
      </body>
    </html>
  );
}
