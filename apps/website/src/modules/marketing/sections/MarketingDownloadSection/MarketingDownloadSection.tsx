"use client";

import { useGSAP } from "@gsap/react";
import { Button, Typography } from "@heroui/react";
import { Check, CheckCircle, Fire1, Handshake } from "@repo/icons";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useScrollSmootherReady } from "../../lib/marketing-scroll-smoother";
import { marketingDownloadSectionStyles } from "./MarketingDownloadSection.styles";
import type { MarketingDownloadSectionProps } from "./MarketingDownloadSection.types";

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

function AppStoreMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 384 512"
      aria-hidden
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function PlayStoreMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden
    >
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
  );
}

export function MarketingDownloadSection({
  className,
  ...props
}: MarketingDownloadSectionProps) {
  const t = useTranslations("MarketingLanding.download");
  const metricValue = t.raw("metricValue") as number;
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const smootherReady = useScrollSmootherReady();
  const slots = marketingDownloadSectionStyles();

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

  return (
    <div
      ref={containerRef}
      id="download"
      dir="rtl"
      className={slots.root({ className })}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <div className={slots.grain()} aria-hidden />
      <div className={slots.grid()} aria-hidden />

      <div className={slots.heroText()}>
        <Typography type="h1" weight="bold" className={slots.tagline()}>
          {t("tagline1")}
        </Typography>
        <Typography type="h1" weight="bold" className={slots.tagline2()}>
          {t("tagline2")}
        </Typography>
      </div>

      <div className={slots.ctaWrapper()}>
        <Typography type="h2" weight="bold" className={slots.ctaHeading()}>
          {t("ctaHeading")}
        </Typography>
        <Typography type="body" className={slots.ctaDescription()} weight="semibold">
          {t("ctaDescription")}
        </Typography>
        <div className={slots.storeRow()}>
          <Button
            size="lg"
            aria-label={`${t("appStoreLabel")} ${t("appStoreTitle")}`}
            className={slots.storeButton()}
            onPress={() => window.location.assign("#")}
          >
            <AppStoreMark className={slots.storeIcon()} />
            <span className="text-start">
              <Typography type="body-xs" weight="bold" className={slots.storeKicker()}>
                {t("appStoreLabel")}
              </Typography>
              <Typography type="body" weight="bold" className={slots.storeTitle()}>
                {t("appStoreTitle")}
              </Typography>
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            aria-label={`${t("playStoreLabel")} ${t("playStoreTitle")}`}
            className={slots.storeButton()}
            onPress={() => window.location.assign("#")}
          >
            <PlayStoreMark className={slots.storeIconPlay()} />
            <span className="text-start">
              <Typography type="body-xs" weight="bold" className={slots.storeKicker()}>
                {t("playStoreLabel")}
              </Typography>
              <Typography type="body" weight="bold" className={slots.storeTitle()}>
                {t("playStoreTitle")}
              </Typography>
            </span>
          </Button>
        </div>
      </div>

      <div className={slots.cardLayer()} style={{ perspective: "1500px" }}>
        <div ref={mainCardRef} className={slots.mainCard()}>
          <div className={slots.sheen()} aria-hidden />

          <div className={slots.cardInner()}>
            <div className={slots.brandCol()}>
              <Typography type="h2" weight="bold" className={slots.brandName()}>
                {t("brandName")}
              </Typography>
            </div>

            <div className={slots.mockupWrap()} style={{ perspective: "1000px" }}>
              <div className={slots.mockupScale()}>
                <div
                  ref={mockupRef}
                  className={slots.bezel()}
                  style={{ transformStyle: "preserve-3d" }}
                  dir="rtl"
                >
                  <div
                    className={`${slots.hardwareBtn()} top-[120px] -left-[3px] h-[25px] rounded-l-md`}
                    aria-hidden
                  />
                  <div
                    className={`${slots.hardwareBtn()} top-[160px] -left-[3px] h-[45px] rounded-l-md`}
                    aria-hidden
                  />
                  <div
                    className={`${slots.hardwareBtn()} top-[220px] -left-[3px] h-[45px] rounded-l-md`}
                    aria-hidden
                  />
                  <div
                    className={`${slots.hardwareBtn()} top-[170px] -right-[3px] h-[70px] scale-x-[-1] rounded-r-md`}
                    aria-hidden
                  />

                  <div className={slots.screen()}>
                    <div className={slots.glare()} aria-hidden />
                    <div className={slots.notch()}>
                      <div className={slots.notchDot()} />
                    </div>

                    <div className={slots.screenInner()}>
                      <div className={slots.phoneHeader()}>
                        <div className="flex flex-col items-start">
                          <Typography
                            type="body-xs"
                            weight="bold"
                            className="mb-1 tracking-widest text-foreground/55"
                          >
                            {t("phoneTodayLabel")}
                          </Typography>
                          <Typography
                            type="h4"
                            weight="bold"
                            className="tracking-tight text-foreground"
                          >
                            {t("phoneJourneyLabel")}
                          </Typography>
                        </div>
                        <Button
                          isIconOnly
                          size="lg"
                          variant="tertiary"
                          aria-label={t("phoneAvatarLabel")}
                          className={slots.avatar()}
                        >
                          {t("phoneAvatarLabel")}
                        </Button>
                      </div>

                      <div className={slots.ringWrap()}>
                        <svg className={slots.ringSvg()} aria-hidden>
                          <circle
                            cx="88"
                            cy="88"
                            r="64"
                            fill="none"
                            stroke="color-mix(in oklab, var(--color-foreground) 8%, transparent)"
                            strokeWidth="12"
                          />
                          <circle
                            className="progress-ring"
                            cx="88"
                            cy="88"
                            r="64"
                            fill="none"
                            strokeWidth="12"
                          />
                        </svg>
                        <div className="z-10 flex flex-col items-center text-center">
                          <Typography
                            type="h2"
                            weight="bold"
                            className={slots.counter()}
                          >
                            ۰
                          </Typography>
                          <Typography
                            type="body-xs"
                            weight="bold"
                            className="mt-0.5 tracking-widest text-foreground/55"
                          >
                            {t("metricLabel")}
                          </Typography>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          variant="tertiary"
                          fullWidth
                          className={slots.widget()}
                        >
                          <span className={slots.widgetIcon()}>
                            <CheckCircle size={16} className="text-accent" />
                          </span>
                          <span className="flex flex-1 flex-col items-start gap-0.5">
                            <Typography
                              type="body-sm"
                              weight="semibold"
                              className="text-foreground"
                            >
                              {t("phoneSessionTitle")}
                            </Typography>
                            <Typography
                              type="body-xs"
                              className="text-foreground/55"
                            >
                              {t("phoneSessionMeta")}
                            </Typography>
                          </span>
                        </Button>
                        <Button
                          variant="tertiary"
                          fullWidth
                          className={slots.widget()}
                        >
                          <span className={slots.widgetIconMuted()}>
                            <Check size={16} className="text-foreground" />
                          </span>
                          <span className="flex flex-1 flex-col items-start gap-0.5">
                            <Typography
                              type="body-sm"
                              weight="semibold"
                              className="text-foreground"
                            >
                              {t("phoneDoneTitle")}
                            </Typography>
                            <Typography
                              type="body-xs"
                              className="text-foreground/55"
                            >
                              {t("phoneDoneMeta")}
                            </Typography>
                          </span>
                        </Button>
                      </div>

                      <div className={slots.homeIndicator()} />
                    </div>
                  </div>
                </div>

                <div className={`${slots.floatingBadge()} top-4 start-0 sm:top-6 sm:start-[-15px] lg:top-12 lg:start-[-80px]`}>
                  <div className={`${slots.badgeIcon()} border border-accent/30 bg-accent/15`}>
                    <Fire1 size={18} className="text-warning" />
                  </div>
                  <div>
                    <Typography
                      type="h4"
                      weight="semibold"
                      className="text-sm tracking-tight text-foreground sm:text-base"
                    >
                      {t("streakTitle")}
                    </Typography>
                    <Typography type="body-xs" className="text-muted lg:text-xs">
                      {t("streakSubtitle")}
                    </Typography>
                  </div>
                </div>

                <div className={`${slots.floatingBadge()} end-0 bottom-8 sm:end-[-15px] sm:bottom-12 lg:end-[-80px] lg:bottom-20`}>
                  <div className={`${slots.badgeIcon()} border border-focus/30 bg-focus/15`}>
                    <Handshake size={18} className="text-focus" />
                  </div>
                  <div>
                    <Typography
                      type="h4"
                      weight="semibold"
                      className="text-sm tracking-tight text-foreground sm:text-base"
                    >
                      {t("coachUpdateTitle")}
                    </Typography>
                    <Typography type="body-xs" className="text-muted lg:text-xs">
                      {t("coachUpdateSubtitle")}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className={slots.copyCol()}>
              <Typography type="h3" weight="bold" className={slots.cardHeading()}>
                {t("cardHeading")}
              </Typography>
              <Typography type="body" className={slots.cardDescription()}>
                <span className="font-semibold text-foreground">
                  {t("cardDescriptionBrand")}
                </span>
                {t("cardDescriptionAfter")}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
