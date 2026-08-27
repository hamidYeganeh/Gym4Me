"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { faqScreenVariants } from "./FaqScreen.styles";
import type { FaqScreenProps } from "./FaqScreen.types";

export function FaqScreen({
  className,
  roleSegment = "athlete",
  items,
  loading,
}: FaqScreenProps) {
  const t = useTranslations("Mobile.Faq");
  const styles = faqScreenVariants();
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.push(`/${roleSegment}/profile/help`)}
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            className={styles.empty()}
            illustration={EMPTY_STATE_ILLUSTRATIONS.search}
            illustrationAlt=""
            layout="media"
            title={t("empty")}
          />
        ) : (
          <div className={styles.list()}>
            {items.map((item) => (
              <article className={styles.item()} key={item.id}>
                <Typography
                  className={styles.question()}
                  type="body"
                  weight="semibold"
                >
                  {item.question}
                </Typography>
                <Typography className={styles.answer()} type="body-sm">
                  {item.answer}
                </Typography>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
