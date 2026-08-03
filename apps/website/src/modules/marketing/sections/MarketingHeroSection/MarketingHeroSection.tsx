"use client";

import { ArrowFatDown, ArrowRecycle, Kettlebell } from "@repo/icons";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingCtaButton } from "../../lib/marketing-cta-button";
import { MarketingGlyph } from "../../lib/marketing-glyph";
import { MARKETING_CTA } from "../../lib/marketing-home-data";

export function MarketingHeroSection() {
  const t = useTranslations("MarketingLanding.hero");

  return (
    <section className="o-container || u-relative" data-theme="blue">
      <div
        className="c-header-theme-toggler -hero"
        data-scroll=""
        data-scroll-repeat=""
        data-scroll-call="changeHeaderTheme"
        data-scroll-ignore-fold=""
      />

      <div className="c-hero">
        <div className="c-hero_sticky">
          <div className="c-hero_main">
            <div className="c-hero_heading">
              <h1 className="c-hero_title || c-heading -h1">
                <span
                  className="c-hero_line"
                  style={{ "--index": "0" } as CSSProperties}
                >
                  <span
                    className="u-glyph || c-hero_word || -hero u-marketing-glyph"
                    aria-hidden={true}
                  >
                    <Kettlebell size={72} />
                    <ArrowRecycle size={60} />
                  </span>
                </span>
                <span
                  className="c-hero_line"
                  style={{ "--index": "1" } as CSSProperties}
                >
                  <span className="c-hero_word || -hero">
                    <Ltr>{t("titleLine1")}</Ltr>
                  </span>
                </span>
                <span
                  className="c-hero_line"
                  style={{ "--index": "2" } as CSSProperties}
                >
                  <span className="c-hero_word || -hero">{t("titleLine2")}</span>
                </span>
              </h1>

              <div className="c-hero_description_container || fadeInText -blue">
                <div
                  role="group"
                  className="c-text -body-medium || u-max-w440 || c-hero_description"
                  data-module-fade-in-text=""
                  data-scroll=""
                  data-scroll-offset="10%,30%"
                  data-scroll-event-progress="fadeinTextProgress"
                >
                  {t("description")}
                </div>
                <p
                  className="c-hero_version || c-text -body-medium || u-clipped"
                  data-scroll=""
                  data-scroll-offset="25%"
                >
                  <MarketingGlyph icon={ArrowFatDown} size={28} />
                  <span>{t("version")}</span>
                </p>
              </div>
            </div>
            <nav className="c-hero_nav">
              <ul className="c-hero_links">
                <li className="c-hero_links_item">
                  <MarketingCtaButton
                    href={MARKETING_CTA.primaryHref}
                    label={t("ctaPrimary")}
                  />
                </li>
                <li className="c-hero_links_item">
                  <MarketingCtaButton
                    href={MARKETING_CTA.secondaryHref}
                    label={t("ctaSecondary")}
                    variant="outline"
                  />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
