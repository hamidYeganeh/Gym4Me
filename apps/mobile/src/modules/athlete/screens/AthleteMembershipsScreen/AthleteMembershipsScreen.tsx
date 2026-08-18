"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { athleteMembershipsScreenStyles as styles } from "./AthleteMembershipsScreen.styles";
import type { AthleteMembershipsScreenProps } from "./AthleteMembershipsScreen.types";

export function AthleteMembershipsScreen({
  memberships,
  pending = false,
  onRenew,
}: AthleteMembershipsScreenProps) {
  const t = useTranslations("AthleteMemberships");
  const router = useRouter();

  const currentMemberships = memberships.filter(
    (membership) => membership.state !== "expired",
  );
  const pastMemberships = memberships.filter(
    (membership) => membership.state === "expired",
  );

  return (
    <AppLayout
      className={styles.root}
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
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("activeTitle")}
          </Typography>
          {currentMemberships.length > 0 ? (
            <div className={styles.heroList}>
              {currentMemberships.map((membership) => {
                const progressPercent = Math.round(
                  (membership.sessionsUsed / membership.sessionsTotal) * 100,
                );

                return (
                  <div className={styles.heroCard} key={membership.id}>
                    <div className={styles.heroHeader}>
                      <span className={styles.heroTitles}>
                        <Typography
                          className={styles.heroPlan}
                          type="h4"
                          weight="semibold"
                        >
                          {membership.planName}
                        </Typography>
                        <Typography className={styles.heroClub} type="body-sm">
                          {membership.clubName}
                        </Typography>
                      </span>
                      {membership.state === "expiring" ? (
                        <Chip color="warning" size="sm">
                          <Chip.Label>{t("expiringChip")}</Chip.Label>
                        </Chip>
                      ) : (
                        <Chip color="success" size="sm">
                          <Chip.Label>{t("activeChip")}</Chip.Label>
                        </Chip>
                      )}
                    </div>

                    <div className={styles.progressBlock}>
                      <div className={styles.progressMeta}>
                        <Typography
                          className={styles.progressLabel}
                          type="body-sm"
                        >
                          {t("sessionsProgress", {
                            used: membership.sessionsUsed,
                            total: membership.sessionsTotal,
                          })}
                        </Typography>
                        <Typography
                          className={styles.progressLabel}
                          type="body-sm"
                        >
                          {membership.expiresLabel}
                        </Typography>
                      </div>
                      <div
                        aria-label={t("sessionsProgress", {
                          used: membership.sessionsUsed,
                          total: membership.sessionsTotal,
                        })}
                        aria-valuemax={membership.sessionsTotal}
                        aria-valuemin={0}
                        aria-valuenow={membership.sessionsUsed}
                        className={styles.progressTrack}
                        role="progressbar"
                      >
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className={styles.heroFooter}>
                      <Typography
                        className={styles.price}
                        type="body"
                        weight="semibold"
                      >
                        {membership.priceLabel}
                      </Typography>
                      {onRenew && membership.clubId && membership.planId ? (
                        <Button
                          isDisabled={pending}
                          onPress={() => {
                            void onRenew(membership);
                          }}
                          size="sm"
                          variant="primary"
                        >
                          {t("renew")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <Typography className={styles.emptyTitle} type="h4" weight="semibold">
                {t("emptyTitle")}
              </Typography>
              <Typography className={styles.emptyBody} type="body-sm">
                {t("emptyBody")}
              </Typography>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle} type="body-sm">
            {t("pastTitle")}
          </Typography>
          {pastMemberships.length > 0 ? (
            <div className={styles.pastList}>
              {pastMemberships.map((membership) => (
                <div className={styles.pastCard} key={membership.id}>
                  <div className={styles.pastHeader}>
                    <span className={styles.pastTitles}>
                      <Typography
                        className={styles.pastPlan}
                        type="body"
                        weight="semibold"
                      >
                        {membership.planName}
                      </Typography>
                      <Typography className={styles.pastMeta} type="body-sm">
                        {membership.clubName}
                      </Typography>
                    </span>
                    <Chip size="sm">
                      <Chip.Label>{t("expiredChip")}</Chip.Label>
                    </Chip>
                  </div>
                  <Typography className={styles.pastMeta} type="body-sm">
                    {membership.expiresLabel}
                  </Typography>
                  {onRenew && membership.clubId && membership.planId ? (
                    <Button
                      className="mt-2"
                      isDisabled={pending}
                      onPress={() => {
                        void onRenew(membership);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      {t("purchase")}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Typography className={styles.emptyBody} type="body-sm">
                {t("emptyPast")}
              </Typography>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
