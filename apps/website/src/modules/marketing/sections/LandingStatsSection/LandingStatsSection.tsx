"use client";

import { Fire1 } from "@repo/icons/Fire1";
import { FootSteps } from "@repo/icons/FootSteps";
import { Heart } from "@repo/icons/Heart";
import { SleepZzz } from "@repo/icons/SleepZzz";
import { MetricCard } from "@repo/ui/cards/MetricCard";
import type { ReactNode } from "react";
import { LANDING_METRICS } from "../../lib/landing-assets";
import { LandingEyebrow } from "../../lib/landing-ui";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { landingStatsSectionStyles } from "./LandingStatsSection.styles";
import type { LandingStatsSectionProps } from "./LandingStatsSection.types";

const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

const METRIC_ICONS: Record<(typeof LANDING_METRICS)[number]["key"], ReactNode> =
  {
    steps: <FootSteps size={18} />,
    active: <Fire1 size={18} />,
    heart: <Heart size={18} />,
    sleep: <SleepZzz size={18} />,
  };

export function LandingStatsSection({ className }: LandingStatsSectionProps) {
  const slots = landingStatsSectionStyles();

  return (
    <section className={slots.root({ className })}>
      <div className={slots.layout()}>
        <div className={slots.copy()}>
          <LandingEyebrow tone="light">در اپ</LandingEyebrow>
          <ClipReveal
            id="stats-title"
            as="h2"
            mode="lines"
            text={"معیارها\nدر یک نگاه"}
            className={slots.title()}
          />
          <p className={slots.hint()}>
            قدم‌ها، خواب، ضربان و فعالیت را همان‌جا که رزرو می‌کنی دنبال کن —
            بدون خروج از Gym4Me.
          </p>
        </div>

        <div className={slots.stack()}>
          {LANDING_METRICS.map((metric, i) => (
            <InViewRise
              className={slots.item()}
              delayIn={i * 90}
              fromY={24}
              key={metric.key}
            >
              <MetricCard
                chart={metric.chart}
                className={slots.card()}
                color={metric.color}
                dayLabels={WEEKDAY_LABELS}
                icon={METRIC_ICONS[metric.key]}
                periodLabel="امروز"
                status={metric.status}
                title={metric.title}
                unit={metric.unit}
                value={metric.value}
                variant="horizontal"
              />
            </InViewRise>
          ))}
        </div>
      </div>
    </section>
  );
}
