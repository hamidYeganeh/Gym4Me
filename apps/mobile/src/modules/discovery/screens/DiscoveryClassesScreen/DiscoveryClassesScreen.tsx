"use client";

import { Typography } from "@heroui/react/typography";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { discoveryClassesScreenStyles as styles } from "./DiscoveryClassesScreen.styles";
import type { DiscoveryClassesScreenProps } from "./DiscoveryClassesScreen.types";

export function DiscoveryClassesScreen({
  classes,
  filters,
  activeFilter,
  onFilterChange,
  isLoading,
  isError,
  isStale,
  onRetry,
}: DiscoveryClassesScreenProps) {
  const t = useTranslations("DiscoveryClasses");
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
            : t("resultsCount", { count: classes.length })}
        </Typography>

        {isStale ? (
          <Typography className={styles.meta} type="body-sm">
            {t("staleData")}
          </Typography>
        ) : null}

        {isLoading && classes.length === 0 ? null : isError ? (
          <EmptyState
            className={styles.empty}
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
        ) : classes.length === 0 ? (
          <EmptyState
            className={styles.empty}
            description={t("emptyBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.empty}
            illustrationAlt=""
            title={t("emptyTitle")}
          />
        ) : (
          <div className={styles.list}>
            {classes.map((item) => {
              const href = `/discovery/classes/${item.id}?clubId=${encodeURIComponent(item.clubId)}`;
              return (
                <ClubClassCard
                  actionLabel={t("viewClass")}
                  author={item.author}
                  backgroundImage={item.backgroundImage}
                  backgroundImageAlt={item.title}
                  category={item.category}
                  className={styles.card}
                  date={item.date}
                  duration={item.duration}
                  key={`${item.clubId}-${item.id}`}
                  onAction={() => router.push(href)}
                  size="md"
                  title={item.title}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
