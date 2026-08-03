"use client";

import { ShapeCircle } from "@repo/icons";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingGlyph } from "../../lib/marketing-glyph";

export function MarketingToolsSection() {
  const t = useTranslations("MarketingLanding.tools");
  const items = t.raw("items") as Array<{
    index: string;
    label: string;
    title: string;
    description: string;
  }>;

  return (
    <section
      className="u-relative || u-clipped || u-padding-bottom-2xl"
      data-theme="blue"
    >
      <div
        className="c-header-theme-toggler"
        data-scroll=""
        data-scroll-repeat=""
        data-scroll-call="changeHeaderTheme"
        data-scroll-offset="100%"
      ></div>

      <h2 className="c-heading-serif -large || c-section-heading || u-padding-bottom-3xl u-padding-top-md">
        <span className="c-section-heading_line">
          <span className="c-section-heading_word">{t("titleLine1")}</span>
        </span>
        <span className="c-section-heading_line">
          <span className="c-section-heading_word">{t("titleLine2")}</span>

          <span className="c-text -body-medium || c-section-heading_label -left">
            <MarketingGlyph icon={ShapeCircle} size={14} />
            {t("labelLeft")}
          </span>

          <span className="c-text -body-medium || c-section-heading_label -right">
            {t("labelRight")}
            <MarketingGlyph icon={ShapeCircle} size={14} />
          </span>
        </span>
      </h2>

      <div
        className="c-tool -inview"
        data-scroll=""
        data-scroll-offset="5%"
      >
        <div className="o-container">
          <div className="c-tool_head">
            <span className="c-tool_index">
              <Ltr>{items[0].index}</Ltr>
            </span>
            <span className="c-tool_label">{items[0].label}</span>
            <span className="c-tool_description">{items[0].description}</span>
            <h3 className="c-tool_title || c-heading -h2">{items[0].title}</h3>
          </div>
        </div>

        <div
          className="c-tool_playground"
          style={{ "--container-ratio": "7/5" } as CSSProperties}
        >
          <div
            className="c-tool_shape -first"
            data-scroll=""
            data-scroll-offset="10%"
            data-scroll-repeat=""
          >
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.01"
              data-scroll-css-progress=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-inview-01"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#inview-01"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -second"
            data-scroll=""
            data-scroll-offset="30%"
            data-scroll-repeat=""
          >
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.1"
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-inview-02"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#inview-02"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -third"
            data-scroll=""
            data-scroll-offset="25%"
            data-scroll-repeat=""
          >
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.02"
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-inview-03"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#inview-03"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -fourth"
            data-scroll=""
            data-scroll-offset="45%"
            data-scroll-repeat=""
          >
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.05"
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-inview-04"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#inview-04"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -fifth"
            data-scroll=""
            data-scroll-offset="20%"
            data-scroll-repeat=""
          >
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.15"
              data-scroll-css-progress=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-inview-05"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#inview-05"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -sixth"
            data-scroll=""
            data-scroll-offset="60%"
            data-scroll-repeat=""
          >
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.05"
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-inview-06"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#inview-06"></use>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="c-tool -progress"
        data-scroll=""
        data-scroll-offset="5%"
      >
        <div className="o-container">
          <div className="c-tool_head">
            <span className="c-tool_index">
              <Ltr>{items[1].index}</Ltr>
            </span>
            <span className="c-tool_label">{items[1].label}</span>
            <span className="c-tool_description">{items[1].description}</span>
            <h3 className="c-tool_title || c-heading -h2">{items[1].title}</h3>
          </div>
        </div>

        <div
          className="c-tool_playground"
          style={{ "--container-ratio": "12/5" } as CSSProperties}
        >
          <div
            className="c-tool_shape -first"
            style={{ "--index": "-2" } as CSSProperties}
            data-scroll=""
            data-scroll-css-progress=""
          >
            <div className="c-tool_shape_inner">
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-progress-01"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#progress-01"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -second"
            style={{ "--index": "-1" } as CSSProperties}
            data-scroll=""
            data-scroll-css-progress=""
          >
            <div className="c-tool_shape_inner">
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-progress-02"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#progress-02"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -third"
            style={{ "--index": "0" } as CSSProperties}
            data-scroll=""
            data-scroll-css-progress=""
          >
            <div className="c-tool_shape_inner">
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-progress-03"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#progress-03"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -fourth"
            style={{ "--index": "1" } as CSSProperties}
            data-scroll=""
            data-scroll-css-progress=""
          >
            <div className="c-tool_shape_inner">
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-progress-04"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#progress-04"></use>
                </svg>
              </span>
            </div>
          </div>
          <div
            className="c-tool_shape -fifth"
            style={{ "--index": "2" } as CSSProperties}
            data-scroll=""
            data-scroll-css-progress=""
          >
            <div className="c-tool_shape_inner">
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-progress-05"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#progress-05"></use>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="c-tool -parallax"
        data-scroll=""
        data-scroll-offset="5%"
      >
        <div className="o-container">
          <div className="c-tool_head">
            <span className="c-tool_index">
              <Ltr>{items[2].index}</Ltr>
            </span>
            <span className="c-tool_label">{items[2].label}</span>
            <span className="c-tool_description">{items[2].description}</span>
            <h3 className="c-tool_title || c-heading -h2">{items[2].title}</h3>
          </div>
        </div>

        <div
          className="c-tool_playground"
          style={{ "--container-ratio": "10/5" } as CSSProperties}
        >
          <div className="c-tool_shape -first">
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.04"
              data-scroll-enable-touch-speed=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-parallax-01"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#parallax-01"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className="c-tool_shape -second">
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.2"
              data-scroll-enable-touch-speed=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-parallax-02"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#parallax-02"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className="c-tool_shape -third">
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.3"
              data-scroll-enable-touch-speed=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-parallax-03"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#parallax-03"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className="c-tool_shape -fourth">
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.15"
              data-scroll-enable-touch-speed=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-parallax-04"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#parallax-04"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className="c-tool_shape -fifth">
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed="0.25"
              data-scroll-enable-touch-speed=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className="svg-parallax-05"
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href="/assets/images/sprite.svg#parallax-05"></use>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
