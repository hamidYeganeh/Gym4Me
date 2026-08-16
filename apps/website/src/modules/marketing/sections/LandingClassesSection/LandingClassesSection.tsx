"use client";

import { Button, Typography } from "@heroui/react";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { LANDING_CLASSES } from "../../lib/landing-assets";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingClassesSectionStyles } from "./LandingClassesSection.styles";
import type { LandingClassesSectionProps } from "./LandingClassesSection.types";

export function LandingClassesSection({
  className,
}: LandingClassesSectionProps) {
  const slots = landingClassesSectionStyles();
  const { scrollTo } = useLandingScroll();

  return (
    <section
      id="classes"
      className={slots.root({ className })}
      dir="rtl"
      lang="fa"
    >
      <header className={slots.header()}>
        <ClipReveal
          as="h2"
          className={slots.title()}
          mode="lines"
          text={"کلاس باشگاه را\nاز تقویم اپ رزرو کن"}
        />
        <Typography className={slots.hint()} type="body">
          HIIT، قدرتی، یوگا و رزمی. مربی، روز و مدت همان چیزی است که در کشف
          کلاس‌های Gym4Me می‌بینی.
        </Typography>
      </header>

      <div className={slots.rail()}>
        {LANDING_CLASSES.map((item, index) => (
          <InViewRise delayIn={index * 90} fromY={28} key={item.id}>
            <ClubClassCard
              actionLabel="جزئیات کلاس"
              author={item.author}
              backgroundImage={item.backgroundImage}
              backgroundImageAlt={item.title}
              category={item.category}
              className={slots.card()}
              date={item.date}
              duration={item.duration}
              onAction={() => scrollTo("#download")}
              size="md"
              title={item.title}
            />
          </InViewRise>
        ))}
      </div>

      <div className={slots.ctaWrap()}>
        <Button
          className={slots.cta()}
          size="lg"
          onPress={() => scrollTo("#download")}
        >
          رزرو از اپ
        </Button>
      </div>
    </section>
  );
}
