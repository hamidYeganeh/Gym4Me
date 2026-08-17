"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  CLUB_CARD_HEIGHT,
  CLUB_CARD_WIDTH,
  MARKETING_CLUB_IMAGES,
} from "../../lib/marketing-home-data";
import { MarketingClubPoster } from "../../lib/marketing-scaled-cards";
import { useScrollSmootherReady } from "../../lib/marketing-scroll-smoother";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  DESKTOP_CARD_COUNT,
  MOBILE_CARD_COUNT,
  PIN_DISTANCE,
  getStageValues,
  clamp01,
  lerp,
  poseForIndex,
  useIsMobile,
  type Pose,
} from "./MarketingClubsSection.animation";
import { marketingClubsSectionStyles } from "./MarketingClubsSection.styles";
import type {
  MarketingClubsCard,
  MarketingClubsSectionProps,
} from "./MarketingClubsSection.types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CLUB_CARD_SCALE = CARD_WIDTH / CLUB_CARD_WIDTH;

export function MarketingClubsSection({
  className,
  ...props
}: MarketingClubsSectionProps) {
  const t = useTranslations("MarketingLanding.clubs");
  const isMobileViewport = useIsMobile();
  const cardCount = isMobileViewport ? MOBILE_CARD_COUNT : DESKTOP_CARD_COUNT;
  const slots = marketingClubsSectionStyles();

  const cards = useMemo<MarketingClubsCard[]>(
    () =>
      t.raw("cards").map((card: { title: string; label: string; imageAlt: string }, index: number) => ({
        title: card.title,
        label: card.label,
        imageAlt: card.imageAlt,
        imageSrc:
          MARKETING_CLUB_IMAGES[index % MARKETING_CLUB_IMAGES.length] ??
          MARKETING_CLUB_IMAGES[0],
      })),
    [t],
  );

  const gallery = useMemo(
    () =>
      Array.from(
        { length: cardCount },
        (_, index) => cards[index % cards.length] ?? cards[0]!,
      ),
    [cards, cardCount],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const smootherReady = useScrollSmootherReady();

  useGSAP(
    (_context, contextSafe) => {
      if (!contextSafe || !sectionRef.current || !smootherReady) return;

      const section = sectionRef.current;
      const cardEls = gsap.utils.toArray<HTMLElement>(".club-card", section);
      const introTitleEl =
        section.querySelector<HTMLElement>(".clubs-intro-title");
      const introHintEl =
        section.querySelector<HTMLElement>(".clubs-intro-hint");
      const contentEl =
        section.querySelector<HTMLElement>(".clubs-arc-content");
      const totalCards = cardEls.length;

      const state = { progress: 0, parallax: 0 };
      let scatter: Pose[] = [];

      const rebuildScatter = (isMobile: boolean) => {
        const spreadX = isMobile
          ? Math.min(section.offsetWidth * 1.1, 420)
          : 1500;
        const spreadY = isMobile
          ? Math.min(section.offsetHeight * 0.9, 520)
          : 1000;

        scatter = cardEls.map(() => ({
          x: (Math.random() - 0.5) * spreadX,
          y: (Math.random() - 0.5) * spreadY,
          rotation: (Math.random() - 0.5) * 180,
          scale: isMobile ? 0.75 : 0.6,
          opacity: isMobile ? 0.55 : 0.25,
        }));
      };

      const applyLayout = () => {
        const size = {
          width: section.offsetWidth,
          height: section.offsetHeight,
        };
        const { morph } = getStageValues(state.progress);

        const poses = cardEls.map((_, index) => {
          const scatterPose = scatter[index]!;
          return poseForIndex(
            index,
            state.progress,
            size,
            scatterPose,
            state.parallax,
            totalCards,
          );
        });

        gsap.set(cardEls, {
          x: (index: number) => poses[index]?.x ?? 0,
          y: (index: number) => poses[index]?.y ?? 0,
          rotation: (index: number) => poses[index]?.rotation ?? 0,
          scale: (index: number) => poses[index]?.scale ?? 1,
          opacity: (index: number) => poses[index]?.opacity ?? 1,
          force3D: true,
        });

        const introVisible =
          state.progress < 0.28
            ? 1
            : morph < 0.5
              ? Math.max(1 - morph * 2, 0)
              : 0;

        if (introTitleEl) gsap.set(introTitleEl, { opacity: introVisible });
        if (introHintEl) {
          gsap.set(introHintEl, { opacity: introVisible * 0.55 });
        }

        if (contentEl) {
          const contentT = clamp01((morph - 0.6) / 0.4);
          gsap.set(contentEl, {
            opacity: contentT,
            y: lerp(20, 0, contentT),
            force3D: true,
          });
        }
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, isMobile, reduceMotion } = ctx.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          gsap.set(cardEls, {
            xPercent: -50,
            yPercent: -50,
            left: "50%",
            top: "50%",
            transformOrigin: "50% 50%",
            force3D: true,
            willChange: "transform, opacity",
          });

          rebuildScatter(Boolean(isMobile));

          if (reduceMotion) {
            state.progress = 1;
            state.parallax = 0;
            applyLayout();
            if (introTitleEl) gsap.set(introTitleEl, { opacity: 0 });
            if (introHintEl) gsap.set(introHintEl, { opacity: 0 });
            if (contentEl) gsap.set(contentEl, { opacity: 1, y: 0 });
            return;
          }

          state.progress = 0;
          applyLayout();

          const pinDistance = isDesktop
            ? PIN_DISTANCE
            : Math.round(PIN_DISTANCE * 0.7);

          const scrubTween = gsap.to(state, {
            progress: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: `+=${pinDistance}`,
              pin: true,
              scrub: isMobile ? 0.45 : 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 1,
            },
            onUpdate: applyLayout,
          });

          const parallaxTo = gsap.quickTo(state, "parallax", {
            duration: 0.45,
            ease: "power3.out",
            onUpdate: applyLayout,
          });

          const onMouseMove = contextSafe((event: MouseEvent) => {
            if (!scrubTween.scrollTrigger?.isActive) return;
            const rect = section.getBoundingClientRect();
            const normalizedX =
              ((event.clientX - rect.left) / rect.width) * 2 - 1;
            parallaxTo(normalizedX * 80);
          });

          section.addEventListener("mousemove", onMouseMove, { passive: true });

          return () => {
            section.removeEventListener("mousemove", onMouseMove);
          };
        },
      );

      return () => {
        mm.revert();
      };
    },
    {
      scope: sectionRef,
      dependencies: [smootherReady, cardCount],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      ref={sectionRef}
      id="clubs"
      dir="rtl"
      className={slots.root({ className })}
      {...props}
    >
      <div className={slots.grid()} aria-hidden />

      <div className={slots.stage()}>
        <div className={slots.intro()}>
          <h2 className={slots.introTitle()}>{t("introTitle")}</h2>
          <p className={slots.introHint()}>{t("introHint")}</p>
        </div>

        <div className={slots.content()}>
          <h2 className={slots.title()}>{t("title")}</h2>
          <p className={slots.description()}>{t("description")}</p>
        </div>

        <div className={slots.gallery()} aria-hidden>
          {gallery.map((card, index) => (
            <div
              key={`${card.imageSrc}-${index}`}
              className={slots.card()}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                left: "50%",
                top: "50%",
                opacity: 0.7,
                transform: `translate(-50%, -50%) rotate(${(index - cardCount / 2) * 4}deg)`,
              }}
            >
              <div
                className={slots.cardScale()}
                style={{
                  width: CLUB_CARD_WIDTH,
                  height: CLUB_CARD_HEIGHT,
                  transform: `scale(${CLUB_CARD_SCALE})`,
                }}
              >
                <MarketingClubPoster club={card} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
