"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackHref?: string;
  children?: React.ReactNode;
}

/**
 * 同じオリジンからの遷移かどうかをチェックする
 */
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
  children = "検索に戻る",
}: BackButtonProps) {
  const router = useRouter();

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
      aria-label="検索結果一覧に戻る"
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}
