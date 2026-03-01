"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface LiveRegionProps {
  message: string;
  priority?: "polite" | "assertive";
  clearAfter?: number;
}

export function LiveRegion({
  message,
  priority = "polite",
  clearAfter = 1000,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState("");
  const [announceKey, setAnnounceKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMessageRef = useRef<string>("");

  useEffect(() => {
    if (message && message !== prevMessageRef.current) {
      setAnnounceKey((prev) => prev + 1);
    }
    prevMessageRef.current = message;
  }, [message]);

  useEffect(() => {
    if (message) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setAnnouncement(message);

      timeoutRef.current = setTimeout(() => {
        setAnnouncement("");
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter, announceKey]);

  return (
    <div
      key={announceKey}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

export function useSearchAnnouncement() {
  const [announcement, setAnnouncement] = useState("");

  const announceResults = useCallback((count: number, query: string) => {
    if (count === 0) {
      setAnnouncement(`「${query}」に一致するリポジトリは見つかりませんでした`);
    } else if (count === 1) {
      setAnnouncement(`「${query}」の検索結果: 1件`);
    } else {
      setAnnouncement(`「${query}」の検索結果: ${count}件`);
    }
  }, []);

  const announceError = useCallback((message: string) => {
    setAnnouncement(`エラー: ${message}`);
  }, []);

  const announceLoading = useCallback(() => {
    setAnnouncement("検索中...");
  }, []);

  return { announcement, announceResults, announceError, announceLoading };
}
