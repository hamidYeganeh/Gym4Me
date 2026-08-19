"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@heroui/react/avatar";
import { Typography } from "@heroui/react/typography";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  formatArticleDate,
  formatCategoryLabel,
} from "@/modules/articles/lib/format-article";
import { mediaFileUrl } from "@/shared/lib/api";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { articleDetailScreenStyles as styles } from "./ArticleDetailScreen.styles";
import type { ArticleDetailScreenProps } from "./ArticleDetailScreen.types";

export function ArticleDetailScreen({
  article,
  related,
  coverUrl,
}: ArticleDetailScreenProps) {
  const t = useTranslations("Articles");
  const router = useRouter();

  return (
    <>
      <PublicSiteHeader />
      <main className={styles.root}>
        <article className={styles.article}>
        <Link className={styles.back} href="/articles">
          {t("backToList")}
        </Link>

        <section className={styles.hero}>
          <span className={styles.categoryChip}>
            {formatCategoryLabel(article.taxonomy.category)}
          </span>
          <Typography className={styles.title} type="h1" weight="bold">
            {article.title}
          </Typography>
          <p className={styles.meta}>
            <span>{formatArticleDate(article.publishedAt)}</span>
            <span aria-hidden>·</span>
            <span>
              {t("readingTime", { minutes: article.readingTimeMinutes })}
            </span>
          </p>
          <div className={styles.authorRow}>
            <Avatar className="size-8">
              {mediaFileUrl(article.author.avatarMediaId) ? (
                <Avatar.Image
                  alt=""
                  src={mediaFileUrl(article.author.avatarMediaId)!}
                />
              ) : null}
              <Avatar.Fallback>{article.author.name.slice(0, 1)}</Avatar.Fallback>
            </Avatar>
            <Typography className={styles.authorName} type="body-sm">
              {article.author.name}
            </Typography>
          </div>
        </section>

        {coverUrl ? (
          <div className={styles.cover}>
            <Image
              alt=""
              className={styles.coverImage}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 960px"
              src={coverUrl}
            />
          </div>
        ) : null}

        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        <p className={styles.stats}>
          <span>{t("likes", { count: article.engagement.likesCount })}</span>
          <span>
            {t("comments", { count: article.engagement.commentsCount })}
          </span>
          <span>{t("saves", { count: article.engagement.savesCount })}</span>
        </p>
      </article>

      {related.length > 0 ? (
        <section className={styles.relatedSection}>
          <Typography className={styles.relatedTitle} type="h2" weight="bold">
            {t("relatedTitle")}
          </Typography>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <ArticleCard
                key={item.id}
                actionLabel={item.title}
                author={{
                  name: item.author.name,
                  avatarSrc: mediaFileUrl(item.author.avatarMediaId),
                }}
                category={formatCategoryLabel(item.taxonomy.category)}
                commentsLabel={String(item.engagement.commentsCount)}
                coverSrc={mediaFileUrl(item.coverMediaId)}
                excerpt={item.excerpt ?? undefined}
                likesLabel={String(item.engagement.likesCount)}
                orientation="horizontal"
                readingTimeLabel={`${item.readingTimeMinutes}m`}
                saveLabel={t("save")}
                tags={item.tags.map((tag) => ({
                  key: tag,
                  label: formatCategoryLabel(tag),
                }))}
                title={item.title}
                type="cover"
                viewsLabel={String(item.engagement.viewsCount)}
                onPress={() => router.push(`/articles/${item.slug}`)}
              />
            ))}
          </div>
        </section>
      ) : null}
      </main>
      <PublicSiteFooter />
    </>
  );
}
