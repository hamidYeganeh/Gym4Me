"use client";

import { Typography } from "@heroui/react/typography";
import { HandSwipeLeft } from "@repo/icons/HandSwipeLeft";
import {
  BodyTypeCard,
  type BodyTypeGender,
} from "@repo/ui/cards/BodyTypeCard";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo } from "react";
import { onboardingBodyTypeSectionVariants } from "./OnboardingBodyTypeSection.styles";
import type { OnboardingBodyTypeSectionProps } from "./OnboardingBodyTypeSection.types";

function toArtGender(
  gender: OnboardingBodyTypeSectionProps["gender"],
): BodyTypeGender {
  return gender === "male" ? "male" : "female";
}

export function OnboardingBodyTypeSection({
  options,
  value,
  gender,
  swipeHint,
  onChange,
  className,
}: OnboardingBodyTypeSectionProps) {
  const styles = onboardingBodyTypeSectionVariants();
  const artGender = toArtGender(gender);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const selected = options[selectedIndex] ?? options[0];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    loop: false,
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    const next = options[index];
    if (next && next.id !== value) onChange(next.id);
  }, [emblaApi, onChange, options, value]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    queueMicrotask(onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() === selectedIndex) return;
    emblaApi.scrollTo(selectedIndex);
  }, [emblaApi, selectedIndex]);

  const slides = useMemo(() => options, [options]);

  return (
    <div className={styles.root({ className })}>
      <div
        className={styles.carousel()}
        data-onboarding-nested-carousel
        ref={emblaRef}
      >
        <div className={styles.track()}>
          {slides.map((option) => (
            <div className={styles.slide()} key={option.id}>
              <BodyTypeCard
                actionLabel={option.label}
                bodyType={option.id}
                className={styles.card()}
                gender={artGender}
                isSelected={option.id === value}
                onChange={(selected) => {
                  if (!selected) return;
                  onChange(option.id);
                  const index = options.findIndex((item) => item.id === option.id);
                  if (index >= 0) emblaApi?.scrollTo(index);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.hint()}>
        <HandSwipeLeft aria-hidden className={styles.hintIcon()} size={20} />
        <Typography className={styles.hintText()}>{swipeHint}</Typography>
      </div>

      {selected ? (
        <Typography className={styles.statement()}>{selected.statement}</Typography>
      ) : null}
    </div>
  );
}
