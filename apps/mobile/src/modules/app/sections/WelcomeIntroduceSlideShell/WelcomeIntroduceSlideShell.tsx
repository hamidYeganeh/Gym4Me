"use client";

import { MediaImage } from "@repo/ui/common/MediaImage";
import { welcomeIntroduceSlideShellVariants } from "./WelcomeIntroduceSlideShell.styles";
import type { WelcomeIntroduceSlideShellProps } from "./WelcomeIntroduceSlideShell.types";

export function WelcomeIntroduceSlideShell({
  className,
  title,
  imageSrc,
  priority = false,
}: WelcomeIntroduceSlideShellProps) {
  const styles = welcomeIntroduceSlideShellVariants();

  return (
    <section aria-label={title} className={styles.root({ className })}>
      <MediaImage
        alt=""
        aria-hidden
        className={styles.image()}
        image={imageSrc}
        priority={priority}
        sizes="100vw"
      />
    </section>
  );
}
