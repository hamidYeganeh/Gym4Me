"use client";

import { Typography } from "@heroui/react/typography";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { pricingEmptySectionVariants } from "./PricingEmptySection.styles";

export function PricingEmptySection() {
  const t = useTranslations("MarketingLanding.pricing.empty");
  const slots = pricingEmptySectionVariants();

  return (
    <section className={slots.emptySection()}>
      <Typography className={slots.emptyTitle()} type="h2" weight="bold">
        {t("title")}
      </Typography>
      <Typography className={slots.emptyBody()} type="body">
        {t("body")}
      </Typography>
      <Link className={slots.emptyCta()} href="/for-clubs">
        {t("ctaLabel")}
      </Link>
    </section>
  );
}
