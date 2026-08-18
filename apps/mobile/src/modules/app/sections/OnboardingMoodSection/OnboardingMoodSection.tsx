"use client";

import type { ComponentType } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { FaceDepressed } from "@repo/icons/FaceDepressed";
import { FaceHappy } from "@repo/icons/FaceHappy";
import { FaceNeutral } from "@repo/icons/FaceNeutral";
import { FaceOverjoyed } from "@repo/icons/FaceOverjoyed";
import { FaceSad } from "@repo/icons/FaceSad";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo } from "react";
import type { OnboardingMoodId } from "@/modules/app/lib/onboarding-data";
import { onboardingMoodSectionVariants } from "./OnboardingMoodSection.styles";
import type { OnboardingMoodSectionProps } from "./OnboardingMoodSection.types";

const MOOD_ICONS: Record<
  OnboardingMoodId,
  ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>
> = {
  depressed: FaceDepressed,
  sad: FaceSad,
  neutral: FaceNeutral,
  happy: FaceHappy,
  overjoyed: FaceOverjoyed,
};

export function OnboardingMoodSection({
  options,
  value,
  onChange,
  className,
}: OnboardingMoodSectionProps) {
  const styles = onboardingMoodSectionVariants();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const selected = options[selectedIndex] ?? options[0];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    loop: false,
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
      <div className={styles.stage()}>
        <div aria-hidden className={styles.pointer()} />
        <div aria-hidden className={styles.glow()} />
        <div aria-hidden className={styles.rings()} />
        <div aria-hidden className={styles.ringsInner()} />

        <div
          className={styles.carousel()}
          data-onboarding-nested-carousel
          ref={emblaRef}
        >
          <div className={styles.track()}>
            {slides.map((option) => {
              const active = option.id === value;
              const faceStyles = onboardingMoodSectionVariants({ active });
              const Icon = MOOD_ICONS[option.id];
              return (
                <div className={styles.slide()} key={option.id}>
                  <Button
                    aria-label={option.statement}
                    aria-pressed={active}
                    className={faceStyles.face()}
                    isIconOnly
                    size="lg"
                    variant="ghost"
                    onPress={() => {
                      onChange(option.id);
                      const index = options.findIndex(
                        (item) => item.id === option.id,
                      );
                      if (index >= 0) emblaApi?.scrollTo(index);
                    }}
                  >
                    <Icon
                      aria-hidden
                      className={faceStyles.faceIcon()}
                      size={48}
                    />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selected ? (
        <Typography className={styles.statement()}>
          {selected.statement}
        </Typography>
      ) : null}
    </div>
  );
}
