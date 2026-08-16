"use client";

import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { useEffect, useRef, useState } from "react";
import { LANDING_ASSETS } from "../../lib/landing-assets";
import { LandingArrowButton } from "../../lib/landing-controls";
import {
  CarouselDots,
  ClipReveal,
  InViewRise,
} from "../../lib/landing-reveal";
import { useLandingScroll } from "../../lib/landing-scroll";
import { landingTrustSectionStyles } from "./LandingTrustSection.styles";
import type { LandingTrustSectionProps } from "./LandingTrustSection.types";

export function LandingTrustSection({ className }: LandingTrustSectionProps) {
  const slots = landingTrustSectionStyles();
  const { scrollTo } = useLandingScroll();
  const [index, setIndex] = useState(0);
  const [revealKey, setRevealKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const slide = LANDING_ASSETS.coaches[index]!;

  const go = (next: number) => {
    setIndex(
      (next + LANDING_ASSETS.coaches.length) % LANDING_ASSETS.coaches.length,
    );
    setRevealKey((k) => k + 1);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let killed = false;
    let st: { kill: () => void } | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed) return;
        gsap.registerPlugin(ScrollTrigger);
        const rtl =
          document.querySelector(".landing-shell")?.getAttribute("dir") ===
          "rtl";
        const sign = rtl ? -1 : 1;
        const ranges: [number, number][] = [
          [-3, 3],
          [3, -3],
          [-2, 4],
          [4, -3],
        ];
        st = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            wordRefs.current.forEach((el, i) => {
              if (!el) return;
              const [a, b] = ranges[i] ?? [0, 0];
              const x = (a + (b - a) * p) * sign;
              gsap.set(el, { xPercent: x });
            });
          },
        });
      },
    );

    return () => {
      killed = true;
      st?.kill();
    };
  }, [revealKey]);

  const words = slide.headline;

  return (
    <section
      ref={sectionRef}
      className={slots.root({ className })}
      id="coaches"
    >
      <div className={slots.badges()}>
        <InViewRise fromScale={0.9} fromY={0} className={slots.percent()}>
          <p className={slots.percentValue()}>تأییدشده</p>
          <p className={slots.percentCaption()}>مربی با سابقه و نظر واقعی</p>
        </InViewRise>

        <InViewRise delayIn={120} fromY={24} className={slots.badgeCard()}>
          <span className={slots.chip()}>مربی</span>
          <div>
            <h2 className={slots.badgeTitle()}>مربی مناسب را در اپ پیدا کن</h2>
            <p className={slots.badgeBody()}>
              تخصص، سابقه و نظر اعضا را ببین، جلسه خصوصی رزرو کن و قبل از تمرین
              یادآوری بگیر.
            </p>
          </div>
        </InViewRise>
      </div>

      <h2
        id="trust-title"
        className={slots.ghost()}
        aria-label={words.join(" ")}
      >
        <span className={slots.ghostRow()}>
          {[0, 1].map((i) => (
            <span
              key={`${revealKey}-t-${i}`}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className={slots.ghostWord()}
            >
              <ClipReveal
                as="span"
                mode="words"
                text={words[i]!}
                active
                stagger={0}
              />
            </span>
          ))}
        </span>
        <span className={slots.ghostRow()}>
          {[2, 3].map((i) => (
            <span
              key={`${revealKey}-b-${i}`}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className={slots.ghostWord({ ink: i === 2 })}
            >
              <ClipReveal
                as="span"
                mode="words"
                text={words[i]!}
                active
                stagger={0}
              />
            </span>
          ))}
        </span>
      </h2>

      <InViewRise fromY={60} fromScale={0.92} className={slots.coachWrap()}>
        <CoachFeatureCard
          certifiedLabel={slide.isCertified ? "تأییدشده" : undefined}
          className={slots.coachCard()}
          experienceLabel={`${slide.yearsExperience} سال سابقه`}
          image={slide.src}
          imageAlt={slide.alt}
          isNew={slide.isNew}
          key={revealKey}
          newLabel="جدید"
          onPress={() => scrollTo("#download")}
          rating={slide.rating}
          ratingCount={slide.ratingCount}
          specialty={slide.specialty}
          title={slide.name}
        />
      </InViewRise>

      <div className={slots.controls()}>
        <LandingArrowButton
          direction="prev"
          variant="outline"
          label="قبلی"
          onPress={() => go(index - 1)}
        />
        <CarouselDots
          count={LANDING_ASSETS.coaches.length}
          active={index}
          tone="dark"
          onSelect={go}
        />
        <LandingArrowButton
          direction="next"
          variant="solid"
          label="بعدی"
          onPress={() => go(index + 1)}
        />
      </div>
    </section>
  );
}
