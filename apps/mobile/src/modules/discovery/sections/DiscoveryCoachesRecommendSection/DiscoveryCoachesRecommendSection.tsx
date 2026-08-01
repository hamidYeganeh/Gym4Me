"use client";

import { Link, Typography } from "@heroui/react";
import { CoachFeatureCard } from "@repo/ui/cards/CoachFeatureCard";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import { discoveryCoachesRecommendSectionStyles as styles } from "./DiscoveryCoachesRecommendSection.styles";
import type { DiscoveryCoachesRecommendSectionProps } from "./DiscoveryCoachesRecommendSection.types";

export function DiscoveryCoachesRecommendSection({
  title,
  seeAllLabel,
  newLabel,
  closeLabel,
  certifiedLabel,
  yoeLabel,
  coaches,
  onSeeAll,
  onClose,
}: DiscoveryCoachesRecommendSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
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

  const updateActiveIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || visibleCoaches.length === 0) return;

    const slide = scroller.querySelector<HTMLElement>("[data-carousel-slide]");
    if (!slide) return;

    const slideWidth = slide.offsetWidth;
    const gap = 12;
    const index = Math.round(scroller.scrollLeft / (slideWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), visibleCoaches.length - 1));
  }, [visibleCoaches.length]);

  const onScroll = useCallback(
    (_event: UIEvent<HTMLDivElement>) => {
      updateActiveIndex();
    },
    [updateActiveIndex],
  );

  const dismissCoach = useCallback(
    (id: string) => {
      setVisibleIds((current) => {
        const next = current.filter((coachId) => coachId !== id);
        return next;
      });
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
        <Typography className={styles.title} type="h4" weight="bold">
          {title}
        </Typography>
        <Link className={styles.seeAll} onPress={onSeeAll}>
          {seeAllLabel}
        </Link>
      </div>

      {visibleCoaches.length === 0 ? (
        <Typography className={styles.empty} type="body-sm">
          —
        </Typography>
      ) : (
        <>
          <div
            aria-roledescription="carousel"
            className={styles.carousel}
            onScroll={onScroll}
            ref={scrollerRef}
          >
            {visibleCoaches.map((coach) => (
              <div
                className={styles.slide}
                data-carousel-slide
                key={coach.id}
              >
                <CoachFeatureCard
                  certifiedLabel={
                    coach.isCertified ? certifiedLabel : undefined
                  }
                  closeLabel={closeLabel}
                  experienceLabel={yoeLabel(coach.yearsExperience)}
                  image={coach.image}
                  imageAlt={coach.name}
                  isNew={coach.isNew}
                  newLabel={newLabel}
                  onClose={() => dismissCoach(coach.id)}
                  rating={coach.rating}
                  ratingCount={coach.ratingCount}
                  specialty={coach.specialty}
                  title={coach.name}
                />
              </div>
            ))}
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
