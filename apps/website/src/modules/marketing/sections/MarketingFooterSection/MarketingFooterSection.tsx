"use client";

import { Typography } from "@heroui/react";
import { ArrowRecycle, Kettlebell } from "@repo/icons";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingCtaButton } from "../../lib/marketing-cta-button";
import { MARKETING_CTA } from "../../lib/marketing-home-data";

export function MarketingFooterSection() {
  const t = useTranslations("MarketingLanding.footer");
  const attrs = t.raw("attrs") as string[][];

  return (
    <footer
      className="u-relative || c-footer || o-container || u-padding-top-sm"
      data-theme="blue"
    >
      <div
        className="c-header-theme-toggler"
        data-scroll=""
        data-scroll-repeat=""
        data-scroll-call="changeHeaderTheme"
        data-scroll-offset="100%"
      />

      <div
        aria-hidden={true}
        data-module-randomize=""
        className="c-footer_attributes || o-grid -cols"
      >
        {attrs.map((column, index) => (
          <div
            key={index}
            data-scroll=""
            data-scroll-position="end"
            data-scroll-call="randomize"
          >
            {column.map((line, lineIndex) => (
              <Typography
                key={`${index}-${lineIndex}`}
                type="body"
                render={({ children, ...domProps }) => (
                  <p {...domProps}>{children}</p>
                )}
              >
                <Ltr>{line}</Ltr>
              </Typography>
            ))}
          </div>
        ))}
      </div>

      <div className="o-grid -cols u-padding-top-lg">
        <Typography
          type="h1"
          render={({ children, ...domProps }) => <h2 {...domProps}>{children}</h2>}
          data-scroll=""
          data-scroll-event-progress="progressEvent"
          data-scroll-position="start, end"
          data-scroll-offset="100px, 75%"
          className="c-footer_thanks || c-hero_title || c-heading -h1"
        >
          {t("thanks")}
        </Typography>
      </div>

      <div className="c-hero_main || -footer || u-padding-bottom-lg">
        <div className="c-hero_heading">
          <Typography
            type="h1"
            render={({ children, ...domProps }) => <p {...domProps}>{children}</p>}
            className="c-hero_title || c-heading -h1"
            data-scroll=""
            data-scroll-position="end"
            data-scroll-repeat=""
          >
            <span
              className="c-hero_line"
              style={{ "--index": "0" } as CSSProperties}
            >
              <span
                className="u-glyph || c-hero_word || -footer u-marketing-glyph"
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
              <span className="c-hero_word || -footer">
                <Ltr>{t("titleLine1")}</Ltr>
              </span>
            </span>
            <span
              className="c-hero_line"
              style={{ "--index": "2" } as CSSProperties}
            >
              <span className="c-hero_word || -footer">{t("titleLine2")}</span>
            </span>
          </Typography>

          <Typography
            type="body"
            className="c-text -body-regular || c-footer_website"
            data-scroll=""
            data-scroll-position="end"
            data-scroll-repeat=""
          >
            {t("madeBy")}{" "}
            <a
              className="u-hover-underline"
              href="https://gym4me.ir"
              target="_blank"
            >
              <Ltr>{t("madeByLink")}</Ltr>
            </a>
          </Typography>
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
    </footer>
  );
}
