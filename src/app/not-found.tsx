"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resolveLocale, toLangParam, DEFAULT_LOCALE } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

function NotFoundContent() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const m = getMessages(locale);
  const lang = toLangParam(locale);
  const href = lang === "en" ? "/search?lang=en" : "/search";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">{m.notFoundTitle}</h2>
      <p className="mt-2 text-muted-foreground">{m.notFoundDescription}</p>
      <Link href={href} className="mt-6">
        <Button>{m.backToSearchPage}</Button>
      </Link>
    </div>
  );
}

function NotFoundFallback() {
  const m = getMessages(DEFAULT_LOCALE);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">{m.notFoundTitle}</h2>
      <p className="mt-2 text-muted-foreground">{m.notFoundDescription}</p>
      <Link href="/search" className="mt-6">
        <Button>{m.backToSearchPage}</Button>
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundFallback />}>
      <NotFoundContent />
    </Suspense>
  );
}
