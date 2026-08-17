"use client";

import { Button, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { usePrefersReducedMotion } from "../../lib/landing-motion";
import { useScrollSmootherReady } from "../../lib/marketing-scroll-smoother";
import { useLandingDownloadPhoneScroll } from "./LandingDownloadPhoneScroll";
import { LandingDownloadPhoneMockup } from "./LandingDownloadPhoneMockup";
import { landingDownloadSectionStyles } from "./LandingDownloadSection.styles";
import type { LandingDownloadSectionProps } from "./LandingDownloadSection.types";
import { AppStoreMark, PlayStoreMark } from "./LandingDownloadStoreMarks";

export function LandingDownloadSection({
  className,
}: LandingDownloadSectionProps) {
  const t = useTranslations("MarketingLanding.download");
  const landing = useTranslations("MarketingLanding.landingDownload");
  const slots = landingDownloadSectionStyles();
  const reducedMotion = usePrefersReducedMotion();
  const smootherReady = useScrollSmootherReady();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLandingDownloadPhoneScroll({
    sectionRef,
    viewportRef,
    scrollRef,
    smootherReady,
    reducedMotion,
  });

  return (
    <section
      ref={sectionRef}
      id="download"
      className={slots.root({ className })}
    >
      <div className={slots.panel()}>
        <div className={slots.inner()}>
          <div className={slots.copy()}>
            <ClipReveal
              id="download-title"
              as="h2"
              mode="lines"
              text={landing("title")}
              className={slots.title()}
            />
            <Typography type="body" className={slots.hint()}>
              {landing("hint")}
            </Typography>
            <InViewRise delayIn={120} fromY={18} className={slots.actions()}>
              <Button
                size="lg"
                aria-label={`${t("appStoreLabel")} ${t("appStoreTitle")}`}
                className={slots.store()}
                onPress={() => window.location.assign("#")}
              >
                <AppStoreMark className={slots.storeIcon()} />
                <span>
                  <Typography
                    type="body-xs"
                    weight="bold"
                    className={slots.storeKicker()}
                  >
                    {t("appStoreLabel")}
                  </Typography>
                  <Typography
                    type="body"
                    weight="bold"
                    className={slots.storeTitle()}
                  >
                    {t("appStoreTitle")}
                  </Typography>
                </span>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                aria-label={`${t("playStoreLabel")} ${t("playStoreTitle")}`}
                className={slots.storeGhost()}
                onPress={() => window.location.assign("#")}
              >
                <PlayStoreMark className={slots.storeIconPlay()} />
                <span>
                  <Typography
                    type="body-xs"
                    weight="bold"
                    className={slots.storeKicker()}
                  >
                    {t("playStoreLabel")}
                  </Typography>
                  <Typography
                    type="body"
                    weight="bold"
                    className={slots.storeTitle()}
                  >
                    {t("playStoreTitle")}
                  </Typography>
                </span>
              </Button>
            </InViewRise>
          </div>

          <LandingDownloadPhoneMockup
            viewportRef={viewportRef}
            scrollRef={scrollRef}
          />
        </div>
      </div>
    </section>
  );
}
