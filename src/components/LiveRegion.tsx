"use client";

import { useEffect, useRef, useState } from "react";

interface LiveRegionProps {
  message: string;
  /** アナウンスの優先度: polite = 現在の読み上げ後、assertive = 即座に割り込み */
  priority?: "polite" | "assertive";
  /** アナウンス後にメッセージをクリアするまでの時間(ms) */
  clearAfter?: number;
}

/**
 * スクリーンリーダー用のライブリージョン
 *
 * 動的なコンテンツ変更をスクリーンリーダーにアナウンス
 * WCAG 2.1 準拠のアクセシビリティ機能
 */
export function LiveRegion({
  message,
  priority = "polite",
  clearAfter = 1000,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (message) {
      // 既存のタイムアウトをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // メッセージを設定
      setAnnouncement(message);

      // 一定時間後にクリア
      timeoutRef.current = setTimeout(() => {
        setAnnouncement("");
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

/**
 * 検索結果のアナウンス用フック
 */
export function useSearchAnnouncement() {
  const [announcement, setAnnouncement] = useState("");

  const announceResults = (count: number, query: string) => {
    if (count === 0) {
      setAnnouncement(`「${query}」に一致するリポジトリは見つかりませんでした`);
    } else if (count === 1) {
      setAnnouncement(`「${query}」の検索結果: 1件`);
    } else {
      setAnnouncement(`「${query}」の検索結果: ${count}件`);
    }
  };

  const announceError = (message: string) => {
    setAnnouncement(`エラー: ${message}`);
  };

  const announceLoading = () => {
    setAnnouncement("検索中...");
  };

  return {
    announcement,
    announceResults,
    announceError,
    announceLoading,
  };
}
