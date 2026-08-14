"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { athleteSubscriptionScreenVariants } from "./AthleteSubscriptionScreen.styles";
import type { AthleteSubscriptionScreenProps } from "./AthleteSubscriptionScreen.types";

export function AthleteSubscriptionScreen({
  plans,
  currentPlanId,
  pending = false,
  onUpgrade,
  className,
}: AthleteSubscriptionScreenProps) {
  const t = useTranslations("AthleteSubscription");
  const styles = athleteSubscriptionScreenVariants();
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

        <div className={styles.list()}>
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <article
                className={
                  isCurrent
                    ? `${styles.card()} ${styles.cardCurrent()}`
                    : styles.card()
                }
                key={plan.id}
              >
                <div className={styles.rowTop()}>
                  <div>
                    <Typography type="body" weight="semibold">
                      {plan.name}
                    </Typography>
                    <Typography className={styles.price()} type="h4" weight="bold">
                      {plan.priceLabel}
                      <span className={styles.meta()}> / {plan.periodLabel}</span>
                    </Typography>
                  </div>
                  {isCurrent ? (
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{t("currentPlan")}</Chip.Label>
                    </Chip>
                  ) : null}
                </div>
                <ul className={styles.features()}>
                  {plan.features.map((feature) => (
                    <li className={styles.feature()} key={feature}>
                      {feature}
                    </li>
                  ))}
                </ul>
                {!isCurrent && onUpgrade ? (
                  <div className={styles.actions()}>
                    <Button
                      fullWidth
                      isDisabled={pending}
                      onPress={() => void onUpgrade(plan.id)}
                      variant="primary"
                    >
                      {t("upgrade")}
                    </Button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
