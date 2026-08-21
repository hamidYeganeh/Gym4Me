"use client";

import { Typography } from "@heroui/react/typography";
import { SportCard } from "@repo/ui/cards/SportCard";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoverySportsScreenStyles as styles } from "./DiscoverySportsScreen.styles";
import type { DiscoverySportsScreenProps } from "./DiscoverySportsScreen.types";
import { sportThemeForColor } from "../../lib/sports-browse-data";

export function DiscoverySportsScreen({
  sports,
  filters,
  activeFilter,
  onFilterChange,
  isLoading,
}: DiscoverySportsScreenProps) {
  const t = useTranslations("DiscoverySports");
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
          <span aria-hidden className={styles.introAccent} />
          <Typography className={styles.introSubtitle} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <FilterChipBar aria-label={t("filtersLabel")}>
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              selected={activeFilter === filter.id}
              onPress={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </FilterChip>
          ))}
        </FilterChipBar>

        <Typography className={styles.meta} type="body-sm">
          {isLoading
            ? t("loading")
            : t("resultsCount", { count: sports.length })}
        </Typography>

        {isLoading && sports.length === 0 ? null : sports.length === 0 ? (
          <EmptyState
            className={styles.empty}
            description={t("emptyBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.empty}
            illustrationAlt=""
            title={t("emptyTitle")}
          />
        ) : (
          <div className={styles.grid}>
            {sports.map((sport, index) => {
              const theme = sportThemeForColor(sport.color);
              return (
                <SportCard
                  actionLabel={t("viewSport")}
                  className={index === 0 ? styles.cardFeatured : styles.card}
                  color={theme.color}
                  foregroundColor={theme.foregroundColor}
                  key={sport.id}
                  size="sm"
                  sport={{
                    title: sport.name,
                    subtitle: sport.description ?? t("sportLabel"),
                    backgroundImage: sport.image,
                  }}
                  onPress={() => router.push(`/discovery/sports/${sport.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
