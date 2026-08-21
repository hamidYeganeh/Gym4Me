"use client";

import { Logo } from "@repo/ui/common/Logo";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import { WELCOME_INTRODUCE_SLIDE_COUNT } from "@/modules/app/lib/welcome-introduce-data";
import { useWelcomeIntroduce } from "@/modules/app/lib/use-welcome-introduce";
import { WelcomeIntroduceCarouselSection } from "@/modules/app/sections/WelcomeIntroduceCarouselSection";
import { WelcomeIntroduceFooterSection } from "@/modules/app/sections/WelcomeIntroduceFooterSection";
import { welcomeIntroduceScreenVariants } from "./WelcomeIntroduceScreen.styles";
import type { WelcomeIntroduceScreenProps } from "./WelcomeIntroduceScreen.types";

export function WelcomeIntroduceScreen({
  className,
}: WelcomeIntroduceScreenProps) {
  const styles = welcomeIntroduceScreenVariants();
  const welcome = useWelcomeIntroduce();

  return (
    <main className={styles.root({ className })}>
      <WelcomeIntroduceCarouselSection
        carouselSpeed={welcome.carouselSpeed}
        onSlideChange={welcome.onSlideChange}
        onSwiper={welcome.onSwiper}
        t={welcome.t}
        textDirection={welcome.textDirection}
      />

      <div className={styles.header()}>
        <div aria-hidden className={styles.headerFade()}>
          <ProgressiveBlur
            blurIntensity={2}
            blurLayers={8}
            className={styles.headerBlur()}
            direction="top"
          />
          <div className={styles.headerWash()} />
        </div>
        <div className={styles.brand()}>
          <Logo size="xl" title={welcome.t("brandAriaLabel")} />
        </div>
      </div>

      <div className={styles.content()}>
        <div className={styles.footerHost()}>
          <WelcomeIntroduceFooterSection
            isRtl={welcome.isRtl}
            leftLabel={welcome.leftLabel}
            onLeftPress={welcome.onLeftPress}
            onRightPress={welcome.onRightPress}
            rightLabel={welcome.rightLabel}
            slide={welcome.slide}
            slideCount={WELCOME_INTRODUCE_SLIDE_COUNT}
            subtitle={welcome.t(`slides.${welcome.slide}.subtitle`)}
            title={welcome.t(`slides.${welcome.slide}.title`)}
          />
        </div>
      </div>
    </main>
  );
}
