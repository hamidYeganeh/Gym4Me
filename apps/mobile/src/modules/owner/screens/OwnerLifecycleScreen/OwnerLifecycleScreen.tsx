"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { ownerLifecycleScreenVariants } from "./OwnerLifecycleScreen.styles";
import type { OwnerLifecycleScreenProps } from "./OwnerLifecycleScreen.types";

export function OwnerLifecycleScreen({
  view,
  pending = false,
  onEnroll,
  onRun,
  className,
}: OwnerLifecycleScreenProps) {
  const t = useTranslations("OwnerLifecycle");
  const router = useRouter();
  const styles = ownerLifecycleScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
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
            {t("subtitle", { club: view.clubName })}
          </Typography>
        </section>

        <section className={styles.actions()}>
          <Button
            isDisabled={pending || !onEnroll}
            onPress={onEnroll}
            size="lg"
            variant="primary"
          >
            {t("enrollCta")}
          </Button>
          <Button
            isDisabled={pending || !onRun}
            onPress={onRun}
            size="lg"
            variant="outline"
          >
            {t("runCta")}
          </Button>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("atRiskTitle")}
          </Typography>
          {view.atRisk.length === 0 ? (
            <div className={styles.empty()}>{t("atRiskEmpty")}</div>
          ) : (
            <div className={styles.card()}>
              {view.atRisk.map((member) => (
                <div className={styles.row()} key={member.id}>
                  <div>
                    <Typography className={styles.rowTitle()} type="body" weight="semibold">
                      {member.userLabel}
                    </Typography>
                    <Typography className={styles.rowMeta()} type="body-sm">
                      {member.statusLabel} · {member.remainingLabel}
                    </Typography>
                  </div>
                  <Typography className={styles.rowMeta()} type="body-sm">
                    {member.expiresLabel}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("journeysTitle")}
          </Typography>
          {view.journeys.length === 0 ? (
            <div className={styles.empty()}>{t("journeysEmpty")}</div>
          ) : (
            <div className={styles.card()}>
              {view.journeys.map((journey) => (
                <div className={styles.row()} key={journey.id}>
                  <div>
                    <Typography className={styles.rowTitle()} type="body" weight="semibold">
                      {journey.userLabel}
                    </Typography>
                    <Typography className={styles.rowMeta()} type="body-sm">
                      {journey.segmentLabel} · {journey.stepLabel}
                    </Typography>
                    <Typography className={styles.rowMeta()} type="body-sm">
                      {journey.nextActionLabel}
                    </Typography>
                  </div>
                  <Chip
                    color={
                      journey.status === "active"
                        ? "warning"
                        : journey.status === "completed"
                          ? "success"
                          : "default"
                    }
                    size="sm"
                    variant="soft"
                  >
                    {t(`journeyStatus.${journey.status}`)}
                  </Chip>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("segmentsTitle")}
          </Typography>
          {view.segments.length === 0 ? (
            <div className={styles.empty()}>{t("segmentsEmpty")}</div>
          ) : (
            <div className={styles.card()}>
              {view.segments.map((segment) => (
                <div className={styles.row()} key={segment.id}>
                  <div>
                    <Typography className={styles.rowTitle()} type="body" weight="semibold">
                      {segment.name}
                    </Typography>
                    <Typography className={styles.rowMeta()} type="body-sm">
                      {segment.kind}
                    </Typography>
                  </div>
                  <Chip size="sm" variant="soft">
                    {segment.status}
                  </Chip>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
