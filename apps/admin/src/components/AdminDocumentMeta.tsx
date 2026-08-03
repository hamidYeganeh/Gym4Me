import { useEffect } from "react";
import { useTranslations } from "next-intl";

const APP_NAME = "Gym4Me";

function setMeta(selector: string, attribute: string, value: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attribute, value);
  }
}

/** Syncs document title + meta/OG/Twitter from Admin i18n messages. Brand stays Gym4Me. */
export function AdminDocumentMeta() {
  const t = useTranslations("Admin");

  useEffect(() => {
    const metaTitle = t("metaTitle");
    const metaDescription = t("metaDescription");
    const title = `${metaTitle} | ${APP_NAME}`;

    document.title = title;

    setMeta('meta[name="description"]', "content", metaDescription);
    setMeta('meta[name="application-name"]', "content", APP_NAME);
    setMeta('meta[property="og:site_name"]', "content", APP_NAME);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", metaDescription);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", metaDescription);
  }, [t]);

  return null;
}
