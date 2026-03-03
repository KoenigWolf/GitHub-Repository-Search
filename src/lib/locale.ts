export type Locale = "ja-JP" | "en-US";

export const DEFAULT_LOCALE: Locale = "ja-JP";

const DEFAULT_DATE_FORMAT = {
  year: "numeric",
  month: "short",
  day: "numeric",
} as const;

const DEFAULT_NUMBER_FORMAT = {
  notation: "compact",
  compactDisplay: "short",
} as const;

export const LOCALE_CONFIG = {
  "ja-JP": {
    dateFormat: DEFAULT_DATE_FORMAT,
    numberFormat: DEFAULT_NUMBER_FORMAT,
  },
  "en-US": {
    dateFormat: DEFAULT_DATE_FORMAT,
    numberFormat: DEFAULT_NUMBER_FORMAT,
  },
} as const;

export function getLocaleConfig(locale: Locale = DEFAULT_LOCALE) {
  return LOCALE_CONFIG[locale];
}

export function resolveLocale(value?: string | null): Locale {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const normalized = value.toLowerCase();
  if (normalized.startsWith("en")) {
    return "en-US";
  }

  return "ja-JP";
}

export function toLangParam(locale: Locale): "ja" | "en" {
  return locale === "en-US" ? "en" : "ja";
}
