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

let currentLocale: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function getLocaleConfig(locale?: Locale) {
  const targetLocale = locale ?? currentLocale;
  return LOCALE_CONFIG[targetLocale];
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
