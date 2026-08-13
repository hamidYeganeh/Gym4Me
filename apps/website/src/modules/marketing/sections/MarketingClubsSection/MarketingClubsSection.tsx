"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMemo, useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  CLUB_CARD_HEIGHT,
  CLUB_CARD_WIDTH,
  MARKETING_CLUB_IMAGES,
} from "../../lib/marketing-home-data";
import { MarketingClubPoster } from "../../lib/marketing-scaled-cards";
import { useScrollSmootherReady } from "../../lib/marketing-scroll-smoother";
import { marketingClubsSectionStyles } from "./MarketingClubsSection.styles";
import type {
  MarketingClubsCard,
  MarketingClubsSectionProps,
} from "./MarketingClubsSection.types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CARD_WIDTH = 80;
const CARD_HEIGHT = 105;
const CLUB_CARD_SCALE = CARD_WIDTH / CLUB_CARD_WIDTH;
const DESKTOP_CARD_COUNT = 20;
const MOBILE_CARD_COUNT = 8;
const PIN_DISTANCE = 4200;
const MOBILE_MQ = "(max-width: 767px)";

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_MQ).matches,
    () => false,
  );
}

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

type Pose = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
};

function getStageValues(progress: number) {
  return {
    lineT: clamp01(progress / 0.12),
    circleT: clamp01((progress - 0.12) / 0.16),
    morph: clamp01((progress - 0.28) / 0.2),
    rotate: clamp01((progress - 0.48) / 0.52),
  };
}

function poseForIndex(
  index: number,
  progress: number,
  size: { width: number; height: number },
  scatter: Pose,
  parallax: number,
  totalCards: number,
): Pose {
  const { lineT, circleT, morph, rotate } = getStageValues(progress);
  const cardCount = Math.max(totalCards, 1);

  const lineSpacing = CARD_WIDTH + 12;
  const lineTotalWidth = cardCount * lineSpacing;
  const linePos: Pose = {
    x: index * lineSpacing - lineTotalWidth / 2,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
  };

  const isMobile = size.width < 768;
  const minDimension = Math.min(size.width, size.height);
  const circleRadius = Math.min(minDimension * 0.35, 350);
  const circleAngle = (index / cardCount) * 360;
  const circleRad = (circleAngle * Math.PI) / 180;
  const circlePos: Pose = {
    x: Math.cos(circleRad) * circleRadius,
    y: Math.sin(circleRad) * circleRadius,
    rotation: circleAngle + 90,
    scale: 1,
    opacity: 1,
  };

  if (progress < 0.12) {
    return {
      x: lerp(scatter.x, linePos.x, lineT),
      y: lerp(scatter.y, linePos.y, lineT),
      rotation: lerp(scatter.rotation, linePos.rotation, lineT),
      scale: lerp(scatter.scale, linePos.scale, lineT),
      opacity: lerp(scatter.opacity, linePos.opacity, lineT),
    };
  }

  if (progress < 0.28) {
    return {
      x: lerp(linePos.x, circlePos.x, circleT),
      y: lerp(linePos.y, circlePos.y, circleT),
      rotation: lerp(linePos.rotation, circlePos.rotation, circleT),
      scale: 1,
      opacity: 1,
    };
  }

  const baseRadius = Math.min(size.width, size.height * 1.5);
  const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
  const arcApexY = size.height * (isMobile ? 0.35 : 0.25);
  const arcCenterY = arcApexY + arcRadius;
  const spreadAngle = isMobile ? 100 : 130;
  const startAngle = -90 - spreadAngle / 2;
  const step = spreadAngle / Math.max(cardCount - 1, 1);
  const boundedRotation = -rotate * spreadAngle * 0.8;
  const currentArcAngle = startAngle + index * step + boundedRotation;
  const arcRad = (currentArcAngle * Math.PI) / 180;
  const arcScale = isMobile ? 1.35 : 1.65;

  return {
    x: lerp(circlePos.x, Math.cos(arcRad) * arcRadius + parallax, morph),
    y: lerp(circlePos.y, Math.sin(arcRad) * arcRadius + arcCenterY, morph),
    rotation: lerp(circlePos.rotation, currentArcAngle + 90, morph),
    scale: lerp(1, arcScale, morph),
    opacity: 1,
  };
}

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
