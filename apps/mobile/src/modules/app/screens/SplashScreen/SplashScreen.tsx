"use client";

import { Logo } from "@repo/ui/common/Logo";
import { GlyphText } from "@repo/ui/kit/GlyphText";
import { splashScreenStyles as styles } from "./SplashScreen.styles";
import type { SplashScreenProps } from "./SplashScreen.types";

export function SplashScreen({ brand, taglines }: SplashScreenProps) {
  return (
    <main className={styles.root}>
      <div aria-hidden className={styles.glow} />
      <div className={styles.content}>
        <Logo gradient={false} size="xl" />
        <h1 className={styles.brand}>
          <GlyphText
            delay={0.15}
            dir="ltr"
            duration={1.6}
            startOnView={false}
            text={brand}
            textColor="var(--foreground)"
          />
        </h1>
        <p className={styles.tagline}>
          <GlyphText
            delay={1.7}
            dir="rtl"
            duration={1.35}
            fixedWidth
            repeat
            repeatDelay={0.85}
            startOnView={false}
            text={taglines}
            textColor="var(--muted)"
          />
        </p>
      </div>
    </main>
  );
}
