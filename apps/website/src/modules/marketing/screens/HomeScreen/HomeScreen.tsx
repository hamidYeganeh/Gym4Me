"use client";

import { MarketingFeaturesSection } from "../../sections/MarketingFeaturesSection";
import { MarketingFooterSection } from "../../sections/MarketingFooterSection";
import { MarketingHeaderSection } from "../../sections/MarketingHeaderSection";
import { MarketingHeroSection } from "../../sections/MarketingHeroSection";
import { MarketingPerksSection } from "../../sections/MarketingPerksSection";
import { MarketingShowcaseSection } from "../../sections/MarketingShowcaseSection";
import { MarketingToolsSection } from "../../sections/MarketingToolsSection";
import { useMarketingScroll } from "../../lib/scroll";

export function HomeScreen() {
  const scrollRootRef = useMarketingScroll();

  return (
    <>
      {/* Preloader */}
      <div className="c-preloader" />

      <div data-load-container="" ref={scrollRootRef}>
        <div data-module-scroll="main">
          <MarketingHeaderSection />
          <main>
            <MarketingHeroSection />
            <MarketingPerksSection />
            <MarketingToolsSection />
            <MarketingFeaturesSection />
            <MarketingShowcaseSection />
            <MarketingFooterSection />
          </main>
        </div>
      </div>
    </>
  );
}
