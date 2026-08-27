"use client";

import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Typography } from "@heroui/react/typography";
import { ClubSubscriptionCard } from "@repo/ui/cards/ClubSubscriptionCard";
import { useTranslations } from "next-intl";
import { LANDING_MEMBERSHIPS } from "../../lib/landing-assets";
import { LandingEyebrow } from "../../lib/landing-ui";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingProgramsSectionStyles } from "./LandingProgramsSection.styles";
import type { LandingProgramsSectionProps } from "./LandingProgramsSection.types";

export function LandingProgramsSection({
  className,
}: LandingProgramsSectionProps) {
  const t = useTranslations("MarketingLanding.landingPrograms");
  const slots = landingProgramsSectionStyles();
  const { scrollTo } = useLandingScroll();

  return (
    <section id="programs" className={slots.root({ className })}>
      <LandingEyebrow>{t("eyebrow")}</LandingEyebrow>
      <ClipReveal
        id="programs-title"
        as="h2"
        mode="lines"
        text={t("title")}
        className={slots.title()}
      />
      <Typography type="body" className={slots.hint()}>
        <TextWithBrand>{t("hint")}</TextWithBrand>
      </Typography>
      <div className={slots.list()}>
        {LANDING_MEMBERSHIPS.map((plan, i) => (
          <InViewRise delayIn={i * 90} fromY={26} key={plan.planName}>
            <ClubSubscriptionCard
              actionLabel={t("actionLabel")}
              badge={plan.badge}
              className={slots.card()}
              description={plan.description}
              onAction={() => scrollTo("#download")}
              planName={plan.planName}
              price={plan.price}
              priceSuffix={plan.priceSuffix}
              selected={plan.selected}
            />
          </InViewRise>
        ))}
      </div>
    </section>
  );
}
