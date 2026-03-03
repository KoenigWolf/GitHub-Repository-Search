"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchParams {
  q?: string;
  sort?: string;
  page?: number;
  lang?: string;
}

export function useSearchNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (params: SearchParams, preserveExisting = false) => {
      const urlParams = preserveExisting
        ? new URLSearchParams(searchParams.toString())
        : new URLSearchParams();
      const currentLang = searchParams.get("lang");

      if (!preserveExisting && currentLang) {
        urlParams.set("lang", currentLang);
      }

      if (params.q !== undefined) {
        urlParams.set("q", params.q);
      }
      if (params.sort !== undefined) {
        urlParams.set("sort", params.sort);
      }
      if (params.page !== undefined) {
        urlParams.set("page", String(params.page));
      }
      if (params.lang !== undefined) {
        urlParams.set("lang", params.lang);
      }

      router.push(`/search?${urlParams.toString()}`);
    },
    [router, searchParams]
  );

  const getParam = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  return {
    navigate,
    getParam,
    searchParams,
  };
}
