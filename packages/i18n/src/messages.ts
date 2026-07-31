import type { Locale } from "./config";
import fa from "../messages/fa.json";

const messagesByLocale = {
  fa,
} as const satisfies Record<Locale, typeof fa>;

export type Messages = (typeof messagesByLocale)[Locale];

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale];
}
