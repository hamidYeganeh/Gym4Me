import { defaultLocale, getMessages } from "@repo/i18n";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = defaultLocale;

  return {
    locale,
    messages: getMessages(locale),
  };
});
