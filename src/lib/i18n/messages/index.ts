import type { Locale } from "../locale";
import { jaMessages, type MessageKeys } from "./ja";
import { enMessages } from "./en";

const messages: Record<Locale, Record<MessageKeys, string>> = {
  "ja-JP": jaMessages,
  "en-US": enMessages,
};

export function getMessages(locale: Locale): Record<MessageKeys, string> {
  return messages[locale];
}

export type { MessageKeys } from "./ja";
