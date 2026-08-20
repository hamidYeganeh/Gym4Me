"use client";

import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import { DiscoverySectionRail } from "../DiscoverySectionRail";
import { discoveryHomeArticlesSectionVariants } from "./DiscoveryHomeArticlesSection.styles";
import type { DiscoveryHomeArticlesSectionProps } from "./DiscoveryHomeArticlesSection.types";

export function DiscoveryHomeArticlesSection({
  articles,
}: DiscoveryHomeArticlesSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const slots = discoveryHomeArticlesSectionVariants();

  if (articles.length === 0) return null;

  return (
    <DiscoverySectionRail
      ariaLabel={t("articlesTitle")}
      hint={t("articlesHint")}
      title={t("articlesTitle")}
    >
      {articles.map((article) => (
        <ArticleCard
          actionLabel={t("viewArticle")}
          author={{
            name: article.authorName,
            avatarSrc: article.authorAvatarSrc,
          }}
          category={article.category}
          className={slots.card()}
          coverSrc={article.coverSrc ?? PLACEHOLDER_IMAGE}
          excerpt={article.excerpt ?? undefined}
          key={article.id}
          likesLabel={article.likesLabel}
          orientation="vertical"
          publishedAtLabel={article.publishedAtLabel}
          readingTimeLabel={t("readingTime", {
            minutes: article.readingTimeMinutes,
          })}
          tags={article.tags.map((tag) => ({ key: tag, label: tag }))}
          title={article.title}
          type="cover"
          viewsLabel={article.viewsLabel}
        />
      ))}
    </DiscoverySectionRail>
  );
}
