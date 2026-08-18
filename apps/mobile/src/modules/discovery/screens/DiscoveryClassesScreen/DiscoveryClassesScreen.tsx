"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ClubClassCard } from "@repo/ui/cards/ClubClassCard";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EmptyState,
} from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { discoveryClassesScreenStyles as styles } from "./DiscoveryClassesScreen.styles";
import type { DiscoveryClassesScreenProps } from "./DiscoveryClassesScreen.types";

export function DiscoveryClassesScreen({
  classes,
  filters,
  activeFilter,
  onFilterChange,
  isLoading,
}: DiscoveryClassesScreenProps) {
  const t = useTranslations("DiscoveryClasses");
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
            : t("resultsCount", { count: classes.length })}
        </Typography>

        {isLoading && classes.length === 0 ? (
          <div className={styles.list}>
            <div className="h-40 animate-pulse rounded-3xl bg-surface" />
            <div className="h-40 animate-pulse rounded-3xl bg-surface" />
            <div className="h-40 animate-pulse rounded-3xl bg-surface" />
          </div>
        ) : classes.length === 0 ? (
          <EmptyState
            className={styles.empty}
            description={t("emptyBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.search}
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
