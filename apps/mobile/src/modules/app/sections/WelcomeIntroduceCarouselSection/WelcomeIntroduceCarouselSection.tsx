import {
  WELCOME_INTRODUCE_SLIDES,
} from "@/modules/app/lib/welcome-introduce-data";
import { WelcomeIntroduceSlideShell } from "@/modules/app/sections/WelcomeIntroduceSlideShell";
import { swiperOptions } from "@repo/ui/lib/swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { welcomeIntroduceCarouselSectionVariants } from "./WelcomeIntroduceCarouselSection.styles";
import type { WelcomeIntroduceCarouselSectionProps } from "./WelcomeIntroduceCarouselSection.types";

import "swiper/css";

export function WelcomeIntroduceCarouselSection({
  onSwiper,
  onSlideChange,
  carouselSpeed,
  textDirection,
  t,
  className,
}: WelcomeIntroduceCarouselSectionProps) {
  const styles = welcomeIntroduceCarouselSectionVariants();
  const options = swiperOptions({
    speed: carouselSpeed,
    nested: true,
    noSwiping: true,
    noSwipingSelector: "[data-welcome-nested-carousel]",
  });

  return (
    <Swiper
      {...options}
      aria-roledescription="carousel"
      className={styles.carousel({ className })}
      dir={textDirection}
      key={textDirection}
      onSlideChange={onSlideChange}
      onSwiper={onSwiper}
    >
      {WELCOME_INTRODUCE_SLIDES.map((slide, index) => (
        <SwiperSlide className={styles.slide()} key={slide.imageSrc}>
          <WelcomeIntroduceSlideShell
            imageSrc={slide.imageSrc}
            priority={index === 0}
            title={t(`slides.${index}.title`)}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
