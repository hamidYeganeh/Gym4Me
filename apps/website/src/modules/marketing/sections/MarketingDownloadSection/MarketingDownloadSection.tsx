"use client";

import { Button, Typography } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useScrollSmootherReady } from "../../lib/marketing-scroll-smoother";
import { MarketingDownloadPhoneMockup } from "./MarketingDownloadPhoneMockup";
import {
  useMarketingDownloadPointer,
  useMarketingDownloadScroll,
} from "./MarketingDownloadScrollAnimation";
import { marketingDownloadSectionStyles } from "./MarketingDownloadSection.styles";
import type { MarketingDownloadSectionProps } from "./MarketingDownloadSection.types";
import { AppStoreMark, PlayStoreMark } from "./MarketingDownloadStoreMarks";

export function MarketingDownloadSection({
  className,
  ...props
}: MarketingDownloadSectionProps) {
  const t = useTranslations("MarketingLanding.download");
  const metricValue = t.raw("metricValue") as number;
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const smootherReady = useScrollSmootherReady();
  const slots = marketingDownloadSectionStyles();

  useMarketingDownloadPointer({
    containerRef,
    mainCardRef,
    mockupRef,
    smootherReady,
  });

  useMarketingDownloadScroll({
    containerRef,
    metricValue,
    smootherReady,
  });

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

      <MarketingDownloadPhoneMockup
        mainCardRef={mainCardRef}
        mockupRef={mockupRef}
      />
    </div>
  );
}
