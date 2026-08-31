"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { athleteWaitlistScreenVariants } from "./AthleteWaitlistScreen.styles";
import type { AthleteWaitlistScreenProps } from "./AthleteWaitlistScreen.types";

export function AthleteWaitlistScreen({
  items,
  pendingId,
  error,
  onLeave,
  onClaim,
  className,
}: AthleteWaitlistScreenProps) {
  const t = useTranslations("AthleteWaitlist");
  const styles = athleteWaitlistScreenVariants();
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
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

        {error ? (
          <div className="rounded-large bg-danger-50 p-3 text-danger" role="alert">
            {error}
          </div>
        ) : null}

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
            {items.map((item) => {
              const myEntry = item.entries[0];
              return (
                <div className={styles.card()} key={item.id}>
                  <div className="flex items-center justify-between gap-2">
                    <Typography type="body" weight="semibold">
                      {item.resource.type} · {item.resource.id.slice(-6)}
                    </Typography>
                    {myEntry ? (
                      <Chip size="sm" variant="soft">
                        <Chip.Label>{t(`status.${myEntry.status}`)}</Chip.Label>
                      </Chip>
                    ) : null}
                  </div>
                  <Typography className={styles.meta()} type="body-sm">
                    {t("position", {
                      count: item.entryCount,
                      date: item.occurrenceDate ?? "—",
                    })}
                  </Typography>
                  {myEntry?.status === "offered" && myEntry.offerExpiresAt ? (
                    <Typography className={styles.meta()} type="body-sm">
                      {t("offerExpires", {
                        date: new Date(myEntry.offerExpiresAt).toLocaleString(
                          "fa-IR-u-ca-persian",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Tehran",
                          },
                        ),
                      })}
                    </Typography>
                  ) : null}
                  <div className={styles.actions()}>
                    {myEntry?.status === "offered" && onClaim ? (
                      <Button
                        isDisabled={pendingId === item.id}
                        onPress={() => {
                          void onClaim(item.id, myEntry.id);
                        }}
                        size="lg"
                        variant="primary"
                      >
                        {t("claim")}
                      </Button>
                    ) : null}
                    {onLeave &&
                    myEntry &&
                    (myEntry.status === "waiting" ||
                      myEntry.status === "offered") ? (
                      <Button
                        isDisabled={pendingId === item.id}
                        onPress={() => {
                          void onLeave(item.id);
                        }}
                        size="lg"
                        variant="outline"
                      >
                        {t("leave")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
