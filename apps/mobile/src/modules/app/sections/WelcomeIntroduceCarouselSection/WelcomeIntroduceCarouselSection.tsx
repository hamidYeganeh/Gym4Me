import {
  WELCOME_INTRODUCE_SLIDES,
} from "@/modules/app/lib/welcome-introduce-data";
import { WelcomeIntroduceSlideShell } from "@/modules/app/sections/WelcomeIntroduceSlideShell";
import { welcomeIntroduceCarouselSectionVariants } from "./WelcomeIntroduceCarouselSection.styles";
import type { WelcomeIntroduceCarouselSectionProps } from "./WelcomeIntroduceCarouselSection.types";

export function WelcomeIntroduceCarouselSection({
  emblaRef,
  t,
  className,
}: WelcomeIntroduceCarouselSectionProps) {
  const styles = welcomeIntroduceCarouselSectionVariants();

  return (
    <div
      aria-roledescription="carousel"
      className={styles.carousel({ className })}
      ref={emblaRef}
    >
      <div className={styles.track()}>
        {WELCOME_INTRODUCE_SLIDES.map((slide, index) => (
          <WelcomeIntroduceSlideShell
            imageSrc={slide.imageSrc}
            key={slide.imageSrc}
            priority={index === 0}
            title={t(`slides.${index}.title`)}
          />
        ))}
      </div>
    </div>
  );
}
