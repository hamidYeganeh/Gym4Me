"use client";

import { Building2 } from "@repo/icons/Building2";
import { Calendar1 } from "@repo/icons/Calendar1";
import { PersonRunning } from "@repo/icons/PersonRunning";
import { UsersTwo } from "@repo/icons/UsersTwo";
import { StatsCard } from "@repo/ui/cards/StatsCard";
import type { ReactNode } from "react";
import { LANDING_STATS } from "../../lib/landing-assets";
import { LandingEyebrow } from "../../lib/landing-ui";
import { ClipReveal, InViewRise } from "../../lib/landing-reveal";
import { landingStatsSectionStyles } from "./LandingStatsSection.styles";
import type { LandingStatsSectionProps } from "./LandingStatsSection.types";

const STAT_ICONS: Record<string, ReactNode> = {
  باشگاه: <Building2 size={18} />,
  رزرو: <Calendar1 size={18} />,
  مربی: <UsersTwo size={18} />,
  کلاس: <PersonRunning size={18} />,
};

export function LandingStatsSection({ className }: LandingStatsSectionProps) {
  const slots = landingStatsSectionStyles();

  return (
    <section className={slots.root({ className })}>
      <LandingEyebrow>در اپ</LandingEyebrow>
      <ClipReveal
        id="stats-title"
        as="h2"
        mode="lines"
        text={"کشف، رزرو\nو تکرار تمرین"}
        className={slots.title()}
      />
      <p className={slots.hint()}>
        حلقه محصول Gym4Me: باشگاه یا کلاس را پیدا کن، پرداخت کن، حاضر شو و
        تمدید را از همان اپ انجام بده.
      </p>
      <div className={slots.grid()}>
        {LANDING_STATS.map((stat, i) => (
          <InViewRise delayIn={i * 110} fromY={30} key={stat.title}>
            {stat.chart === "bar" ? (
              <StatsCard
                chart="bar"
                className={slots.card()}
                color={stat.color}
                icon={STAT_ICONS[stat.title]}
                series={[...stat.series]}
                title={stat.title}
                unit={stat.unit}
                value={stat.value}
              />
            ) : (
              <StatsCard
                chart="line"
                className={slots.card()}
                color={stat.color}
                icon={STAT_ICONS[stat.title]}
                series={[...stat.series]}
                title={stat.title}
                unit={stat.unit}
                value={stat.value}
              />
            )}
          </InViewRise>
        ))}
      </div>
    </section>
  );
}
