"use client";

import { ClubCard } from "@repo/ui/cards/ClubCard";
import { useEffect, useRef, useState } from "react";
import { LANDING_ASSETS, LANDING_CLUBS } from "../../lib/landing-assets";
import { BrandMark } from "../../lib/landing-controls";
import { CarouselDots, ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { MarketingThemeToggle } from "../../lib/marketing-theme-toggle";
import { landingHeroSectionStyles } from "./LandingHeroSection.styles";
import type { LandingHeroSectionProps } from "./LandingHeroSection.types";

const HERO_CLUBS = LANDING_CLUBS.slice(0, 3);

export function LandingHeroSection({ className }: LandingHeroSectionProps) {
  const slots = landingHeroSectionStyles();
  const { ready, openMenu, scrollTo } = useLandingScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [cardKey, setCardKey] = useState(0);

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
    if (!ready) return;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % HERO_CLUBS.length);
      setCardKey((k) => k + 1);
    }, 3800);
    return () => window.clearInterval(id);
  }, [ready]);

  const featured = HERO_CLUBS[slide]!;
  const secondary = HERO_CLUBS[(slide + 1) % HERO_CLUBS.length]!;

  return (
    <section ref={sectionRef} className={slots.root({ className })}>
      <div className={slots.plate()} aria-hidden>
        <div ref={parallaxRef} className={slots.plateInner()}>
          <img
            src={LANDING_ASSETS.hero}
            alt=""
            className={slots.plateImg()}
            fetchPriority="high"
          />
        </div>
        <div className={slots.plateGradient()} />
      </div>

      <header className={slots.header()}>
        <nav className={slots.navLeft()} aria-label="اصلی">
          <a
            href="#sports"
            className={slots.navLink()}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#sports");
            }}
          >
            ورزش‌ها
          </a>
          <a
            href="#clubs"
            className={slots.navLink()}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#clubs");
            }}
          >
            باشگاه‌ها
          </a>
          <a
            href="#classes"
            className={slots.navLink()}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#classes");
            }}
          >
            کلاس‌ها
          </a>
          <a
            href="#download"
            className={slots.navLink()}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#download");
            }}
          >
            دانلود
          </a>
        </nav>

        <div className={slots.brand()}>
          <BrandMark size={20} instanceId="hero-brand" />
          <span>Gym4Me</span>
        </div>

        <div className={slots.navRight()}>
          <MarketingThemeToggle className={slots.themeToggle()} />
          <button
            type="button"
            className={slots.bookBtn()}
            onClick={() => scrollTo("#download")}
          >
            دانلود اپ
          </button>
          <button
            type="button"
            className={slots.burger()}
            aria-label="منو"
            onClick={openMenu}
          >
            <span className={slots.burgerBar()} />
            <span className={slots.burgerBar()} />
          </button>
        </div>
      </header>

      <div className={slots.titleWrap()}>
        <ClipReveal
          id="hero-title"
          as="h1"
          mode="words"
          text="باشگاهت را پیدا کن"
          className={slots.title()}
          active={ready}
          stagger={140}
        />
      </div>

      <div className={slots.bottom()}>
        <ClipReveal
          as="p"
          mode="lines"
          text={"رزرو کن،\nتمرین را شروع کن"}
          className={slots.tagline()}
          active={ready}
          baseDelay={350}
          stagger={110}
        />

        <div className={slots.cluster()}>
          <InViewRise className={slots.clubCardWrap()} delayIn={650} fromY={28}>
            <div key={cardKey}>
              <ClubCard
                actionLabel="مشاهده"
                className={slots.clubCard()}
                features={[...featured.features]}
                image={featured.image}
                imageAlt={featured.title}
                onAction={() => scrollTo("#clubs")}
                orientation="vertical"
                price={featured.price}
                pricePrefix="از"
                priceSuffix="تومان"
                rating={featured.rating}
                ratingCount={featured.ratingCount}
                subtitle={featured.subtitle}
                title={featured.title}
              />
            </div>
            <CarouselDots
              count={HERO_CLUBS.length}
              active={slide}
              tone="light"
              onSelect={(i) => {
                setSlide(i);
                setCardKey((k) => k + 1);
              }}
            />
          </InViewRise>

          <InViewRise
            delayIn={780}
            fromY={28}
            className={slots.clubCardWrapSecondary()}
          >
            <ClubCard
              actionLabel="مشاهده"
              className={slots.clubCard()}
              features={[...secondary.features]}
              image={secondary.image}
              imageAlt={secondary.title}
              onAction={() => scrollTo("#clubs")}
              orientation="vertical"
              price={secondary.price}
              pricePrefix="از"
              priceSuffix="تومان"
              rating={secondary.rating}
              ratingCount={secondary.ratingCount}
              subtitle={secondary.subtitle}
              title={secondary.title}
            />
          </InViewRise>
        </div>
      </div>
    </section>
  );
}
