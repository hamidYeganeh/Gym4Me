"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { SportCard } from "@repo/ui/cards/SportCard";
import { SportCategoryCardSkeleton } from "@repo/ui/cards/SportCategoryCard";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
          <span aria-hidden className={styles.introAccent} />
          <Typography className={styles.introTitle} type="h1" weight="bold">
            {t("title")}
          </Typography>
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

        {isLoading && sports.length === 0 ? (
          <div className={styles.grid}>
            <SportCategoryCardSkeleton className={styles.card} />
            <SportCategoryCardSkeleton className={styles.card} />
            <SportCategoryCardSkeleton className={styles.card} />
            <SportCategoryCardSkeleton className={styles.card} />
          </div>
        ) : sports.length === 0 ? (
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
                  className={
                    index === 0 ? styles.cardFeatured : styles.card
                  }
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
