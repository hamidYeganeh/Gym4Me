"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Check } from "@repo/icons/Check";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { Fire1 } from "@repo/icons/Fire1";
import { Handshake } from "@repo/icons/Handshake";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { marketingDownloadSectionStyles } from "./MarketingDownloadSection.styles";

type MarketingDownloadPhoneMockupProps = {
  mainCardRef: RefObject<HTMLDivElement | null>;
  mockupRef: RefObject<HTMLDivElement | null>;
};

export function MarketingDownloadPhoneMockup({
  mainCardRef,
  mockupRef,
}: MarketingDownloadPhoneMockupProps) {
  const t = useTranslations("MarketingLanding.download");
  const slots = marketingDownloadSectionStyles();

  return (
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
  );
}
