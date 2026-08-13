"use client";

import { Button } from "@heroui/react";
import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
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
import { marketingHeroSectionStyles } from "./MarketingHeroSection.styles";
import type { MarketingHeroSectionProps } from "./MarketingHeroSection.types";

function ArrowAccentLeft() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible stroke-current text-foreground"
      fill="none"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
      <path d="M80,55 L95,70 L85,85" />
    </svg>
  );
}

function ArrowAccentRight() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible stroke-current text-foreground"
      fill="none"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
      <path d="M65,75 L50,80 L55,65" />
    </svg>
  );
}

function ArrowForeground() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible stroke-current text-foreground"
      fill="none"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20,80 Q 40,20 80,40" />
      <path d="M60,20 L80,40 L50,60" />
    </svg>
  );
}

function CircularBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  const pathId = useId().replace(/:/g, "");

  return (
    <div className={className}>
      <div className="absolute inset-1 animate-[spin_10s_linear_infinite]">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          <path
            id={pathId}
            d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
            fill="none"
          />
          <text className="fill-current text-[11px] font-black tracking-[0.18em] uppercase">
            <textPath href={`#${pathId}`} startOffset="0%">
              {label}
            </textPath>
          </text>
        </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="h-10 w-10 overflow-visible stroke-current"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20,80 Q 40,50 30,30 T 80,20" />
          <path d="M60,10 L80,20 L70,40" />
        </svg>
      </div>
    </div>
  );
}

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

      <section id="features" className={slots.features()}>
        <div className={slots.featuresGrid()}>
          <div className={slots.featureCard()}>
            <h2 className={slots.featureTitle()}>
              {t("features.findClub.titleLine1")}
              <br />
              {t("features.findClub.titleLine2")}
            </h2>
            <p className={slots.featureDescription()}>
              {t("features.findClub.description")}
            </p>
            <div className={slots.featureMedia()}>
              <ScaledClubCard club={club} scale={0.62} />
            </div>
            <div className="absolute -right-12 bottom-8 z-30 hidden h-16 w-16 md:block">
              <ArrowForeground />
            </div>
          </div>

          <div className={cn(slots.featureCard(), "w-full")}>
            <h2 className={slots.featureTitle()}>
              {t("features.chooseCoach.titleLine1")}
              <br />
              {t("features.chooseCoach.titleLine2")}
            </h2>
            <p className={slots.featureDescription()}>
              {t("features.chooseCoach.description")}
            </p>
            <div className={slots.featureMedia()}>
              <ScaledCoachCard coach={coach} scale={0.58} />
            </div>
            <div className="absolute -right-12 bottom-8 z-30 hidden h-16 w-16 md:block">
              <ArrowForeground />
            </div>
          </div>

          <div className={cn(slots.featureCard(), "min-h-64")}>
            <h2 className={slots.featureTitle()}>
              {t("features.bookSession.titleLine1")}
              <br />
              {t("features.bookSession.titleLine2")}
            </h2>
            <p className={cn(slots.featureDescription(), "mb-auto")}>
              {t("features.bookSession.description")}
            </p>
            <div className={slots.metricCard()}>
              <p className={slots.metricLabel()}>
                {t("features.bookSession.metricLabel")}
              </p>
              <p className={slots.metricValue()}>
                {t("features.bookSession.metricValue")}
              </p>
              <div className={slots.metricTail()} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
