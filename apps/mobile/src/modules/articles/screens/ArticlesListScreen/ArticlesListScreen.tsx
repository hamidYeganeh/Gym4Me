"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import type {
  ArticleAudience,
  ArticleFacets,
  ArticleKind,
  ArticleSummary,
} from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  articleDetailHref,
  formatCategoryLabel,
  formatCount,
  formatRelativeTime,
} from "@/modules/articles/lib/format-article";
import { articlesApi, mediaFileUrl } from "@/shared/lib/api";
import { articlesListScreenVariants } from "./ArticlesListScreen.styles";
import type { ArticlesListScreenProps } from "./ArticlesListScreen.types";

export function ArticlesListScreen({ className }: ArticlesListScreenProps) {
  const t = useTranslations("Articles");
  const router = useRouter();
  const styles = articlesListScreenVariants();

  const [kind, setKind] = useState<ArticleKind | "all">("all");
  const [category, setCategory] = useState<string | "all">("all");
  /** `any` = no filter; `all` = taxonomy audience "everyone". */
  const [audience, setAudience] = useState<ArticleAudience | "any">("any");
  const [facets, setFacets] = useState<ArticleFacets | null>(null);
  const [items, setItems] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, nextFacets] = await Promise.all([
        articlesApi.list({
          page_size: 40,
          kind: kind === "all" ? undefined : kind,
          category: category === "all" ? undefined : category,
          audience: audience === "any" ? undefined : audience,
        }),
        articlesApi.facets().catch(() => null),
      ]);
      setItems(page.result);
      if (nextFacets) setFacets(nextFacets);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [audience, category, kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryKeys =
    facets?.categories.map((item) => item.key) ??
    Array.from(new Set(items.map((item) => item.taxonomy.category)));

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("backToList")}
          onBack={() => router.back()}
          title={t("listTitle")}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.filters()}>
          <div className={styles.scroller()}>
            <FilterChip
              onPress={() => setKind("all")}
              selected={kind === "all"}
            >
              {t("filterAll")}
            </FilterChip>
            {ARTICLE_KINDS.map((value) => (
              <FilterChip
                key={value}
                onPress={() => setKind(value)}
                selected={kind === value}
              >
                {t(`kinds.${value}`)}
              </FilterChip>
            ))}
          </div>

          <div className={styles.scroller()}>
            <FilterChip
              onPress={() => setCategory("all")}
              selected={category === "all"}
            >
              {t("categoriesAll")}
            </FilterChip>
            {categoryKeys.map((value) => (
              <FilterChip
                key={value}
                onPress={() => setCategory(value)}
                selected={category === value}
              >
                {formatCategoryLabel(value)}
              </FilterChip>
            ))}
          </div>

          <div className={styles.scroller()}>
            <FilterChip
              onPress={() => setAudience("any")}
              selected={audience === "any"}
            >
              {t("audiencesAll")}
            </FilterChip>
            {ARTICLE_AUDIENCES.map((value) => (
              <FilterChip
                key={value}
                onPress={() => setAudience(value)}
                selected={audience === value}
              >
                {t(`audiences.${value}`)}
              </FilterChip>
            ))}
          </div>
        </section>

        {loading ? (
          <Typography className={styles.loading()}>{t("listSubtitle")}</Typography>
        ) : items.length === 0 ? (
          <Typography className={styles.empty()}>{t("empty")}</Typography>
        ) : (
          <div className={styles.list()}>
            {items.map((article) => (
              <ArticleCard
                key={article.id}
                actionLabel={article.title}
                author={{
                  name: article.author.name,
                  avatarSrc: mediaFileUrl(article.author.avatarMediaId),
                }}
                category={formatCategoryLabel(article.taxonomy.category)}
                commentsLabel={formatCount(article.engagement.commentsCount)}
                coverSrc={mediaFileUrl(article.coverMediaId)}
                excerpt={article.excerpt ?? undefined}
                likesLabel={formatCount(article.engagement.likesCount)}
                orientation="vertical"
                publishedAtLabel={formatRelativeTime(
                  article.publishedAt ?? article.createdAt,
                )}
                readingTimeLabel={t("readingTime", {
                  minutes: article.readingTimeMinutes,
                })}
                saveLabel={t("save")}
                tags={article.tags.map((tag) => ({
                  key: tag,
                  label: formatCategoryLabel(tag),
                }))}
                title={article.title}
                type="cover"
                viewsLabel={formatCount(article.engagement.viewsCount)}
                onPress={() => router.push(articleDetailHref(article.slug))}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
