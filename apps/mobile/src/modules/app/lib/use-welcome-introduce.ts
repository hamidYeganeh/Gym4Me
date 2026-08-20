"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useCallback, useEffect, useState } from "react";
import {
  WELCOME_INTRODUCE_SLIDE_COUNT,
} from "@/modules/app/lib/welcome-introduce-data";
import { markWelcomeSeen } from "@/modules/app/lib/welcome-storage";
import { readDocumentDirection } from "@/modules/app/lib/onboarding-helpers";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { EMBLA_DURATION, emblaOptions } from "@repo/ui/lib/embla";

export function useWelcomeIntroduce() {
  const t = useTranslations("Mobile.WelcomeIntroduce");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { isAuthenticated, activeRole, isReady } = useAuth();
  const [textDirection] = useState<"rtl" | "ltr">(readDocumentDirection);
  const [slide, setSlide] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    emblaOptions({
      align: "center",
      containScroll: "trimSnaps",
      direction: textDirection,
      duration: reduceMotion ? EMBLA_DURATION.instant : EMBLA_DURATION.smooth,
      watchDrag: (_api, event) => {
        const target = event.target;
        if (!(target instanceof Element)) return true;
        return !target.closest("[data-welcome-nested-carousel]");
      },
    }),
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

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
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace(roleHomePath(activeRole));
    }
  }, [activeRole, isAuthenticated, isReady, router]);

  const finish = () => {
    markWelcomeSeen();
    router.replace("/discovery");
  };

  const goPrev = () => {
    if (slide === 0) {
      router.push("/welcome");
      return;
    }
    emblaApi?.scrollPrev();
  };

  const goNext = () => {
    if (slide >= WELCOME_INTRODUCE_SLIDE_COUNT - 1) {
      finish();
      return;
    }
    emblaApi?.scrollNext();
  };

  const isRtl = textDirection === "rtl";
  const onLeftPress = isRtl ? goNext : goPrev;
  const onRightPress = isRtl ? goPrev : goNext;
  const leftLabel = isRtl
    ? slide >= WELCOME_INTRODUCE_SLIDE_COUNT - 1
      ? t("navFinish")
      : t("navNext")
    : t("navBack");
  const rightLabel = isRtl
    ? t("navBack")
    : slide >= WELCOME_INTRODUCE_SLIDE_COUNT - 1
      ? t("navFinish")
      : t("navNext");

  return {
    t,
    emblaRef,
    slide,
    isRtl,
    onLeftPress,
    onRightPress,
    leftLabel,
    rightLabel,
  };
}

export type UseWelcomeIntroduceReturn = ReturnType<typeof useWelcomeIntroduce>;
