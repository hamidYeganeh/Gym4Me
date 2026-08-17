import type { useTranslations } from "next-intl";

export type WelcomeIntroduceCarouselSectionProps = {
  emblaRef: (node: HTMLElement | null) => void;
  slide: number;
  textDirection: "rtl" | "ltr";
  t: ReturnType<typeof useTranslations<"Mobile.WelcomeIntroduce">>;
  className?: string;
};
