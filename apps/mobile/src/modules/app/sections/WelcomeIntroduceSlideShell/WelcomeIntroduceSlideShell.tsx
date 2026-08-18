"use client";

import Image from "next/image";
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
      <Image
        alt=""
        className={styles.image()}
        fill
        priority={priority}
        sizes="100vw"
        src={imageSrc}
      />
    </section>
  );
}
