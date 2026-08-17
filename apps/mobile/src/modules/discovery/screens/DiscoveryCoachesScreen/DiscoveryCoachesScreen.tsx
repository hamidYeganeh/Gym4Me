"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DiscoveryBrowseCoachesAllSection } from "../../sections/DiscoveryBrowseCoachesAllSection";
import { DiscoveryBrowseCoachesEmptySection } from "../../sections/DiscoveryBrowseCoachesEmptySection";
import { DiscoveryBrowseCoachesLoadingSection } from "../../sections/DiscoveryBrowseCoachesLoadingSection";
import { DiscoveryBrowseCoachesLocationsSection } from "../../sections/DiscoveryBrowseCoachesLocationsSection";
import { DiscoveryBrowseCoachesRailSection } from "../../sections/DiscoveryBrowseCoachesRailSection";
import { discoveryCoachesScreenStyles as styles } from "./DiscoveryCoachesScreen.styles";
import type { DiscoveryCoachesScreenProps } from "./DiscoveryCoachesScreen.types";

export function DiscoveryCoachesScreen({
  coaches,
  discoveryFilters,
  activeFilter,
  onFilterChange,
  provinces,
  cities,
  districts,
  isLoading,
}: DiscoveryCoachesScreenProps) {
  const t = useTranslations("DiscoveryCoaches");
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
            : t("resultsCount", { count: coaches.length })}
        </Typography>

        <DiscoveryBrowseCoachesLoadingSection
          coachesCount={coaches.length}
          isLoading={isLoading}
        />

        <DiscoveryBrowseCoachesRailSection coaches={coaches} variant="featured" />
        <DiscoveryBrowseCoachesLocationsSection
          items={provinces}
          variant="provinces"
        />
        <DiscoveryBrowseCoachesRailSection coaches={coaches} variant="nearby" />
        <DiscoveryBrowseCoachesLocationsSection items={cities} variant="cities" />
        <DiscoveryBrowseCoachesRailSection coaches={coaches} variant="remote" />
        <DiscoveryBrowseCoachesLocationsSection
          items={districts}
          variant="districts"
        />
        <DiscoveryBrowseCoachesRailSection coaches={coaches} variant="inPerson" />
        <DiscoveryBrowseCoachesRailSection coaches={coaches} variant="topRated" />
        <DiscoveryBrowseCoachesRailSection coaches={coaches} variant="picks" />
        <DiscoveryBrowseCoachesAllSection coaches={coaches} />
        <DiscoveryBrowseCoachesEmptySection
          coachesCount={coaches.length}
          isLoading={isLoading}
          onViewAll={() => onFilterChange("all")}
        />
      </div>
    </AppLayout>
  );
}
