import { DEFAULT_LOCALE, getLocaleConfig, type Locale } from "@/lib/i18n";

export function formatNumber(num: number, locale?: Locale): string {
  const targetLocale = locale ?? DEFAULT_LOCALE;

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toLocaleString(targetLocale);
}

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

export function formatDate(dateString: string, locale?: Locale): string {
  const targetLocale = locale ?? DEFAULT_LOCALE;
  const config = getLocaleConfig(targetLocale);

  let formatter = dateFormatterCache.get(targetLocale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(targetLocale, config.dateFormat);
    dateFormatterCache.set(targetLocale, formatter);
  }

  return formatter.format(new Date(dateString));
}
