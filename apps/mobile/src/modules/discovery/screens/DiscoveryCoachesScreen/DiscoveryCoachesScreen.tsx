"use client";

import { Typography } from "@heroui/react/typography";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

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
  isError,
  onRetry,
}: DiscoveryCoachesScreenProps) {
  const t = useTranslations("DiscoveryCoaches");
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
            : t("resultsCount", { count: coaches.length })}
        </Typography>

        {isLoading && coaches.length === 0 ? (
          <DiscoveryBrowseCoachesLoadingSection
            coachesCount={coaches.length}
            isLoading={isLoading}
          />
        ) : isError ? (
          <EmptyState
            description={t("errorBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.warning}
            illustrationAlt=""
            layout="media"
            primaryAction={
              onRetry ? { label: t("retry"), onPress: onRetry } : undefined
            }
            status="danger"
            title={t("errorTitle")}
          />
        ) : (
          <>
            <DiscoveryBrowseCoachesRailSection
              coaches={coaches}
              variant="featured"
            />
            <DiscoveryBrowseCoachesLocationsSection
              items={provinces}
              variant="provinces"
            />
            <DiscoveryBrowseCoachesRailSection
              coaches={coaches}
              variant="nearby"
            />
            <DiscoveryBrowseCoachesLocationsSection
              items={cities}
              variant="cities"
            />
            <DiscoveryBrowseCoachesRailSection
              coaches={coaches}
              variant="remote"
            />
            <DiscoveryBrowseCoachesLocationsSection
              items={districts}
              variant="districts"
            />
            <DiscoveryBrowseCoachesRailSection
              coaches={coaches}
              variant="inPerson"
            />
            <DiscoveryBrowseCoachesRailSection
              coaches={coaches}
              variant="topRated"
            />
            <DiscoveryBrowseCoachesRailSection
              coaches={coaches}
              variant="picks"
            />
            <DiscoveryBrowseCoachesAllSection coaches={coaches} />
            <DiscoveryBrowseCoachesEmptySection
              coachesCount={coaches.length}
              isLoading={isLoading}
              onViewAll={() => onFilterChange("all")}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
