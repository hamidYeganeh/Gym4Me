"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Multiply phone overflow so the scrub doesn't feel rushed. */
const PIN_OVERFLOW_SCALE = 1.35;
/** Minimum pin travel when the phone has scrollable content. */
const PIN_MIN_VH = 0.85;

export function useLandingDownloadPhoneScroll({
  sectionRef,
  viewportRef,
  scrollRef,
  smootherReady,
  reducedMotion,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  smootherReady: boolean;
  reducedMotion: boolean;
}) {
  useGSAP(
    () => {
      if (!smootherReady || reducedMotion) return;

      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = scrollRef.current;
      if (!section || !viewport || !track) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, reduceMotion: prefersReduced } =
            ctx.conditions as {
              isDesktop: boolean;
              reduceMotion: boolean;
            };

          if (prefersReduced) {
            gsap.set(track, { clearProps: "transform" });
            return;
          }

          const measureOverflow = () =>
            Math.max(0, track.scrollHeight - viewport.clientHeight);

          const pinDistance = () => {
            const overflow = measureOverflow();
            if (overflow < 8) return 1;
            return Math.max(
              Math.round(overflow * PIN_OVERFLOW_SCALE),
              Math.round(window.innerHeight * PIN_MIN_VH),
            );
          };

          gsap.set(track, { y: 0, force3D: true });

          const tween = gsap.to(track, {
            y: () => -measureOverflow(),
            ease: "none",
            scrollTrigger: {
              id: "landing-download-phone-scroll",
              trigger: section,
              start: "top top",
              end: () => `+=${pinDistance()}`,
              pin: true,
              pinSpacing: true,
              scrub: isDesktop ? 0.55 : 0.4,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 40,
            },
          });

          let refreshRaf = 0;
          const refresh = () => {
            cancelAnimationFrame(refreshRaf);
            refreshRaf = requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          };

          requestAnimationFrame(() => requestAnimationFrame(refresh));
          const ro = new ResizeObserver(() => refresh());
          ro.observe(track);
          ro.observe(viewport);

          const images = Array.from(track.querySelectorAll("img"));
          images.forEach((img) => {
            if (!img.complete) {
              img.addEventListener("load", refresh, { once: true });
            }
          });

          return () => {
            cancelAnimationFrame(refreshRaf);
            ro.disconnect();
            images.forEach((img) =>
              img.removeEventListener("load", refresh),
            );
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        },
      );

      return () => mm.revert();
    },
    {
      scope: sectionRef,
      dependencies: [smootherReady, reducedMotion],
      revertOnUpdate: true,
    },
  );
}
