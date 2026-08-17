"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

const EASE = {
  reveal: "expo.out",
  morph: "power3.inOut",
  exit: "power3.in",
  pointer: "power3.out",
} as const;

const DURATION = {
  intro: 1.6,
  morph: 2,
  reveal: 1.5,
  exit: 1.2,
  hold: 2,
} as const;

export function useMarketingDownloadPointer({
  containerRef,
  mainCardRef,
  mockupRef,
  smootherReady,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  mainCardRef: RefObject<HTMLDivElement | null>;
  mockupRef: RefObject<HTMLDivElement | null>;
  smootherReady: boolean;
}) {
  const rafRef = useRef(0);

  useGSAP(
    (_context, contextSafe) => {
      if (!contextSafe || !smootherReady) return;

      const onMouseMove = contextSafe((e: MouseEvent) => {
        const scrollY = ScrollSmoother.get()?.scrollTop() ?? window.scrollY;
        if (scrollY > window.innerHeight * 2) return;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          if (!mainCardRef.current || !mockupRef.current) return;

          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty(
            "--mouse-x",
            `${e.clientX - rect.left}px`,
          );
          mainCardRef.current.style.setProperty(
            "--mouse-y",
            `${e.clientY - rect.top}px`,
          );

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: EASE.pointer,
            duration: 1.2,
          });
        });
      });

      window.addEventListener("mousemove", onMouseMove);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(rafRef.current);
      };
    },
    {
      scope: containerRef,
      dependencies: [smootherReady],
      revertOnUpdate: true,
    },
  );
}

