"use client";

import { Button } from "@heroui/react/button";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "../../lib/marketing-cn";
import {
  DISPLAY_FONT,
  MARKETING_CTA,
  MARKETING_HERO_CLUB_IMAGE,
  MARKETING_HERO_COACH_IMAGE,
} from "../../lib/marketing-home-data";
import { ScaledClubCard, ScaledCoachCard } from "../../lib/marketing-scaled-cards";
import { MarketingThemeToggle } from "../../lib/marketing-theme-toggle";
import { MarketingHeroFeaturesBlock } from "./MarketingHeroFeaturesBlock";
import {
  ArrowAccentLeft,
  ArrowAccentRight,
  CircularBadge,
} from "./MarketingHeroSectionDecorations";
import { marketingHeroSectionStyles } from "./MarketingHeroSection.styles";
import type { MarketingHeroSectionProps } from "./MarketingHeroSection.types";

export function MarketingHeroSection({
  className,
  ...props
}: MarketingHeroSectionProps) {
  const t = useTranslations("MarketingLanding.hero");
  const clubCopy = useTranslations("MarketingLanding.clubDemo");
  const coachCopy = useTranslations("MarketingLanding.coachDemo");
  const prefersReducedMotion = useReducedMotion();
  const slots = marketingHeroSectionStyles();

  const club = {
    title: clubCopy("title"),
    label: clubCopy("label"),
    imageSrc: MARKETING_HERO_CLUB_IMAGE,
    imageAlt: clubCopy("title"),
  };

  const coach = {
    name: coachCopy("name"),
    specialty: coachCopy("specialty"),
    imageSrc: MARKETING_HERO_COACH_IMAGE,
    imageAlt: coachCopy("name"),
    rating: 4.9,
    reviewCount: 128,
    yearsOfExperience: 5,
    isCertified: true,
    isNew: true,
    badgeLabel: coachCopy("badgeNew"),
    certifiedLabel: coachCopy("certified"),
    experienceLabel: coachCopy("yearsOfExperience"),
  };

  const navigation = [
    { label: t("nav.features"), href: "#features" },
    { label: t("nav.programs"), href: "#programs" },
    { label: t("nav.testimonials"), href: "#clubs" },
    { label: t("nav.contact"), href: "#download" },
  ];

  return (
    <div
      dir="rtl"
      className={slots.root({ className })}
      role="banner"
      aria-label={t("ariaLabel")}
      {...props}
    >
      <div className={slots.grid()} aria-hidden />

      <nav className={slots.nav()}>
        <div className={slots.logoRow()}>
          <div className={slots.logoPrimary()}>
            {t("logoPrimary")}
            <div
              className={slots.logoNotch()}
              style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
              aria-hidden
            />
          </div>
          <div className={slots.logoSecondary()}>{t("logoSecondary")}</div>
        </div>

        <div className={slots.navLinks()}>
          {navigation.map((item) => (
            <a key={item.label} href={item.href} className={slots.navLink()}>
              {item.label}
            </a>
          ))}
        </div>

        <div className={slots.navActions()}>
          <MarketingThemeToggle className={slots.themeToggle()} />
          <Button
            variant="outline"
            className={slots.cta()}
            onPress={() => {
              document
                .querySelector(MARKETING_CTA.downloadHref)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t("cta")}
          </Button>
        </div>
      </nav>

      <div className={slots.stage()}>
        <div className={slots.headlineWrap()}>
          <div className={slots.headlineStack()}>
            <div className="relative z-30 flex w-full justify-start ps-[6%] sm:ps-[10%] md:ps-[25%]">
              <h1
                className={cn(slots.display(), slots.displaySolid())}
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {t("line1")}
              </h1>
            </div>
            <div className="relative z-20 flex w-full justify-center">
              <p
                className={cn(
                  slots.display(),
                  slots.displaySolid(),
                  slots.displayLarge(),
                )}
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {t("line2")}
              </p>
            </div>
            <div className="relative z-10 flex w-full justify-start ps-[10%] sm:ps-[15%] md:ps-[30%]">
              <p
                className={cn(slots.display(), slots.displaySolid())}
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {t("line3")}
              </p>
            </div>
          </div>

          <div className={slots.overlays()}>
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -15, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: [0.45, 0, 0.55, 1],
              }}
              className="pointer-events-auto absolute bottom-[-2%] left-[-2%] z-30 sm:bottom-[2%] sm:left-[2%] md:bottom-[4%] md:left-[14%]"
            >
              <ScaledClubCard
                club={club}
                scale={0.48}
                className="rotate-[-12deg] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0"
              />
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -15, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: [0.45, 0, 0.55, 1],
                delay: 0.8,
              }}
              className="pointer-events-auto absolute top-[10%] right-[-4%] z-30 sm:top-[12%] sm:right-[0%] md:top-[14%] md:right-[16%]"
            >
              <ScaledCoachCard
                coach={coach}
                scale={0.44}
                className="rotate-[12deg] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0"
              />
            </motion.div>

            <div className="absolute bottom-[2%] left-[8%] z-20 hidden h-24 w-24 sm:block md:left-[18%] md:h-32 md:w-32">
              <ArrowAccentLeft />
            </div>

            <div className="absolute top-[8%] right-[6%] z-20 hidden h-24 w-24 sm:block md:right-[14%] md:h-32 md:w-32">
              <ArrowAccentRight />
            </div>

            <div className="pointer-events-auto absolute right-[-2%] bottom-[-8%] z-40 sm:right-[2%] sm:bottom-[-12%] md:right-[18%]">
              <CircularBadge className={slots.badge()} label={t("badgeLabel")} />
            </div>
          </div>
        </div>
      </div>

      <MarketingHeroFeaturesBlock club={club} coach={coach} />
    </div>
  );
}
