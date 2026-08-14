"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar, Button, Typography } from "@heroui/react";
import type { Article, ArticleSummary } from "@repo/api";
import { ApiError } from "@repo/api";
import { Bookmark } from "@repo/icons/Bookmark";
import { Chat } from "@repo/icons/Chat";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Heart } from "@repo/icons/Heart";
import { ArticleCard } from "@repo/ui/cards/ArticleCard";
import { ReadingTimeCard } from "@repo/ui/cards/ReadingTimeCard";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  articleDetailHref,
  formatArticleDate,
  formatCategoryLabel,
} from "@/modules/articles/lib/format-article";
import { articlesApi, mediaFileUrl } from "@/shared/lib/api";
import { articleDetailScreenVariants } from "./ArticleDetailScreen.styles";
import type { ArticleDetailScreenProps } from "./ArticleDetailScreen.types";

export function ArticleDetailScreen({ className }: ArticleDetailScreenProps) {
  const t = useTranslations("Articles");
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() ?? "";
  const styles = articleDetailScreenVariants();

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<ArticleSummary[]>([]);
  const [safeBody, setSafeBody] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const load = useCallback(async () => {
    if (!slug) {
      setArticle(null);
      setRelated([]);
      setError(t("empty"));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detail, relatedItems] = await Promise.all([
        articlesApi.getBySlug(slug),
        articlesApi.listRelated(slug).catch(() => []),
      ]);
      setArticle(detail);
      setRelated(relatedItems);
      try {
        const state = await articlesApi.getViewerState(detail.id);
        setLiked(state.liked);
        setSaved(state.saved);
      } catch {
        setLiked(false);
        setSaved(false);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("empty"));
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [slug, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!article?.body) {
      setSafeBody("");
      return;
    }
    let cancelled = false;
    void import("@/modules/articles/lib/sanitize-article-html").then((mod) => {
      if (!cancelled) setSafeBody(mod.sanitizeArticleHtml(article.body));
    });
    return () => {
      cancelled = true;
    };
  }, [article?.body]);

  const toggleLike = async () => {
    if (!article || actionPending) return;
    setActionPending(true);
    try {
      const result = liked
        ? await articlesApi.unlike(article.id)
        : await articlesApi.like(article.id);
      setLiked(result.viewer.liked);
      setArticle((prev) =>
        prev
          ? { ...prev, engagement: result.engagement }
          : prev,
      );
    } catch {
      // keep previous state
    } finally {
      setActionPending(false);
    }
  };

  const toggleSave = async () => {
    if (!article || actionPending) return;
    setActionPending(true);
    try {
      const result = saved
        ? await articlesApi.unsave(article.id)
        : await articlesApi.save(article.id);
      setSaved(result.viewer.saved);
      setArticle((prev) =>
        prev
          ? { ...prev, engagement: result.engagement }
          : prev,
      );
    } catch {
      // keep previous state
    } finally {
      setActionPending(false);
    }
  };

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          endContent={
            article ? (
              <Button
                aria-label={saved ? t("unsave") : t("save")}
                aria-pressed={saved}
                className={saved ? styles.actionActive() : undefined}
                isIconOnly
                size="lg"
                variant="ghost"
                onPress={() => void toggleSave()}
              >
                <Bookmark size={20} />
              </Button>
            ) : null
          }
          startContent={
            <Button
              aria-label={t("backToList")}
              isIconOnly
              size="lg"
              variant="ghost"
              onPress={() => router.back()}
            >
              <ChevronLeft size={22} />
            </Button>
          }
          title={t("detailTitle")}
        />
      }
    >
      <div className={styles.content()}>
        {loading ? (
          <Typography className={styles.loading()}>{t("listSubtitle")}</Typography>
        ) : error || !article ? (
          <Typography className={styles.error()}>{error ?? t("empty")}</Typography>
        ) : (
          <>
            <section className={styles.hero()}>
              <span className={styles.categoryChip()}>
                {formatCategoryLabel(article.taxonomy.category)}
              </span>
              <Typography className={styles.title()} type="h1" weight="bold">
                {article.title}
              </Typography>
              <p className={styles.meta()}>
                <span>{formatArticleDate(article.publishedAt)}</span>
              </p>
              <div className={styles.authorRow()}>
                <Avatar className="size-8">
                  {mediaFileUrl(article.author.avatarMediaId) ? (
                    <Avatar.Image
                      alt=""
                      src={mediaFileUrl(article.author.avatarMediaId)!}
                    />
                  ) : null}
                  <Avatar.Fallback>
                    {article.author.name.slice(0, 1)}
                  </Avatar.Fallback>
                </Avatar>
                <Typography className={styles.authorName()} type="body-sm">
                  {article.author.name}
                </Typography>
              </div>
            </section>

            <ReadingTimeCard
              label={t("readingTimeLabel")}
              value={t("readingTimeApprox", {
                minutes: article.readingTimeMinutes,
              })}
            />

            <div
              className={styles.body()}
              dangerouslySetInnerHTML={{
                __html: safeBody,
              }}
            />

            <div className={styles.actions()}>
              <Button
                aria-label={liked ? t("unlike") : t("like")}
                aria-pressed={liked}
                className={styles.actionButton({
                  className: liked ? styles.actionActive() : undefined,
                })}
                isDisabled={actionPending}
                variant="secondary"
                onPress={() => void toggleLike()}
              >
                <Heart size={18} />
                {article.engagement.likesCount}
              </Button>
              <Button
                aria-label={t("comments", {
                  count: article.engagement.commentsCount,
                })}
                className={styles.actionButton()}
                variant="secondary"
                onPress={() => undefined}
              >
                <Chat size={18} />
                {article.engagement.commentsCount}
              </Button>
              <Button
                aria-label={saved ? t("unsave") : t("save")}
                aria-pressed={saved}
                className={styles.actionButton({
                  className: saved ? styles.actionActive() : undefined,
                })}
                isDisabled={actionPending}
                variant="secondary"
                onPress={() => void toggleSave()}
              >
                <Bookmark size={18} />
                {article.engagement.savesCount}
              </Button>
            </div>

            {related.length > 0 ? (
              <section className={styles.relatedSection()}>
                <Typography
                  className={styles.relatedTitle()}
                  type="h3"
                  weight="bold"
                >
                  {t("relatedTitle")}
                </Typography>
                <div className={styles.relatedScroller()}>
                  {related.map((item) => (
                    <div key={item.id} className={styles.relatedCard()}>
                      <ArticleCard
                        actionLabel={item.title}
                        author={{
                          name: item.author.name,
                          avatarSrc: mediaFileUrl(item.author.avatarMediaId),
                        }}
                        category={formatCategoryLabel(item.taxonomy.category)}
                        commentsLabel={String(item.engagement.commentsCount)}
                        coverSrc={mediaFileUrl(item.coverMediaId)}
                        likesLabel={String(item.engagement.likesCount)}
                        readingTimeLabel={`${item.readingTimeMinutes}m`}
                        saveLabel={t("save")}
                        title={item.title}
                        variant="row"
                        viewsLabel={String(item.engagement.viewsCount)}
                        onPress={() => router.push(articleDetailHref(item.slug))}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}
