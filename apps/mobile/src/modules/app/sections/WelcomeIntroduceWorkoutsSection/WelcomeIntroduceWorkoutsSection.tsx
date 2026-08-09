"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { WelcomeWorkoutCard } from "@/modules/app/components/WelcomeWorkoutCard";
import { WELCOME_INTRODUCE_WORKOUT_CARDS } from "@/modules/app/lib/welcome-introduce-data";
import {
  welcomeIntroduceSlideStackVariants,
  welcomeIntroduceStageItemVariants,
} from "@/modules/app/lib/welcome-introduce-motion";
import { welcomeIntroduceWorkoutsSectionVariants } from "./WelcomeIntroduceWorkoutsSection.styles";
import type { WelcomeIntroduceWorkoutsSectionProps } from "./WelcomeIntroduceWorkoutsSection.types";

export function WelcomeIntroduceWorkoutsSection({
  className,
  isActive,
  direction,
  bookmarkLabel,
  durationUnit,
  ratingUnit,
  caloriesUnit,
  cards,
}: WelcomeIntroduceWorkoutsSectionProps) {
  const styles = welcomeIntroduceWorkoutsSectionVariants();
  const reduceMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    direction,
    duration: reduceMotion ? 0 : 22,
    loop: true,
    skipSnaps: false,
  });

  useEffect(() => {
    if (!emblaApi) return;
    if (isActive) {
      emblaApi.reInit();
    }
  }, [emblaApi, isActive, direction]);

  return (
    <motion.div
      className={styles.root({ className })}
      data-welcome-nested-carousel=""
      variants={welcomeIntroduceSlideStackVariants}
    >
      <div className={styles.carousel()} ref={emblaRef}>
        <div className={styles.track()}>
          {WELCOME_INTRODUCE_WORKOUT_CARDS.map((card, index) => {
            const copy = cards[index];
            if (!copy) return null;

            return (
              <motion.div
                className={styles.slide()}
                key={card.id}
                variants={welcomeIntroduceStageItemVariants}
              >
                <WelcomeWorkoutCard
                  bookmarkLabel={bookmarkLabel}
                  caloriesUnit={caloriesUnit}
                  caloriesValue={copy.caloriesValue}
                  category={copy.category}
                  categoryTone={card.categoryTone}
                  coach={copy.coach}
                  durationUnit={durationUnit}
                  durationValue={copy.durationValue}
                  ratingUnit={ratingUnit}
                  ratingValue={copy.ratingValue}
                  title={copy.title}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
