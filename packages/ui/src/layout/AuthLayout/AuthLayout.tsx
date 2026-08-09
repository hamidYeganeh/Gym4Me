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
      <div aria-hidden className={styles.media()}>
        <img
          alt=""
          className={styles.mediaImage()}
          decoding="async"
          src={heroSrc}
        />
        <div className={styles.mediaOverlay()} />
        <div className={styles.mediaVignette()} />
      </div>

      <section className={styles.panel()} aria-label={labels.heroAlt}>
        <div className={styles.brand()} aria-label={labels.brandAriaLabel}>
          <span className={styles.brandGlow()} />
          <Logo
            className={styles.brandMark()}
            shadow
            size="3xl"
            title={labels.brandAriaLabel}
          />
          <span className={styles.brandName()}>{labels.brandAriaLabel}</span>
        </div>

        <header className={styles.header()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {labels.title}
          </Typography>
          <Typography className={styles.subtitle()} color="muted">
            {labels.subtitle}
          </Typography>
        </header>

        <div className={styles.spacer()} aria-hidden />

        <div className={styles.body()}>
          <div className={styles.formSlot()}>{children}</div>
          {belowForm ? (
            <div className={styles.belowForm()}>{belowForm}</div>
          ) : null}
          {footer ? <div className={styles.footer()}>{footer}</div> : null}
        </div>
      </section>
    </div>
  );
}
