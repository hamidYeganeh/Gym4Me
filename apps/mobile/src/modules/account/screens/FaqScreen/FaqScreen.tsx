"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.push(`/${roleSegment}/profile/help`)}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

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
