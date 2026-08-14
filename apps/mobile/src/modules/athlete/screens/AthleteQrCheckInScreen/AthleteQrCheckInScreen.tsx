"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { QrCode } from "@repo/icons/QrCode";
import { ArrowRotateClockwise1 } from "@repo/icons/ArrowRotateClockwise1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { QrCheckInEntry } from "../../lib/athlete-qr-checkin-data";
import { athleteQrCheckInScreenVariants } from "./AthleteQrCheckInScreen.styles";
import type { AthleteQrCheckInScreenProps } from "./AthleteQrCheckInScreen.types";

function checkInStatusLabel(
  t: ReturnType<typeof useTranslations<"AthleteQrCheckIn">>,
  status: QrCheckInEntry["status"],
) {
  switch (status) {
    case "success":
      return t("checkInSuccess");
    case "expired":
      return t("checkInExpired");
    case "invalid":
      return t("checkInInvalid");
    default:
      return status;
  }
}

export function AthleteQrCheckInScreen({
  code,
  expiresAtLabel,
  recentCheckIns,
  pending = false,
  onRefresh,
  className,
}: AthleteQrCheckInScreenProps) {
  const t = useTranslations("AthleteQrCheckIn");
  const styles = athleteQrCheckInScreenVariants();
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

        <section className={styles.qrCard()}>
          <div className={styles.qrPlaceholder()} aria-hidden>
            <QrCode size={80} />
          </div>
          <Typography className={styles.code()} type="body" weight="semibold">
            {code}
          </Typography>
          <Typography className={styles.meta()} type="body-sm">
            {expiresAtLabel}
          </Typography>
          <Button
            isDisabled={pending || !onRefresh}
            onPress={() => void onRefresh?.()}
            variant="secondary"
          >
            <ArrowRotateClockwise1 size={18} />
            {t("refresh")}
          </Button>
        </section>

        <section>
          <Typography type="h4" weight="semibold">
            {t("recentTitle")}
          </Typography>
          <div className={styles.list()}>
            {recentCheckIns.length === 0 ? (
              <Typography className={styles.meta()} type="body-sm">
                {t("recentEmpty")}
              </Typography>
            ) : (
              recentCheckIns.map((entry) => (
                <article className={styles.row()} key={entry.id}>
                  <div className={styles.rowTop()}>
                    <Typography type="body" weight="semibold">
                      {entry.clubName}
                    </Typography>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>
                        {checkInStatusLabel(t, entry.status)}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.meta()} type="body-sm">
                    {entry.checkedInAtLabel}
                  </Typography>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
