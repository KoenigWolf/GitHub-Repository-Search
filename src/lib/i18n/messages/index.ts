import type { Locale } from "../locale";
import { jaMessages } from "./ja";
import { enMessages } from "./en";

const messages = {
  "ja-JP": jaMessages,
  "en-US": enMessages,
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}

export type { MessageKeys } from "./ja";
