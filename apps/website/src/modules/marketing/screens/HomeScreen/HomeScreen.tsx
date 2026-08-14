"use client";

import dynamic from "next/dynamic";
import { MarketingHeroSection } from "../../sections/MarketingHeroSection";
import { MarketingSportsSection } from "../../sections/MarketingSportsSection";
import "../../lib/marketing-landing.css";
import { ScrollSmootherProvider } from "../../lib/marketing-scroll-smoother";

const MarketingClubsSection = dynamic(
  () =>
    import("../../sections/MarketingClubsSection").then((mod) => ({
      default: mod.MarketingClubsSection,
    })),
);

const MarketingDownloadSection = dynamic(
  () =>
    import("../../sections/MarketingDownloadSection").then((mod) => ({
      default: mod.MarketingDownloadSection,
    })),
);

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
