"use client";

import {
  ArticleEditorialCard,
  ArticleEditorialCardSkeleton,
} from "@repo/ui/cards/ArticleEditorialCard";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { articleHomeHref } from "../../lib/articles-home";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeArticlesSectionVariants } from "./DiscoveryHomeArticlesSection.styles";
import type { DiscoveryHomeArticlesSectionProps } from "./DiscoveryHomeArticlesSection.types";

const ARTICLE_SKELETON_COUNT = 2;
const CATEGORY_ICON_SIZE = 14;

export function DiscoveryHomeArticlesSection({
  articles,
  isLoading = false,
  title,
  hint,
  seeAllHref = "/discovery/articles",
}: DiscoveryHomeArticlesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const tArticles = useTranslations("Articles");
  const router = useRouter();
  const slots = discoveryHomeArticlesSectionVariants();

  if (!isLoading && articles.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={title ?? t("articlesTitle")}
      hint={hint ?? t("articlesHint")}
      seeAllLabel={t("seeAll")}
      sheet
      slideClassName={slots.slide()}
      title={title ?? t("articlesTitle")}
      tone="muted"
      onSeeAll={() => router.push(seeAllHref)}
    >
      {isLoading
        ? Array.from({ length: ARTICLE_SKELETON_COUNT }, (_, index) => (
            <ArticleEditorialCardSkeleton
              className={slots.card()}
              key={`article-skeleton-${index}`}
            />
          ))
        : articles.map((article) => (
            <ArticleEditorialCard
              actionLabel={t("viewArticle")}
              author={article.authorName}
              category={tArticles(`kinds.${article.kind}`)}
              categoryIcon={<BarbellHorizontal size={CATEGORY_ICON_SIZE} />}
              className={slots.card()}
              dateLabel={article.publishedAtLabel}
              key={article.id}
              readingTimeLabel={t("readingTime", {
                minutes: article.readingTimeMinutes,
              })}
              title={article.title}
              onPress={() => router.push(articleHomeHref(article.slug))}
            />
          ))}
    </DiscoverySectionRail>
  );
}
