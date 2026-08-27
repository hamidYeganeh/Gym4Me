"use client";

import { Typography } from "@heroui/react/typography";
import { useTheme } from "@repo/theme";
import {
  BrandText,
  containsBrandName,
  TextWithBrand,
} from "../../kit/LineShadowText";
import {
  estimateTextEffectDelay,
  TextEffect,
} from "../../kit/TextEffect";
import { Logo } from "../../common/Logo";
import { MediaImage } from "../../common/MediaImage";
import { ProgressiveBlur } from "../../kit/ProgressiveBlur";
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
  animateCopy = false,
  className,
}: AuthLayoutProps) {
  const { resolvedTheme } = useTheme();
  const tone: AuthLayoutTone = heroSrc
    ? (toneProp ?? "hero")
    : (toneProp ?? "plain");
  const colorScheme = resolvedTheme === "dark" ? "dark" : "light";
  const framed = framedProp ?? tone !== "hero";
  const figureFirst = figurePlacement === "beforeHeader";
  const styles = authLayoutVariants({ tone, colorScheme, framed, figureFirst });
  const showBrandName = showBrand && !labels.title;
  const inverseCopy =
    colorScheme === "dark" && (tone === "hero" || tone === "dark");

  return (
    <div className={styles.shell({ className })}>
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
          <div className={styles.mediaFade()}>
            <ProgressiveBlur
              blurIntensity={2}
              blurLayers={8}
              className={styles.mediaBlur()}
              direction="bottom"
            />
            <div className={styles.mediaWash()} />
          </div>
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
              <BrandText
                as="h1"
                className={styles.brandName()}
                shadow={inverseCopy ? "inverse" : "foreground"}
              >
                {labels.brandAriaLabel}
              </BrandText>
            ) : null}
          </div>
        ) : null}

        {tone === "hero" ? (
          <div className={styles.spacer()} aria-hidden />
        ) : null}

        {figureFirst && figure ? (
          <div className={styles.figure()} data-keyboard-hide="">
            {figure}
          </div>
        ) : null}

        {labels.title || labels.subtitle ? (
          <header className={styles.header()}>
            {labels.title ? (
              animateCopy && !containsBrandName(labels.title) ? (
                <TextEffect
                  as="h1"
                  className={styles.title()}
                  per="word"
                  preset="fade-in-blur"
                >
                  {labels.title}
                </TextEffect>
              ) : (
                <TextWithBrand
                  as="h1"
                  className={styles.title()}
                  shadow={inverseCopy ? "inverse" : "foreground"}
                >
                  {labels.title}
                </TextWithBrand>
              )
            ) : null}
            {labels.subtitle ? (
              <div data-keyboard-hide="">
                {animateCopy && !containsBrandName(labels.subtitle) ? (
                  <TextEffect
                    as="p"
                    className={styles.subtitle()}
                    delay={
                      labels.title
                        ? estimateTextEffectDelay(labels.title, {
                            per: "word",
                          })
                        : 0
                    }
                    per="word"
                    preset="fade-in-blur"
                  >
                    {labels.subtitle}
                  </TextEffect>
                ) : (
                  <TextWithBrand
                    as="p"
                    className={styles.subtitle()}
                    shadow={inverseCopy ? "inverse" : "foreground"}
                  >
                    {labels.subtitle}
                  </TextWithBrand>
                )}
              </div>
            ) : null}
          </header>
        ) : null}

        {!figureFirst && figure ? (
          <div className={styles.figure()} data-keyboard-hide="">
            {figure}
          </div>
        ) : null}

        <div className={styles.body()}>
          <div className={styles.formSlot()}>{children}</div>
          {belowForm ? (
            <div className={styles.belowForm()} data-keyboard-hide="">
              {belowForm}
            </div>
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
