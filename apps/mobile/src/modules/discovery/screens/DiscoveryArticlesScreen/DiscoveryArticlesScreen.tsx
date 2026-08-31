"use client";

import { useEffect, useRef } from "react";
import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { ArticleCard, ArticleCardSkeleton } from "@repo/ui/cards/ArticleCard";
import { EMPTY_STATE_ILLUSTRATIONS, EmptyState } from "@repo/ui/kit/EmptyState";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { ARTICLE_BROWSE_KINDS } from "../../lib/articles-browse";
import { discoveryArticlesScreenStyles as styles } from "./DiscoveryArticlesScreen.styles";
import type { DiscoveryArticlesScreenProps } from "./DiscoveryArticlesScreen.types";

const SKELETON_COUNT = 3;

export function DiscoveryArticlesScreen({
  articles,
  total,
  activeKind,
  onKindChange,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  error = null,
  onLoadMore,
  onRetry,
}: DiscoveryArticlesScreenProps) {
  const t = useTranslations("DiscoveryArticles");
  const tArticles = useTranslations("Articles");
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [error, hasMore, onLoadMore]);

  const showInitialSkeletons = isLoading && articles.length === 0;
  const showEmpty = !isLoading && !error && articles.length === 0;
  const showError = Boolean(error) && articles.length === 0;

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
          <FilterChip
            selected={activeKind === "all"}
            onPress={() => onKindChange("all")}
          >
            {t("filterAll")}
          </FilterChip>
          {ARTICLE_BROWSE_KINDS.map((kind) => (
            <FilterChip
              key={kind}
              selected={activeKind === kind}
              onPress={() => onKindChange(kind)}
            >
              {tArticles(`kinds.${kind}`)}
            </FilterChip>
          ))}
        </FilterChipBar>

        <Typography className={styles.meta} type="body-sm">
          {isLoading && articles.length === 0
            ? t("loading")
            : t("resultsCount", { count: total })}
        </Typography>

        {showInitialSkeletons ? (
          <div aria-busy="true" aria-live="polite" className={styles.list}>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <ArticleCardSkeleton key={`article-skeleton-${index}`} />
            ))}
          </div>
        ) : null}

        {showError ? (
          <EmptyState
            className={styles.empty}
            description={t("errorBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.empty}
            illustrationAlt=""
            primaryAction={{ label: t("retry"), onPress: onRetry }}
            status="danger"
            title={t("errorTitle")}
          />
        ) : null}

        {showEmpty ? (
          <EmptyState
            className={styles.empty}
            description={t("emptyBody")}
            illustration={EMPTY_STATE_ILLUSTRATIONS.empty}
            illustrationAlt=""
            title={t("emptyTitle")}
          />
        ) : null}

        {articles.length > 0 ? (
          <div className={styles.list}>
            {articles.map((article) => (
              <ArticleCard
                actionLabel={article.title}
                author={{
                  name: article.authorName,
                  avatarSrc: article.authorAvatarSrc,
                }}
                category={tArticles(`kinds.${article.kind}`)}
                coverSrc={article.coverSrc}
                excerpt={article.excerpt ?? undefined}
                key={article.id}
                orientation="vertical"
                publishedAtLabel={article.publishedAtLabel}
                readingTimeLabel={t("readingTime", {
                  minutes: article.readingTimeMinutes,
                })}
                title={article.title}
                type="cover"
                onPress={() => router.push(article.href)}
              />
            ))}
          </div>
        ) : null}

        {articles.length > 0 && (hasMore || isFetchingMore || error) ? (
          <div className={styles.sentinel} ref={sentinelRef}>
            {isFetchingMore ? (
              <Spinner aria-label={t("loadingMore")} size="sm" />
            ) : error ? (
              <Button variant="primary" onPress={onLoadMore} size="lg">
                {t("retry")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
