"use client";

import { useTranslations } from "next-intl";
import { MarketingToolsInviewPanel } from "./MarketingToolsInviewPanel";
import { MarketingToolsParallaxPanel } from "./MarketingToolsParallaxPanel";
import { MarketingToolsProgressPanel } from "./MarketingToolsProgressPanel";
import {
  MarketingToolsSectionHeader,
  type MarketingToolItem,
} from "./MarketingToolsSectionHeader";

export function MarketingToolsSection() {
  const t = useTranslations("MarketingLanding.tools");
  const items = t.raw("items") as MarketingToolItem[];

  return (
    <section
      className="u-relative || u-clipped || u-padding-bottom-2xl"
      data-theme="blue"
    >
      <MarketingToolsSectionHeader />
      <MarketingToolsInviewPanel item={items[0]!} />
      <MarketingToolsProgressPanel item={items[1]!} />
      <MarketingToolsParallaxPanel item={items[2]!} />
    </section>
  );
}
