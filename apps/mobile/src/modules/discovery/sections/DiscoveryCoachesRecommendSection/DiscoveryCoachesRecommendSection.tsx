"use client";

import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import { useCallback, useEffect, useState } from "react";
import { DiscoverySectionCarousel } from "../DiscoverySectionCarousel";
import { discoveryCoachesRecommendSectionStyles as styles } from "./DiscoveryCoachesRecommendSection.styles";
import type { DiscoveryCoachesRecommendSectionProps } from "./DiscoveryCoachesRecommendSection.types";

export function DiscoveryCoachesRecommendSection({
  title,
  hint,
  seeAllLabel,
  newLabel,
  closeLabel,
  certifiedLabel,
  yoeLabel,
  coaches,
  dismissible = true,
  onSeeAll,
  onClose,
  onCoachPress,
}: DiscoveryCoachesRecommendSectionProps) {
  const [visibleIds, setVisibleIds] = useState(() =>
    coaches.map((coach) => coach.id),
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleCoaches = coaches.filter((coach) =>
    visibleIds.includes(coach.id),
  );

  useEffect(() => {
    setVisibleIds(coaches.map((coach) => coach.id));
    setActiveIndex(0);
  }, [coaches]);

  const dismissCoach = useCallback(
    (id: string) => {
      setVisibleIds((current) => current.filter((coachId) => coachId !== id));
      onClose?.(id);
    },
    [onClose],
  );

  useEffect(() => {
    if (activeIndex >= visibleCoaches.length) {
      setActiveIndex(Math.max(visibleCoaches.length - 1, 0));
    }
  }, [activeIndex, visibleCoaches.length]);

  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <Typography className={styles.title} type="h4" weight="bold">
            {title}
          </Typography>
          {hint ? (
            <Typography className={styles.hint} type="body-xs">
              {hint}
            </Typography>
          ) : null}
        </div>
        {onSeeAll ? (
          <Link className={styles.seeAll} onPress={onSeeAll}>
            {seeAllLabel}
          </Link>
        ) : null}
      </div>

      {visibleCoaches.length === 0 ? (
        <Typography className={styles.empty} type="body-sm">
          —
        </Typography>
      ) : (
        <>
          <div className={styles.carousel}>
            <DiscoverySectionCarousel
              ariaLabel={title}
              slideClassName={styles.slide}
              onSlideChange={setActiveIndex}
            >
              {visibleCoaches.map((coach) => (
                <CoachFeatureCard
                  certifiedLabel={
                    coach.isCertified ? certifiedLabel : undefined
                  }
                  closeLabel={closeLabel}
                  experienceLabel={yoeLabel(coach.yearsExperience)}
                  image={coach.image}
                  imageAlt={coach.name}
                  isNew={coach.isNew}
                  key={coach.id}
                  newLabel={newLabel}
                  rating={coach.rating}
                  ratingCount={coach.ratingCount}
                  specialty={coach.specialty}
                  title={coach.name}
                  onClose={
                    dismissible ? () => dismissCoach(coach.id) : undefined
                  }
                  onPress={() => onCoachPress?.(coach.id)}
                />
              ))}
            </DiscoverySectionCarousel>
          </div>

          {visibleCoaches.length > 1 ? (
            <div aria-hidden className={styles.dots}>
              {visibleCoaches.map((coach, index) => (
                <span
                  className={[
                    styles.dot,
                    index === activeIndex ? styles.dotActive : "",
                  ].join(" ")}
                  key={coach.id}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
