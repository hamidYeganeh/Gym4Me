"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import {
  WELCOME_INTRODUCE_SLIDE_COUNT,
} from "@/modules/app/lib/welcome-introduce-data";
import { markWelcomeSeen } from "@/modules/app/lib/welcome-storage";
import { readDocumentDirection } from "@/modules/app/lib/onboarding-helpers";
import { roleHomePath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { SWIPER_SPEED } from "@repo/ui/lib/swiper";

export function useWelcomeIntroduce() {
  const t = useTranslations("Mobile.WelcomeIntroduce");
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { isAuthenticated, activeRole, isReady } = useAuth();
  const [textDirection] = useState<"rtl" | "ltr">(readDocumentDirection);
  const [slide, setSlide] = useState(0);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const carouselSpeed = reduceMotion
    ? SWIPER_SPEED.instant
    : SWIPER_SPEED.smooth;

  const onSwiper = useCallback((swiper: SwiperInstance) => {
    swiperRef.current = swiper;
    setSlide(swiper.activeIndex);
  }, []);

  const onSlideChange = useCallback((swiper: SwiperInstance) => {
    setSlide(swiper.activeIndex);
  }, []);

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
    swiperRef.current?.slidePrev();
  };

  const goNext = () => {
    if (slide >= WELCOME_INTRODUCE_SLIDE_COUNT - 1) {
      finish();
      return;
    }
    swiperRef.current?.slideNext();
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
    onSwiper,
    onSlideChange,
    carouselSpeed,
    textDirection,
    slide,
    isRtl,
    onLeftPress,
    onRightPress,
    leftLabel,
    rightLabel,
  };
}

export type UseWelcomeIntroduceReturn = ReturnType<typeof useWelcomeIntroduce>;
