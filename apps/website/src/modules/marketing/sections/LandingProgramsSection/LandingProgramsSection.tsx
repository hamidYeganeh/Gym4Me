"use client";

import { ClubSubscriptionCard } from "@repo/ui/cards/ClubSubscriptionCard";
import { LANDING_MEMBERSHIPS } from "../../lib/landing-assets";
import { LandingEyebrow } from "../../lib/landing-ui";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingProgramsSectionStyles } from "./LandingProgramsSection.styles";
import type { LandingProgramsSectionProps } from "./LandingProgramsSection.types";

export function LandingProgramsSection({
  className,
}: LandingProgramsSectionProps) {
  const slots = landingProgramsSectionStyles();
  const { scrollTo } = useLandingScroll();

  return (
    <section id="programs" className={slots.root({ className })}>
      <LandingEyebrow>عضویت باشگاه</LandingEyebrow>
      <ClipReveal
        id="programs-title"
        as="h2"
        mode="lines"
        text={"پلن باشگاه را\nاز اپ تمدید کن"}
        className={slots.title()}
      />
      <p className={slots.hint()}>
        عضویت باشگاه جدا از اشتراک پلتفرم است. دوره را ببین، تمدید کن و پرداخت
        را در Gym4Me تمام کن.
      </p>
      <div className={slots.list()}>
        {LANDING_MEMBERSHIPS.map((plan, i) => (
          <InViewRise delayIn={i * 90} fromY={26} key={plan.planName}>
            <ClubSubscriptionCard
              actionLabel="دانلود اپ"
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
