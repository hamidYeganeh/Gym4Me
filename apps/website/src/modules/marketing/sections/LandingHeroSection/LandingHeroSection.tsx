"use client";

import { Button } from "@heroui/react/button";
import { ScrollShadow, type ScrollShadowVisibility } from "@heroui/react/scroll-shadow";
import { ClubCard } from "@repo/ui/cards/ClubCard";
import { emblaOptions } from "@repo/ui/lib/embla";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LANDING_ASSETS, LANDING_CLUBS } from "../../lib/landing-assets";
import { BrandMark } from "../../lib/landing-controls";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { cn } from "../../lib/marketing-cn";
import { MarketingThemeToggle } from "../../lib/marketing-theme-toggle";
import { landingHeroSectionStyles } from "./LandingHeroSection.styles";
import type { LandingHeroSectionProps } from "./LandingHeroSection.types";

const HERO_CLUBS = LANDING_CLUBS.slice(0, 5);

function shadowFromEmbla(
  canPrev: boolean,
  canNext: boolean,
): ScrollShadowVisibility {
  if (canPrev && canNext) return "both";
  if (canPrev) return "left";
  if (canNext) return "right";
  return "none";
}

export function LandingHeroSection({ className }: LandingHeroSectionProps) {
  const t = useTranslations("MarketingLanding.landingHero");
  const shared = useTranslations("MarketingLanding.shared");
  const slots = landingHeroSectionStyles();
  const { ready, openMenu, scrollTo } = useLandingScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [shadowVisibility, setShadowVisibility] =
    useState<ScrollShadowVisibility>("auto");

  const [emblaRef, emblaApi] = useEmblaCarousel(
    emblaOptions({
      align: "start",
      containScroll: "trimSnaps",
      direction: "rtl",
    }),
  );

  useEffect(() => {
    const section = sectionRef.current;
    const plate = parallaxRef.current;
    if (!section || !plate) return;
    let killed = false;
    let st: { kill: () => void } | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed) return;
        gsap.registerPlugin(ScrollTrigger);
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(plate, { yPercent: self.progress * 12 });
          },
        });
      },
    );

    return () => {
      killed = true;
      st?.kill();
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const syncShadow = () => {
      setShadowVisibility(
        shadowFromEmbla(emblaApi.canScrollPrev(), emblaApi.canScrollNext()),
      );
    };

    syncShadow();
    emblaApi.on("select", syncShadow);
    emblaApi.on("reInit", syncShadow);
    emblaApi.on("scroll", syncShadow);

    return () => {
      emblaApi.off("select", syncShadow);
      emblaApi.off("reInit", syncShadow);
      emblaApi.off("scroll", syncShadow);
    };
  }, [emblaApi]);

  return (
    <section ref={sectionRef} className={slots.root({ className })}>
      <div className={slots.plate()} aria-hidden>
        <div ref={parallaxRef} className={slots.plateInner()}>
          <img
            src={LANDING_ASSETS.hero}
            alt={t("heroImageAlt")}
            className={slots.plateImg()}
            fetchPriority="high"
          />
        </div>
        <div className={slots.plateGradient()} />
      </div>

      <header className={slots.header()}>
        <nav className={slots.navLeft()} aria-label={t("navAria")}>
          <a
            href="#sports"
            className={slots.navLink()}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#sports");
            }}
          >
            {t("navSports")}
          </a>
          <a
            href="#clubs"
            className={slots.navLink()}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#clubs");
            }}
          >
            {t("navClubs")}
          </a>
          <a
            href="#coaches"
            className={slots.navLink()}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#coaches");
            }}
          >
            {t("navCoaches")}
          </a>
        </nav>

        <div className={slots.brand()}>
          <BrandMark size={20} instanceId="hero-brand" />
          <span>Gym4Me</span>
        </div>

        <div className={slots.navRight()}>
          <MarketingThemeToggle className={slots.themeToggle()} />
          <Button
            variant="ghost"
            className={cn(
              slots.bookBtn(),
              "h-auto min-h-0 rounded-none border-0 bg-transparent p-0 shadow-none",
            )}
            onPress={() => scrollTo("#download")}
          >
            {t("downloadCta")}
          </Button>
          <Button
            variant="ghost"
            className={slots.burger()}
            aria-label={t("menuAria")}
            onPress={openMenu}
            render={(props) => <button {...props} type="button" />}
          >
            <span className={slots.burgerBar()} />
            <span className={slots.burgerBar()} />
          </Button>
        </div>
      </header>

      <div className={slots.titleWrap()}>
        <ClipReveal
          id="hero-title"
          as="h1"
          mode="lines"
          text={t("title")}
          className={slots.title()}
          active={ready}
          stagger={140}
          duration={1100}
        />
      </div>

      <div className={slots.bottom()}>
        <ClipReveal
          as="p"
          mode="lines"
          text={t("tagline")}
          className={slots.tagline()}
          active={ready}
          baseDelay={350}
          stagger={110}
          duration={900}
        />

        <InViewRise className={slots.slider()} delayIn={650} fromY={28}>
          <ScrollShadow
            className={slots.carouselShadow()}
            hideScrollBar
            isEnabled={false}
            orientation="horizontal"
            size={56}
            visibility={shadowVisibility}
          >
            <div
              aria-label={t("carouselAria")}
              aria-roledescription="carousel"
              className={slots.carousel()}
              dir="rtl"
              ref={emblaRef}
              role="group"
            >
              <div className={slots.carouselTrack()}>
                {HERO_CLUBS.map((club) => (
                  <div className={slots.slide()} key={club.title}>
                    <ClubCard
                      actionLabel={shared("viewAction")}
                      className={slots.clubCard()}
                      features={[...club.features]}
                      image={club.image}
                      imageAlt={club.title}
                      onAction={() => scrollTo("#clubs")}
                      orientation="vertical"
                      price={club.price}
                      pricePrefix={shared("pricePrefix")}
                      priceSuffix={shared("priceSuffix")}
                      rating={club.rating}
                      ratingCount={club.ratingCount}
                      subtitle={club.subtitle}
                      title={club.title}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollShadow>
        </InViewRise>
      </div>
    </section>
  );
}
