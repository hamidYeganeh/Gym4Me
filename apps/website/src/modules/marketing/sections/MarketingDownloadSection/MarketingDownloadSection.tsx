"use client";

import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
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
import { resolveStoreUrl } from "./store-link";

const appStoreUrl = resolveStoreUrl(process.env.NEXT_PUBLIC_APP_STORE_URL);
const playStoreUrl = resolveStoreUrl(process.env.NEXT_PUBLIC_PLAY_STORE_URL);

function openStore(url?: string) {
  if (url) window.location.assign(url);
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
        <Typography
          type="body"
          className={slots.ctaDescription()}
          weight="semibold"
        >
          <TextWithBrand>{t("ctaDescription")}</TextWithBrand>
        </Typography>
        <div className={slots.storeRow()}>
          <Button
            isDisabled={!appStoreUrl}
            size="lg"
            aria-label={`${t("appStoreLabel")} ${t("appStoreTitle")}`}
            className={slots.storeButton()}
            onPress={() => openStore(appStoreUrl)}
          >
            <AppStoreMark className={slots.storeIcon()} />
            <span className="text-start">
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
            isDisabled={!playStoreUrl}
            size="lg"
            variant="outline"
            aria-label={`${t("playStoreLabel")} ${t("playStoreTitle")}`}
            className={slots.storeButton()}
            onPress={() => openStore(playStoreUrl)}
          >
            <PlayStoreMark className={slots.storeIconPlay()} />
            <span className="text-start">
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
        </div>
      </div>

      <MarketingDownloadPhoneMockup
        mainCardRef={mainCardRef}
        mockupRef={mockupRef}
      />
    </div>
  );
}
