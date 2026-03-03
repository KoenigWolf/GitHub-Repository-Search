import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getLocale, getLocaleConfig, type Locale } from "./locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formInputBase =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function formatNumber(num: number, locale?: Locale): string {
  const targetLocale = locale ?? getLocale();

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
  const targetLocale = locale ?? getLocale();
  const config = getLocaleConfig(targetLocale);

  let formatter = dateFormatterCache.get(targetLocale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(targetLocale, config.dateFormat);
    dateFormatterCache.set(targetLocale, formatter);
  }

  return formatter.format(new Date(dateString));
}
