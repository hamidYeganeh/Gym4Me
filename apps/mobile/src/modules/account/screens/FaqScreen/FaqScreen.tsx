"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
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
          <Typography className={styles.empty()} type="body">
            {t("empty")}
          </Typography>
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
