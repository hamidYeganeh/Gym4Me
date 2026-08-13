"use client";

import { motion } from "motion/react";
import { WelcomeMetricCard } from "@/modules/app/components/WelcomeMetricCard";
import { WELCOME_INTRODUCE_METRIC_CARDS } from "@/modules/app/lib/welcome-introduce-data";
import {
  welcomeIntroduceSlideStackVariants,
  welcomeIntroduceStageItemVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceMetricsSectionVariants } from "./WelcomeIntroduceMetricsSection.styles";
import type { WelcomeIntroduceMetricsSectionProps } from "./WelcomeIntroduceMetricsSection.types";

export function WelcomeIntroduceMetricsSection({
  className,
  isActive,
  periodToday,
  cards,
}: WelcomeIntroduceMetricsSectionProps) {
  const styles = welcomeIntroduceMetricsSectionVariants();

  return (
    <motion.div
      className={styles.root({ className })}
      variants={welcomeIntroduceSlideStackVariants}
    >
      {WELCOME_INTRODUCE_METRIC_CARDS.map((card) => {
        const copy = cards[card.id];
        const isPressure = card.tone === "pressure";

        return (
          <motion.div
            className={
              isPressure ? styles.itemPressure() : styles.item()
            }
            key={card.id}
            variants={welcomeIntroduceStageItemVariants}
          >
            <WelcomeMetricCard
              animationKey={`metrics-${card.id}-${isActive}`}
              icon={card.icon}
              periodLabel={periodToday}
              status={copy.status}
              title={copy.title}
              tone={card.tone}
              trailing={card.trailing}
              unit={copy.unit}
              value={copy.value}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
