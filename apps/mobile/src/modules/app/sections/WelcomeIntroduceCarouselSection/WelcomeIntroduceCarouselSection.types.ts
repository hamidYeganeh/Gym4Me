import type { useTranslations } from "next-intl";

export type WelcomeIntroduceCarouselSectionProps = {
  emblaRef: (node: HTMLElement | null) => void;
  t: ReturnType<typeof useTranslations<"Mobile.WelcomeIntroduce">>;
  className?: string;
};
