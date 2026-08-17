"use client";

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
      <div aria-hidden className={styles.glow()} />

      <div className={styles.content()}>
        <WelcomeIntroduceCarouselSection
          emblaRef={welcome.emblaRef}
          slide={welcome.slide}
          t={welcome.t}
          textDirection={welcome.textDirection}
        />

        <WelcomeIntroduceFooterSection
          isRtl={welcome.isRtl}
          leftLabel={welcome.leftLabel}
          onLeftPress={welcome.onLeftPress}
          onRightPress={welcome.onRightPress}
          rightLabel={welcome.rightLabel}
          slide={welcome.slide}
          slideCount={WELCOME_INTRODUCE_SLIDE_COUNT}
        />
      </div>
    </main>
  );
}
