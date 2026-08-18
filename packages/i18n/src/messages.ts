import type { Locale } from "./config";
import fa from "../messages/fa.json";

const messagesByLocale = {
  fa,
} as const satisfies Record<Locale, typeof fa>;

export type Messages = (typeof messagesByLocale)[Locale];

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale];
}

export function pickMessages<K extends keyof Messages>(
  locale: Locale,
  keys: readonly K[],
): Pick<Messages, K> {
  const all = getMessages(locale);
  const picked = {} as Pick<Messages, K>;
  for (const key of keys) {
    picked[key] = all[key];
  }
  return picked;
}

export function omitMessages<K extends keyof Messages>(
  locale: Locale,
  keys: readonly K[],
): Omit<Messages, K> {
  const all = { ...getMessages(locale) };
  for (const key of keys) {
    delete all[key];
  }
  return all as Omit<Messages, K>;
}
