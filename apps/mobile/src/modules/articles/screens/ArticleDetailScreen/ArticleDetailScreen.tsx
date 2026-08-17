"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Typography } from "@heroui/react";
import type { Article, ArticleSummary } from "@repo/api";
import { ApiError } from "@repo/api";
import { Bookmark } from "@repo/icons/Bookmark";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { articleDetailHref } from "@/modules/articles/lib/format-article";
import { ArticleDetailBodySection } from "../../sections/ArticleDetailBodySection";
import { ArticleDetailEngagementSection } from "../../sections/ArticleDetailEngagementSection";
import { ArticleDetailHeroSection } from "../../sections/ArticleDetailHeroSection";
import { ArticleDetailRelatedSection } from "../../sections/ArticleDetailRelatedSection";
import { articlesApi } from "@/shared/lib/api";
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
        prev ? { ...prev, engagement: result.engagement } : prev,
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
        prev ? { ...prev, engagement: result.engagement } : prev,
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
            <ArticleDetailHeroSection article={article} />

            <ArticleDetailBodySection
              readingTimeMinutes={article.readingTimeMinutes}
              safeBody={safeBody}
            />

            <ArticleDetailEngagementSection
              actionPending={actionPending}
              article={article}
              liked={liked}
              saved={saved}
              onToggleLike={() => void toggleLike()}
              onToggleSave={() => void toggleSave()}
            />

            <ArticleDetailRelatedSection
              related={related}
              onArticlePress={(nextSlug) =>
                router.push(articleDetailHref(nextSlug))
              }
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
