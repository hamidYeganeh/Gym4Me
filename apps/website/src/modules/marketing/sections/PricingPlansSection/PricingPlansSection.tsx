"use client";

import { Typography } from "@heroui/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { pricingPlansSectionVariants } from "./PricingPlansSection.styles";
import type { PricingPlansSectionProps } from "./PricingPlansSection.types";

export function PricingPlansSection({
  plans,
  ctaHref,
}: PricingPlansSectionProps) {
  const t = useTranslations("MarketingLanding.pricing");
  const slots = pricingPlansSectionVariants();

  return (
    <section className={slots.grid()}>
      {plans.map((plan) => (
        <article className={slots.plan()} key={plan.id}>
          <Typography className={slots.planTitle()} type="h3" weight="bold">
            {plan.name}
          </Typography>
          <Typography className={slots.planDescription()} type="body-sm">
            {plan.description || t("planFallbackDescription")}
          </Typography>
          <Typography className={slots.planPrice()} type="h3" weight="bold">
            {plan.pricing.amount === 0
              ? t("freePrice")
              : `${plan.pricing.amount.toLocaleString("fa-IR")} ${t("priceSuffix")}`}
          </Typography>
          <Typography className={slots.planPeriod()} type="body-xs" color="muted">
            {t("periodPrefix")}{" "}
            {plan.pricing.periodDays.toLocaleString("fa-IR")}{" "}
            {t("periodSuffix")}
          </Typography>
          <ul className={slots.featureList()}>
            {plan.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
          <Link className={slots.planCta()} href={ctaHref}>
            {t("ctaLabel")}
          </Link>
        </article>
      ))}
    </section>
  );
}
