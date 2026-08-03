"use client";

import { useTranslations } from "next-intl";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingThemeToggle } from "../../lib/marketing-theme-toggle";

export function MarketingHeaderSection() {
  const t = useTranslations("MarketingLanding.header");

  return (
    <header className="c-header">
      <div className="c-header_col">
        <p className="c-text -body-regular">
          <Ltr>{t("brand")}</Ltr>
        </p>
        <p className="c-text -body-regular || u-hidden-md">{t("version")}</p>
      </div>
      <div className="c-header_col  || -center">
        <a
          className="c-text -body-regular || u-hover-underline"
          href="https://github.com/locomotivemtl/locomotive-scroll"
          data-load="false"
        >
          <span>{t("github")}</span>
          <span className="u-external-icon" aria-hidden={true}>
            ↗
          </span>
        </a>
      </div>
      <div className="c-header_col">
        <div className="c-header_actions">
          <MarketingThemeToggle />
          <a
            className="c-text -body-regular || u-hover-underline"
            href="#features"
            data-load="false"
          >
            <span>{t("docs")}</span>
            <span className="u-external-icon" aria-hidden={true}>
              ↗
            </span>
          </a>
        </div>
        <p className="u-hidden-md">
          <Ltr>{t("copyright")}</Ltr>
        </p>
      </div>
    </header>
  );
}
