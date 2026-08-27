"use client";

import { BrandText } from "@repo/ui/kit/LineShadowText";
import { Logo } from "@repo/ui/common/Logo";
import { splashScreenVariants } from "./SplashScreen.styles";
import type { SplashScreenProps } from "./SplashScreen.types";

/** Theme `--background`: light mark on light theme, dark mark on dark (same as splash assets). */
const SPLASH_INK = "var(--background)";

/** Matches native splash.png logo size (LOGO_SIZES 5xl = 180). */
export const SPLASH_LOGO_SIZE = "3xl" as const;

export function SplashScreen({ brand }: SplashScreenProps) {
  const styles = splashScreenVariants();

  return (
    <main className={styles.root()}>
      <div className={styles.markAnchor()}>
        <Logo
          color={SPLASH_INK}
          gradient={false}
          shadow={false}
          size={SPLASH_LOGO_SIZE}
        />
        <div className={styles.copy()}>
          <BrandText
            as="h1"
            className={styles.brand()}
            shadowColor="color-mix(in oklab, var(--foreground) 30%, transparent)"
            style={{ color: SPLASH_INK }}
          >
            {brand}
          </BrandText>
        </div>
      </div>
    </main>
  );
}
