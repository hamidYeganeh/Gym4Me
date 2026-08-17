import { ShapeCircle } from "@repo/icons";
import { useTranslations } from "next-intl";
import { Ltr } from "../../lib/marketing-bidi";
import { MarketingGlyph } from "../../lib/marketing-glyph";

export function MarketingToolsSectionHeader() {
  const t = useTranslations("MarketingLanding.tools");

  return (
    <>
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
    </>
  );
}

export type MarketingToolItem = {
  index: string;
  label: string;
  title: string;
  description: string;
};

export function MarketingToolPanelHead({ item }: { item: MarketingToolItem }) {
  return (
    <div className="c-tool_head">
      <span className="c-tool_index">
        <Ltr>{item.index}</Ltr>
      </span>
      <span className="c-tool_label">{item.label}</span>
      <span className="c-tool_description">{item.description}</span>
      <h3 className="c-tool_title || c-heading -h2">{item.title}</h3>
    </div>
  );
}
