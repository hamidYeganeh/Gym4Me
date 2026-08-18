import { defaultLocale, pickMessages } from "@repo/i18n";
import { getRequestConfig } from "next-intl/server";

const WEBSITE_MESSAGE_KEYS = [
  "Metadata",
  "MarketingLanding",
  "Articles",
  "AthleteHome",
] as const;

export default getRequestConfig(async () => {
  const locale = defaultLocale;

  return {
    locale,
    messages: pickMessages(locale, WEBSITE_MESSAGE_KEYS),
  };
});
