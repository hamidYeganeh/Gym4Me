"use client";

import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import { Anchor } from "@repo/icons/Anchor";
import { useTranslations } from "next-intl";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingGlyph } from "../../lib/marketing-glyph";

function PartnerCell({
  className,
  href,
  srLabel,
  title,
  logoId,
}: {
  className: string;
  href: string;
  srLabel: string;
  title: string;
  logoId: string;
}) {
  return (
    <div className={`c-features-grid_cell ${className}`}>
      <div className="c-features-grid_cell_ratio">
        <a href={href} className="c-features-grid_link" target="_blank">
          <span className="u-screen-reader-text">{srLabel}</span>
          <span className="c-features-grid_icon-container">
            <span className="o-icon  c-features-grid_icon">
              <svg
                className="svg-arrow-external"
                focusable="false"
                aria-hidden={true}
              >
                <use href="/assets/images/sprite.svg#arrow-external" />
              </svg>
            </span>
            <span className="o-icon  c-features-grid_icon">
              <svg
                className="svg-arrow-external"
                focusable="false"
                aria-hidden={true}
              >
                <use href="/assets/images/sprite.svg#arrow-external" />
              </svg>
            </span>
          </span>
        </a>
        <div className="c-features-grid_cell_inner -logo">
          <span
            className="c-features-grid_title || c-text -body-regular"
            aria-hidden={true}
          >
            <span className="c-features-grid_title_label">{title}</span>
            <span className="c-features-grid_title_label">{title}</span>
          </span>
          <span className="o-icon  c-features-grid_logo">
            <svg
              className={`svg-${logoId}`}
              focusable="false"
              aria-hidden={true}
            >
              <use href={`/assets/images/sprite.svg#${logoId}`} />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

export function MarketingFeaturesSection() {
  const t = useTranslations("MarketingLanding.features");
  const items = t.raw("items") as Array<{
    index: string;
    title: string;
    description: string;
  }>;

  const cellClass = [
    "-scrollbar",
    "-normalized",
    "-sticky",
    "-io",
    "-scroll-to",
    "-direction",
    "-custom-easing",
  ] as const;

  return (
    <section
      className="u-relative || o-container"
      data-theme="black"
      id="features"
    >
      <div
        className="c-header-theme-toggler"
        data-scroll=""
        data-scroll-repeat=""
        data-scroll-call="changeHeaderTheme"
        data-scroll-offset="100%"
      />

      <h2 className="c-heading-serif -large || c-section-heading || u-padding-bottom-3xl u-padding-top-md">
        <span className="c-section-heading_line">
          <span className="c-section-heading_word">{t("title")}</span>
        </span>
        <span className="c-section-heading_line">
          <span className="c-section-heading_word" />
        </span>
      </h2>

      <div className="o-grid -col-2 -gutters">
        <div className="o-grid_item u-gc-2/3">
          <div className="u-max-w300 || c-text -body-medium || fadeInText -black">
            <MarketingGlyph icon={Anchor} size={28} />
            <div
              role="group"
              className="u-margin-top-sm"
              data-module-fade-in-text=""
              data-scroll=""
              data-scroll-offset="0, 25%"
              data-scroll-event-progress="fadeinTextProgress"
            >
              <TextWithBrand shadow="inverse">{t("intro")}</TextWithBrand>
            </div>
          </div>
        </div>
      </div>

      <div className="c-features-grid">
        <div className="c-features-grid_container">
          <div className="c-features-grid_inner">
            <PartnerCell
              className="-lenis -link"
              href="#features"
              srLabel={t("partnerA.sr")}
              title={t("partnerA.label")}
              logoId="logo-lenis"
            />
            <PartnerCell
              className="-locomotive -link"
              href="#features"
              srLabel={t("partnerB.sr")}
              title={t("partnerB.label")}
              logoId="logo-locomotive"
            />

            {items.map((item, index) => {
              const variant = cellClass[index];
              const extraProps =
                variant === "-io"
                  ? {
                      "data-scroll": "",
                      "data-scroll-offset": "60%",
                      "data-scroll-repeat": "",
                    }
                  : variant === "-scroll-to"
                    ? { "data-scroll": "" }
                    : {};

              if (variant === "-scroll-to") {
                return (
                  <div
                    key={item.index}
                    data-scroll=""
                    className={`c-features-grid_cell ${variant}`}
                  >
                    <span className="c-features-grid_cell_ratio">
                      <span className="c-features-grid_cell_inner">
                        <span className="c-features-grid_index || c-text -label-small">
                          <Ltr>{item.index}</Ltr>
                        </span>
                        <span className="c-features-grid_title || c-heading -h3">
                          {item.title}
                        </span>
                        <span className="c-features-grid_desc || c-text -body-regular">
                          <TextWithBrand>{item.description}</TextWithBrand>
                        </span>
                      </span>
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={item.index}
                  className={`c-features-grid_cell ${variant}`}
                  {...extraProps}
                >
                  <div className="c-features-grid_cell_ratio">
                    <div className="c-features-grid_cell_inner">
                      <span className="c-features-grid_index || c-text -label-small">
                          <Ltr>{item.index}</Ltr>
                        </span>
                      {variant === "-direction" ? (
                        <div className="c-features_direction_title">
                          <h3 className="c-features-grid_title || c-heading -h3">
                            {item.title}
                          </h3>
                          <div className="c-heading -h3 || c-features_direction_arrows">
                            <span>↓</span>
                            <span>↑</span>
                          </div>
                        </div>
                      ) : (
                        <h3 className="c-features-grid_title || c-heading -h3">
                          {item.title}
                        </h3>
                      )}
                      <p className="c-features-grid_desc || c-text -body-regular">
                        <TextWithBrand>{item.description}</TextWithBrand>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
