"use client";

import { Typography } from "@heroui/react/typography";
import { statsColors } from "@repo/theme";
import { Logo } from "@repo/ui/common/Logo";
import { GlyphText } from "@repo/ui/kit/GlyphText";
import { splashScreenVariants } from "./SplashScreen.styles";
import type { SplashScreenProps } from "./SplashScreen.types";

/** Theme `--background`: light mark on light theme, dark mark on dark (same as splash assets). */
const SPLASH_INK = "var(--background)";

/** Sweep band: theme stats palette + brand accent. */
const SPLASH_GLYPH_COLORS = [
  statsColors.purple,
  statsColors.red,
  statsColors.yellow,
  statsColors.orange,
  "var(--accent)",
  statsColors.blue,
];

export function SplashScreen({ brand, taglines }: SplashScreenProps) {
  const styles = splashScreenVariants();

  return (
    <main className={styles.root()}>
      <div className={styles.markAnchor()}>
        <Logo color={SPLASH_INK} gradient={false} shadow={false} size="5xl" />
        <div className={styles.copy()}>
          <Typography
            className={styles.brand()}
            style={{ color: SPLASH_INK }}
            type="h1"
            weight="bold"
          >
            {brand}
          </Typography>

          <Typography className={styles.tagline()} type="body">
            <GlyphText
              colors={SPLASH_GLYPH_COLORS}
              delay={0.35}
              dir="rtl"
              duration={1.35}
              fixedWidth
              repeat
              repeatDelay={0.85}
              startOnView={false}
              text={taglines}
              textColor={SPLASH_INK}
            />
          </Typography>
        </div>
      </div>
    </main>
  );
}
