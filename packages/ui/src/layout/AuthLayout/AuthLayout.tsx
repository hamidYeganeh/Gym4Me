"use client";

import { Typography } from "@heroui/react";
import { Logo } from "../../common/Logo";
import { MediaImage } from "../../common/MediaImage";
import { authLayoutVariants } from "./AuthLayout.styles";
import type { AuthLayoutProps, AuthLayoutTone } from "./AuthLayout.types";

export function AuthLayout({
  children,
  labels,
  heroSrc,
  tone: toneProp,
  showBrand = true,
  topStart,
  figure,
  footer,
  belowForm,
  className,
}: AuthLayoutProps) {
  const tone: AuthLayoutTone = heroSrc
    ? (toneProp ?? "hero")
    : (toneProp ?? "plain");
  const styles = authLayoutVariants({ tone });
  const showBrandName = showBrand && !labels.title;

  return (
    <div
      className={styles.shell({ className })}
      {...(tone === "dark" || tone === "hero"
        ? { "data-theme": "dark" as const }
        : {})}
    >
      {heroSrc ? (
        <div aria-hidden className={styles.media()}>
          <MediaImage
            alt=""
            aria-hidden
            className={styles.mediaImage()}
            image={heroSrc}
            priority
            sizes="100vw"
          />
          <div className={styles.mediaOverlay()} />
          <div className={styles.mediaVignette()} />
        </div>
      ) : null}

      <section className={styles.panel()} aria-label={labels.heroAlt}>
        {topStart ? <div className={styles.topBar()}>{topStart}</div> : null}

        {showBrand ? (
          <div className={styles.brand()} aria-label={labels.brandAriaLabel}>
            <span className={styles.brandGlow()} />
            <Logo
              className={styles.brandMark()}
              shadow
              size={tone === "hero" ? "3xl" : "2xl"}
              title={labels.brandAriaLabel}
            />
            {showBrandName ? (
              <h1 className={styles.brandName()}>{labels.brandAriaLabel}</h1>
            ) : null}
          </div>
        ) : null}

        {figure ? <div className={styles.figure()}>{figure}</div> : null}

        {tone === "hero" ? (
          <div className={styles.spacer()} aria-hidden />
        ) : null}

        {labels.title || labels.subtitle ? (
          <header className={styles.header()}>
            {labels.title ? (
              <Typography className={styles.title()} type="h1" weight="bold">
                {labels.title}
              </Typography>
            ) : null}
            {labels.subtitle ? (
              <Typography
                className={styles.subtitle()}
                {...(tone === "dark" || tone === "hero" ? {} : { color: "muted" as const })}
              >
                {labels.subtitle}
              </Typography>
            ) : null}
          </header>
        ) : null}

        <div className={styles.body()}>
          <div className={styles.formSlot()}>{children}</div>
          {belowForm ? (
            <div className={styles.belowForm()}>{belowForm}</div>
          ) : null}
        </div>

        {tone === "plain" || tone === "dark" ? (
          <div className={styles.spacer()} aria-hidden />
        ) : null}

        {footer ? <div className={styles.footer()}>{footer}</div> : null}
      </section>
    </div>
  );
}
