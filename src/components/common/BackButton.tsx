"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, type Locale, getMessages } from "@/lib/i18n";

interface BackButtonProps {
  fallbackHref?: string;
  children?: React.ReactNode;
  locale?: Locale;
}

function canGoBack(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const referrer = document.referrer;
  if (!referrer) {
    return false;
  }

  try {
    const referrerUrl = new URL(referrer);
    return referrerUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function BackButton({
  fallbackHref = "/search",
  children,
  locale = DEFAULT_LOCALE,
}: BackButtonProps) {
  const router = useRouter();
  const m = getMessages(locale);
  const label = children ?? m.backToSearch;

  const handleClick = () => {
    if (canGoBack()) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      aria-label={m.backToSearchResults}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
