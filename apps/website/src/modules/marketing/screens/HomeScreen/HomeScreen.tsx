"use client";

import { MarketingClubsSection } from "../../sections/MarketingClubsSection";
import { MarketingDownloadSection } from "../../sections/MarketingDownloadSection";
import { MarketingHeroSection } from "../../sections/MarketingHeroSection";
import { MarketingSportsSection } from "../../sections/MarketingSportsSection";
import "../../lib/marketing-landing.css";
import { ScrollSmootherProvider } from "../../lib/marketing-scroll-smoother";

export function HomeScreen() {
  return (
    <ScrollSmootherProvider>
      <div className="marketing-landing w-full overflow-x-hidden bg-background">
        <MarketingHeroSection />
        <MarketingSportsSection />
        <MarketingClubsSection />
        <MarketingDownloadSection />
      </div>
    </ScrollSmootherProvider>
  );
}
