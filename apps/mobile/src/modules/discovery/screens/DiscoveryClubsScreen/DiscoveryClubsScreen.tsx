"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
        <Header
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={styles.content}>
        <section className={styles.intro}>
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
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
