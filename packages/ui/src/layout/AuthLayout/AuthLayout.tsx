"use client";

import { Typography } from "@heroui/react/typography";
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
  framed: framedProp,
  topStart,
  figure,
  figurePlacement = "afterHeader",
  footer,
  belowForm,
  className,
}: AuthLayoutProps) {
  const tone: AuthLayoutTone = heroSrc
    ? (toneProp ?? "hero")
    : (toneProp ?? "plain");
  const framed = framedProp ?? tone !== "hero";
  const figureFirst = figurePlacement === "beforeHeader";
  const styles = authLayoutVariants({ tone, framed, figureFirst });
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
              <Typography className={styles.brandName()} type="h1" weight="bold">
                {labels.brandAriaLabel}
              </Typography>
            ) : null}
          </div>
        ) : null}

        {tone === "hero" ? (
          <div className={styles.spacer()} aria-hidden />
        ) : null}

        {figureFirst && figure ? (
          <div className={styles.figure()}>{figure}</div>
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
                {...(tone === "dark" || tone === "hero"
                  ? {}
                  : { color: "muted" as const })}
              >
                {labels.subtitle}
              </Typography>
            ) : null}
          </header>
        ) : null}

        {!figureFirst && figure ? (
          <div className={styles.figure()}>{figure}</div>
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