export function useMarketingDownloadScroll({
  containerRef,
  metricValue,
  smootherReady,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  metricValue: number;
  smootherReady: boolean;
}) {
  useGSAP(
    () => {
      if (!smootherReady) return;

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

          if (reduceMotion) {
            gsap.set(
              [
                ".text-track",
                ".text-days",
                ".main-card",
                ".card-left-text",
                ".card-right-text",
                ".mockup-scroll-wrapper",
                ".floating-badge",
                ".phone-widget",
                ".cta-wrapper",
              ],
              { clearProps: "all", autoAlpha: 1 },
            );
            gsap.set(".progress-ring", { strokeDashoffset: 60 });
            gsap.set(".counter-val", { innerHTML: String(metricValue) });
            return;
          }

          if (isMobile) {
            gsap.set(".text-track", {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "none",
              rotationX: 0,
            });
            gsap.set(".text-days", {
              autoAlpha: 1,
              clipPath: "none",
            });
          } else {
            gsap.set(".text-track", {
              autoAlpha: 0,
              y: 60,
              scale: 0.85,
              filter: "blur(20px)",
              rotationX: -20,
            });
            gsap.set(".text-days", {
              autoAlpha: 1,
              clipPath: "inset(0 0 0 100%)",
            });

            const introTl = gsap.timeline({ delay: 0.3 });
            introTl
              .to(".text-track", {
                duration: DURATION.intro,
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                rotationX: 0,
                ease: EASE.reveal,
              })
              .to(
                ".text-days",
                {
                  duration: DURATION.intro,
                  clipPath: "inset(0 0% 0 0)",
                  ease: EASE.morph,
                },
                "-=1.0",
              );
          }

          gsap.set(".main-card", {
            y: window.innerHeight + 200,
            autoAlpha: 1,
            visibility: "visible",
          });
          gsap.set(
            [
              ".card-left-text",
              ".card-right-text",
              ".mockup-scroll-wrapper",
              ".floating-badge",
              ".phone-widget",
            ],
            { autoAlpha: 0 },
          );
          gsap.set(".cta-wrapper", {
            autoAlpha: 0,
            visibility: "hidden",
            scale: 0.8,
            filter: "blur(30px)",
          });

          const scrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: isDesktop ? "+=7000" : "+=3600",
              pin: true,
              scrub: isDesktop ? 1 : 0.55,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: -1,
            },
          });

          scrollTl
            .to(
              [".hero-text-wrapper", ".hero-grid"],
              {
                scale: 1.15,
                filter: "blur(20px)",
                opacity: 0.2,
                ease: EASE.morph,
                duration: DURATION.morph,
              },
              0,
            )
            .to(
              ".main-card",
              { y: 0, ease: EASE.morph, duration: DURATION.morph },
              0,
            )
            .to(".main-card", {
              width: "100%",
              height: "100%",
              borderRadius: "0px",
              ease: EASE.morph,
              duration: DURATION.reveal,
            })
            .fromTo(
              ".mockup-scroll-wrapper",
              {
                y: isDesktop ? 300 : 180,
                z: -500,
                rotationX: 50,
                rotationY: 30,
                autoAlpha: 0,
                scale: 0.6,
              },
              {
                y: 0,
                z: 0,
                rotationX: 0,
                rotationY: 0,
                autoAlpha: 1,
                scale: 1,
                ease: EASE.reveal,
                duration: DURATION.morph,
              },
              "-=0.6",
            )
            .fromTo(
              ".phone-widget",
              { y: 40, autoAlpha: 0, scale: 0.95 },
              {
                y: 0,
                autoAlpha: 1,
                scale: 1,
                stagger: 0.12,
                ease: EASE.reveal,
                duration: DURATION.reveal,
              },
              "-=1.2",
            )
            .to(
              ".progress-ring",
              {
                strokeDashoffset: 60,
                duration: DURATION.morph,
                ease: EASE.morph,
              },
              "-=1.0",
            )
            .to(
              ".counter-val",
              {
                innerHTML: metricValue,
                snap: { innerHTML: 1 },
                duration: DURATION.morph,
                ease: EASE.reveal,
              },
              "-=2.0",
            )
            .fromTo(
              ".floating-badge",
              { y: 80, autoAlpha: 0, scale: 0.85, rotationZ: -8 },
              {
                y: 0,
                autoAlpha: 1,
                scale: 1,
                rotationZ: 0,
                ease: EASE.reveal,
                duration: DURATION.reveal,
                stagger: 0.15,
              },
              "-=1.8",
            )
            .fromTo(
              ".card-left-text",
              { x: 50, autoAlpha: 0 },
              {
                x: 0,
                autoAlpha: 1,
                ease: EASE.reveal,
                duration: DURATION.reveal,
              },
              "-=1.2",
            )
            .fromTo(
              ".card-right-text",
              { x: -50, autoAlpha: 0, scale: 0.9 },
              {
                x: 0,
                autoAlpha: 1,
                scale: 1,
                ease: EASE.reveal,
                duration: DURATION.reveal,
              },
              "<",
            )
            .to({}, { duration: DURATION.hold })
            .set(".hero-text-wrapper", { autoAlpha: 0 })
            .set(".cta-wrapper", { autoAlpha: 1 })
            .to({}, { duration: DURATION.reveal })
            .to(
              [
                ".mockup-scroll-wrapper",
                ".floating-badge",
                ".card-left-text",
                ".card-right-text",
              ],
              {
                scale: 0.92,
                y: -32,
                z: -160,
                autoAlpha: 0,
                ease: EASE.exit,
                duration: DURATION.exit,
                stagger: 0.04,
              },
            )
            .to(
              ".main-card",
              {
                width: isDesktop ? "85vw" : "94vw",
                height: isDesktop ? "85vh" : "90vh",
                borderRadius: isDesktop ? "40px" : "28px",
                ease: EASE.morph,
                duration: DURATION.intro,
              },
              "pullback",
            )
            .to(
              ".cta-wrapper",
              {
                scale: 1,
                filter: "blur(0px)",
                ease: EASE.morph,
                duration: DURATION.intro,
              },
              "pullback",
            )
            .to(".main-card", {
              y: -window.innerHeight - 300,
              ease: EASE.exit,
              duration: DURATION.reveal,
            });
        },
      );

      return () => mm.revert();
    },
    {
      scope: containerRef,
      dependencies: [metricValue, smootherReady],
      revertOnUpdate: true,
    },
  );
}
