"use client";

import { Anchor } from "@repo/icons/Anchor";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingGlyph } from "../../lib/marketing-glyph";

export function MarketingShowcaseSection() {
  const t = useTranslations("MarketingLanding.showcase");
  const items = t.raw("items") as Array<{ title: string; url: string }>;

  return (
    <section
      className="u-relative || u-padding-bottom-2xl"
      data-theme="white"
      id="showcase"
    >
      <div
        className="c-header-theme-toggler"
        data-scroll=""
        data-scroll-repeat=""
        data-scroll-call="changeHeaderTheme"
        data-scroll-offset="100%"
      />

      <div
        className="c-sticky-heading"
        data-scroll=""
        data-scroll-offset="100%, 100%"
        data-scroll-css-progress=""
      >
        <div className="c-sticky-heading_inner || o-container">
          <div className="c-sticky-heading_text">
            <div className="c-sticky-heading_description || fadeInText -white">
              <div className="c-text -body-medium">
                <MarketingGlyph icon={Anchor} size={28} />
                <div
                  className="u-margin-top-2xs"
                  role="group"
                  data-module-fade-in-text=""
                  data-scroll=""
                  data-scroll-offset="0, 25%"
                  data-scroll-event-progress="fadeinTextProgress"
                >
                  {t("description")}
                </div>
              </div>
            </div>
            <h2 className="c-sticky-heading_title">{t("title")}</h2>
          </div>
        </div>
      </div>

      <div className="o-container || u-margin-top-sm">
        <div className="c-list -showcase " data-scroll="">
          <ul className="c-list_inner">
            {items.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="c-list_item | c-text -body-regular"
                style={{ "--index": String(index) } as CSSProperties}
              >
                <a
                  className="c-list_item_inner u-hover-underline"
                  href={item.url}
                  target="_blank"
                >
                  <span className="c-list_title || c-text -body-regular">
                    {item.title}
                  </span>
                  <span className="c-list_description || c-text -body-regular">
                    <Ltr>{item.url}</Ltr>
                  </span>
                  <span className="c-list-anchor" aria-hidden={true}>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
