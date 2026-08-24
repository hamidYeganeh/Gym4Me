import { DiscoveryHomeArticlesSection } from "../../sections/DiscoveryHomeArticlesSection";
import { DiscoveryHomeBannersSection } from "../../sections/DiscoveryHomeBannersSection";
import { DiscoveryHomeClubCategoriesSection } from "../../sections/DiscoveryHomeClubCategoriesSection";
import { DiscoveryHomeClubsRailSection } from "../../sections/DiscoveryHomeClubsRailSection";
import { DiscoveryHomeSportCategoriesSection } from "../../sections/DiscoveryHomeSportCategoriesSection";
import { DiscoveryHomeSportsSection } from "../../sections/DiscoveryHomeSportsSection";

type DiscoveryFeedSkeletonProps = {
  mode?: "initial" | "more";
};

export function DiscoveryFeedSkeleton({
  mode = "initial",
}: DiscoveryFeedSkeletonProps) {
  if (mode === "more") {
    return (
      <div aria-hidden="true">
        <DiscoveryHomeClubsRailSection
          ariaLabel=""
          clubs={[]}
          isLoading
          keyPrefix="discovery-feed-more-clubs"
          title=""
        />
        <DiscoveryHomeArticlesSection articles={[]} isLoading />
      </div>
    );
  }

  return (
    <div aria-hidden="true">
      <DiscoveryHomeBannersSection banners={[]} isLoading />
      <DiscoveryHomeClubCategoriesSection categories={[]} isLoading />
      <DiscoveryHomeSportCategoriesSection categories={[]} isLoading />
      <DiscoveryHomeSportsSection isLoading sports={[]} />
      <DiscoveryHomeClubsRailSection
        ariaLabel=""
        clubs={[]}
        isLoading
        keyPrefix="discovery-feed-initial-clubs"
        title=""
      />
    </div>
  );
}
