"use client";

import { BrandText } from "@repo/ui/kit/LineShadowText";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingThemeToggle } from "../../lib/marketing-theme-toggle";

export function MarketingHeaderSection() {
  const t = useTranslations("MarketingLanding.header");

  return (
    <header className="c-header">
      <div className="c-header_col">
        <p className="c-text -body-regular">
          <Ltr>
            <BrandText shadow="foreground">{t("brand")}</BrandText>
          </Ltr>
        </p>
        <p className="c-text -body-regular || u-hidden-md">{t("version")}</p>
      </div>
      <div className="c-header_col  || -center">
        <Link
          className="c-text -body-regular || u-hover-underline"
          href="/clubs"
          data-load="false"
        >
          <span>{t("directory")}</span>
        </Link>
      </div>
      <div className="c-header_col">
        <div className="c-header_actions">
          <MarketingThemeToggle />
          <Link
            className="c-text -body-regular || u-hover-underline"
            href="/pricing"
            data-load="false"
          >
            <span>{t("pricing")}</span>
          </Link>
        </div>
        <p className="u-hidden-md">
          <Ltr>{t("copyright")}</Ltr>
        </p>
      </div>
    </header>
  );
}
