"use client";

import { Anchor, Building2, Eye } from "@repo/icons";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingGlyph } from "../../lib/marketing-glyph";
import { MARKETING_CASCADE_COUNT } from "../../lib/marketing-home-data";

export function MarketingPerksSection() {
  const t = useTranslations("MarketingLanding.perks");
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <section className="u-relative" data-theme="white">
      <div
        className="c-header-theme-toggler"
        data-scroll=""
        data-scroll-repeat=""
        data-scroll-call="changeHeaderTheme"
        data-scroll-offset="100%,0"
        data-scroll-ignore-fold=""
      />

      <div
        className="c-rail"
        data-module-rail=""
        data-values="rail"
        data-rail-direction="1"
        data-scroll=""
        data-scroll-call="toggleRail"
        data-scroll-repeat=""
      >
        <div
          className="c-rail_inner"
          data-rail="container"
          aria-hidden={true}
        >
          <div data-rail="pattern">
            <p className="c-rail_item" data-rail-item="">
              {t("rail")}
              <MarketingGlyph
                icon={Building2}
                size={36}
                className="c-rail_glyph u-glyph"
              />
            </p>
          </div>
        </div>
      </div>

      <div className="o-container">
        <div className="c-list -perks " data-scroll="">
          <ul className="c-list_inner">
            {items.map((item, index) => (
              <li
                key={item.title}
                className="c-list_item | c-text -body-regular"
                style={{ "--index": String(index) } as CSSProperties}
              >
                <div className="c-list_item_inner">
                  <p className="c-list_title || c-text -body-regular">
                    {item.title}
                  </p>
                  <p className="c-list_description || c-text -body-regular">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="o-grid -gutters -col-4@from-medium || u-margin-top-xl u-margin-bottom-3xl">
          <div className="o-grid_item u-gc-2/5@from-medium">
            <p className="c-heading -h2">{t("rewrite")}</p>
          </div>
        </div>

        <div className="c-cascade || u-margin-3xl-top" aria-hidden={true}>
          <div className="c-cascade_text || || fadeInText -white">
            <MarketingGlyph icon={Anchor} size={28} />
            <div
              className="c-text -body-medium || u-margin-top-2xs"
              role="group"
              data-module-fade-in-text=""
              data-scroll=""
              data-scroll-offset="0, 25%"
              data-scroll-event-progress="fadeinTextProgress"
            >
              {t("evolution")}
            </div>
          </div>
          <div
            className="c-cascade_container"
            data-scroll=""
            data-scroll-css-progress=""
            data-scroll-offset="10%, 60%"
          >
            <div className="c-cascade_inner">
              {Array.from({ length: MARKETING_CASCADE_COUNT }, (_, index) => (
                <div
                  key={index}
                  className="c-cascade_item || c-heading -h2"
                  style={{ "--item-index": String(index) } as CSSProperties}
                >
                  <span className="c-cascade_line">
                    <span className="c-cascade_word">
                      <Ltr>{t("cascadeBrand")}</Ltr>
                    </span>
                  </span>
                  <span className="c-cascade_line">
                    <span className="c-cascade_word">{t("cascadeWord")}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <MarketingGlyph
            icon={Eye}
            size={40}
            className="c-cascade_glyph || u-glyph"
          />
        </div>
      </div>
    </section>
  );
}
