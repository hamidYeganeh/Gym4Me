"use client";

import { Typography } from "@heroui/react";
import { Logo } from "../../common/Logo";
import { authLayoutVariants } from "./AuthLayout.styles";
import type { AuthLayoutProps } from "./AuthLayout.types";

export function AuthLayout({
  children,
  labels,
  heroSrc,
  footer,
  belowForm,
  className,
}: AuthLayoutProps) {
  const styles = authLayoutVariants();

  return (
    <div className={styles.shell({ className })} data-theme="dark">
      <section className={styles.panel()}>
        <div className={styles.brandMark()} aria-label={labels.brandAriaLabel}>
          <Logo color="currentColor" shadow={false} size="sm" />
        </div>

        <header className={styles.header()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {labels.title}
          </Typography>
          <Typography className={styles.subtitle()} color="muted">
            {labels.subtitle}
          </Typography>
        </header>

        <div className={styles.body()}>
          <div className={styles.formSlot()}>{children}</div>
          {belowForm ? (
            <div className={styles.belowForm()}>{belowForm}</div>
          ) : null}
          {footer ? <div className={styles.footer()}>{footer}</div> : null}
        </div>
      </section>

      <aside className={styles.media()}>
        <div className={styles.mediaFrame()}>
          <img
            alt={labels.heroAlt}
            className={styles.mediaImage()}
            src={heroSrc}
          />
          <div className={styles.mediaOverlay()} />
        </div>
      </aside>
    </div>
  );
}
