"use client";

import { Typography } from "@heroui/react/typography";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { DiscoveryBrowseClubsAllSection } from "../../sections/DiscoveryBrowseClubsAllSection";
import { DiscoveryBrowseClubsEmptySection } from "../../sections/DiscoveryBrowseClubsEmptySection";
import { DiscoveryBrowseClubsLoadingSection } from "../../sections/DiscoveryBrowseClubsLoadingSection";
import { DiscoveryBrowseClubsLocationsSection } from "../../sections/DiscoveryBrowseClubsLocationsSection";
import { DiscoveryBrowseClubsRailSection } from "../../sections/DiscoveryBrowseClubsRailSection";
import { discoveryClubsScreenStyles as styles } from "./DiscoveryClubsScreen.styles";
import type { DiscoveryClubsScreenProps } from "./DiscoveryClubsScreen.types";

export function DiscoveryClubsScreen({
  clubs,
  discoveryFilters,
  activeFilter,
  onFilterChange,
  provinces,
  cities,
  districts,
  isLoading,
}: DiscoveryClubsScreenProps) {
  const t = useTranslations("DiscoveryClubs");
  const router = useRouter();

  return (
    <AppLayout
      className={styles.root}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("title")}
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {discoveryFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              onPress={() => onFilterChange(filter.id)}
              selected={activeFilter === filter.id}
            >
              {filter.label}
            </FilterChip>
          ))}
        </FilterChipBar>

        <Typography className={styles.meta} type="body-sm">
          {isLoading
            ? t("loading")
            : t("resultsCount", { count: clubs.length })}
        </Typography>

        <DiscoveryBrowseClubsLoadingSection
          clubsCount={clubs.length}
          isLoading={isLoading}
        />

        <DiscoveryBrowseClubsRailSection clubs={clubs} variant="featured" />
        <DiscoveryBrowseClubsLocationsSection
          items={provinces}
          variant="provinces"
        />
        <DiscoveryBrowseClubsRailSection clubs={clubs} variant="nearby" />
        <DiscoveryBrowseClubsLocationsSection items={cities} variant="cities" />
        <DiscoveryBrowseClubsRailSection clubs={clubs} variant="openNow" />
        <DiscoveryBrowseClubsLocationsSection
          items={districts}
          variant="districts"
        />
        <DiscoveryBrowseClubsRailSection clubs={clubs} variant="topRated" />
        <DiscoveryBrowseClubsRailSection clubs={clubs} variant="picks" />
        <DiscoveryBrowseClubsAllSection clubs={clubs} />
        <DiscoveryBrowseClubsEmptySection
          clubsCount={clubs.length}
          isLoading={isLoading}
          onViewAll={() => onFilterChange("all")}
        />
      </div>
    </AppLayout>
  );
}
