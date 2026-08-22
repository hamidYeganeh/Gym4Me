"use client";

import { useEffect } from "react";
import type { ApiClient, ApiNotice } from "@repo/api/client";
import { toastNotice } from "@repo/ui/kit/Toast";
import { useLocale, useTranslations } from "next-intl";

type Translate = {
  (key: string, values?: Record<string, string | number>): string;
  has?: (key: string) => boolean;
};

function translateNotice(
  t: Translate,
  locale: string,
  messageKey: string,
  params?: ApiNotice["params"],
  sourceText?: string,
) {
  if (!locale.startsWith("fa") && sourceText) {
    return sourceText;
  }

  const hasKey = (key: string) =>
    typeof t.has === "function" ? t.has(key) : true;

  const resolvedParams =
    params?.entity && typeof params.entity === "string"
      ? {
          ...params,
          entity: hasKey(`entities.${params.entity}`)
            ? t(`entities.${params.entity}`)
            : t("entities.item"),
        }
      : params;

  if (!hasKey(messageKey)) {
    return t("errors.generic");
  }
  return t(messageKey, resolvedParams);
}

function ApiNoticeCopy({
  messageKey,
  params,
  sourceText,
}: {
  messageKey: string;
  params?: ApiNotice["params"];
  sourceText?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("Api") as unknown as Translate;
  return translateNotice(t, locale, messageKey, params, sourceText);
}

export function ApiToastBridge({ client }: { client: ApiClient }) {
  const locale = useLocale();
  const t = useTranslations("Api") as unknown as Translate;

  useEffect(() => {
    client.setLocale(locale);
    client.setMessageResolver((messageKey) =>
      translateNotice(t, locale, messageKey),
    );
    const unsubscribe = client.subscribeNotices((notice: ApiNotice) => {
      toastNotice(
        notice.variant,
        <ApiNoticeCopy messageKey={`titles.${notice.variant}`} />,
        {
          description: (
            <ApiNoticeCopy
              messageKey={notice.messageKey}
              params={notice.params}
              sourceText={notice.sourceText}
            />
          ),
        },
      );
    });
    return () => {
      unsubscribe();
      client.setMessageResolver(undefined);
    };
  }, [client, locale, t]);

  return null;
}
