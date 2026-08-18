"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { CheckInMethod } from "@/modules/athlete/lib/checkin-history-data";
import { athleteCheckInHistoryScreenVariants } from "./AthleteCheckInHistoryScreen.styles";
import type { AthleteCheckInHistoryScreenProps } from "./AthleteCheckInHistoryScreen.types";

const METHOD_KEY: Record<CheckInMethod, string> = {
  qr: "methodQr",
  barcode: "methodBarcode",
  manual: "methodManual",
};

export function AthleteCheckInHistoryScreen({
  items,
  className,
}: AthleteCheckInHistoryScreenProps) {
  const t = useTranslations("AthleteCheckInHistory");
  const styles = athleteCheckInHistoryScreenVariants();
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
              onPress={() => router.back()}
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

        {items.length === 0 ? (
          <div className={styles.empty()}>
            <Typography type="h4" weight="semibold">
              {t("emptyTitle")}
            </Typography>
            <Typography className={styles.meta()} type="body-sm">
              {t("emptyBody")}
            </Typography>
          </div>
        ) : (
          <div className={styles.list()}>
            {items.map((item) => (
              <article className={styles.card()} key={item.id}>
                <div className={styles.cardTop()}>
                  <Typography
                    className={styles.club()}
                    type="body"
                    weight="semibold"
                  >
                    {item.clubName}
                  </Typography>
                  <Chip size="sm" variant="soft">
                    <Chip.Label>{t(METHOD_KEY[item.method])}</Chip.Label>
                  </Chip>
                </div>
                <Typography className={styles.meta()} type="body-sm">
                  {item.occurredLabel} · {item.timeLabel}
                </Typography>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
