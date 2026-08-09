"use client";

import Link from "next/link";
import { Typography } from "@heroui/react";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  formatCategoryLabel,
  formatCount,
  formatRelativeTime,
} from "@/modules/articles/lib/format-article";
import { articlesListScreenStyles as styles } from "./ArticlesListScreen.styles";
import type { ArticlesListScreenProps } from "./ArticlesListScreen.types";

function buildHref(kind?: string, category?: string, audience?: string) {
  const params = new URLSearchParams();
  if (kind && kind !== "all") params.set("kind", kind);
  if (category && category !== "all") params.set("category", category);
  if (audience && audience !== "any") params.set("audience", audience);
  const query = params.toString();
  return query ? `/articles?${query}` : "/articles";
}

export function ArticlesListScreen({
  posts,
  facets,
  activeKind = "all",
  activeCategory = "all",
  activeAudience = "any",
}: ArticlesListScreenProps) {
  const t = useTranslations("Articles");
  const router = useRouter();

  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <header className={styles.intro}>
          <Typography className={styles.title} type="h1" weight="bold">
            {t("listTitle")}
          </Typography>
          <Typography className={styles.subtitle} type="body">
            {t("listSubtitle")}
          </Typography>
        </header>

        <section className={styles.filters}>
          <div className={styles.chips}>
            <Link
              className={`${styles.chip} ${activeKind === "all" ? styles.chipActive : ""}`}
              href={buildHref("all", activeCategory, activeAudience)}
            >
              {t("filterAll")}
            </Link>
            {ARTICLE_KINDS.map((kind) => (
              <Link
                key={kind}
                className={`${styles.chip} ${activeKind === kind ? styles.chipActive : ""}`}
                href={buildHref(kind, activeCategory, activeAudience)}
              >
                {t(`kinds.${kind}`)}
              </Link>
            ))}
          </div>

          <div className={styles.chips}>
            <Link
              className={`${styles.chip} ${activeCategory === "all" ? styles.chipActive : ""}`}
              href={buildHref(activeKind, "all", activeAudience)}
            >
              {t("categoriesAll")}
            </Link>
            {facets.categories.map((item) => (
              <Link
                key={item.key}
                className={`${styles.chip} ${activeCategory === item.key ? styles.chipActive : ""}`}
                href={buildHref(activeKind, item.key, activeAudience)}
              >
                {formatCategoryLabel(item.key)}
              </Link>
            ))}
          </div>

          <div className={styles.chips}>
            <Link
              className={`${styles.chip} ${activeAudience === "any" ? styles.chipActive : ""}`}
              href={buildHref(activeKind, activeCategory, "any")}
            >
              {t("audiencesAll")}
            </Link>
            {ARTICLE_AUDIENCES.map((audience) => (
              <Link
                key={audience}
                className={`${styles.chip} ${activeAudience === audience ? styles.chipActive : ""}`}
                href={buildHref(activeKind, activeCategory, audience)}
              >
                {t(`audiences.${audience}`)}
              </Link>
            ))}
          </div>
        </section>

        {posts.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <div className={styles.list}>
            {posts.map((article) => (
              <ArticleCard
                key={article.id}
                actionLabel={article.title}
                category={formatCategoryLabel(article.taxonomy.category)}
                commentsLabel={formatCount(article.engagement.commentsCount)}
                likesLabel={formatCount(article.engagement.likesCount)}
                publishedAtLabel={formatRelativeTime(
                  article.publishedAt ?? article.createdAt,
                )}
                readingTimeLabel={t("readingTime", {
                  minutes: article.readingTimeMinutes,
                })}
                saveLabel={t("save")}
                title={article.title}
                variant="feed"
                viewsLabel={formatCount(article.engagement.viewsCount)}
                onPress={() => router.push(`/articles/${article.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
