import type { UseWelcomeIntroduceReturn } from "@/modules/app/lib/use-welcome-introduce";

export type WelcomeIntroduceCarouselSectionProps = Pick<
  UseWelcomeIntroduceReturn,
  "t" | "onSwiper" | "onSlideChange" | "carouselSpeed" | "textDirection"
> & {
  className?: string;
};
