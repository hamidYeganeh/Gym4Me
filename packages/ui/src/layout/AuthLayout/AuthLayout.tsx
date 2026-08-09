"use client";

import { Typography } from "@heroui/react";
import { Logo } from "../../common/Logo";
import { Gym4MeHelloEffect } from "../../kit/Gym4MeHelloEffect";
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
      {heroSrc ? (
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
      ) : null}

      <section className={styles.panel()} aria-label={labels.heroAlt}>
        <div className={styles.brand()} aria-label={labels.brandAriaLabel}>
          <span className={styles.brandGlow()} />
          <Logo
            className={styles.brandMark()}
            shadow
            size="3xl"
            title={labels.brandAriaLabel}
          />
          <Gym4MeHelloEffect
            className={styles.brandName()}
            speed={1.8}
          />
        </div>

        <header className={styles.header()}>
          {labels.title ? (
            <Typography className={styles.title()} type="h1" weight="bold">
              {labels.title}
            </Typography>
          ) : null}
          <Typography
            className={styles.subtitle()}
            {...(labels.title ? { color: "muted" as const } : {})}
          >
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
