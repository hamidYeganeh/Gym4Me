"use client";

import { ClubCard } from "@repo/ui/cards/ClubCard";
import { LANDING_CLUBS } from "../../lib/landing-assets";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingClubsSectionStyles } from "./LandingClubsSection.styles";
import type { LandingClubsSectionProps } from "./LandingClubsSection.types";

export function LandingClubsSection({ className }: LandingClubsSectionProps) {
  const slots = landingClubsSectionStyles();
  const { scrollTo } = useLandingScroll();

  return (
    <section id="clubs" className={slots.root({ className })}>
      <ClipReveal
        id="clubs-title"
        as="h2"
        mode="lines"
        text={"باشگاه نزدیک\nرا روی نقشه ببین"}
        className={slots.title()}
      />
      <p className={slots.hint()}>
        همان کارت کشف اپ: امتیاز، امکانات و قیمت را ببین، بعد از Gym4Me رزرو کن.
      </p>
      <div className={slots.grid()}>
        {LANDING_CLUBS.slice(0, 4).map((club, i) => (
          <InViewRise
            className={slots.card()}
            delayIn={i * 90}
            fromY={26}
            key={club.title}
          >
            <ClubCard
              actionLabel="مشاهده"
              className="w-full max-w-none"
              features={[...club.features]}
              image={club.image}
              imageAlt={club.title}
              onAction={() => scrollTo("#download")}
              orientation="vertical"
              price={club.price}
              pricePrefix="از"
              priceSuffix="تومان"
              rating={club.rating}
              ratingCount={club.ratingCount}
              subtitle={club.subtitle}
              title={club.title}
            />
          </InViewRise>
        ))}
      </div>
    </section>
  );
}
