import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { AdminArticle } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminArticles } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  articleToFormValues,
  ArticlesForm,
  parseTags,
  type ArticlesFormValues,
} from "../../components/ArticlesForm";
import { articlesEditScreenVariants } from "./ArticlesEditScreen.styles";
import type { ArticlesEditScreenProps } from "./ArticlesEditScreen.types";

export function ArticlesEditScreen({ className }: ArticlesEditScreenProps) {
  const t = useTranslations("Admin.Articles");
  const tForm = useTranslations("Admin.Form");
  const { articleId = "" } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const styles = articlesEditScreenVariants();

  const [article, setArticle] = useState<AdminArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (article ? articleToFormValues(article) : null),
    [article],
  );

  const load = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    try {
      setArticle(await adminArticles.get(articleId));
    } catch (err) {
      setArticle(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [articleId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleEdit = async (
    values: ArticlesFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!article) return;
    await adminArticles.update(article.id, {
      title: values.title.trim(),
      slug: values.slug.trim() || undefined,
      taxonomy: {
        category: values.category.trim(),
        kind: values.kind,
        audience: values.audience,
      },
      excerpt: values.excerpt.trim() || null,
      body: values.body,
      coverMediaId: values.coverMediaId,
      publishStatus: values.publishStatus,
      tags: parseTags(values.tags),
      seo: {
        title: values.seoTitle.trim() || undefined,
        description: values.seoDescription.trim() || undefined,
      },
    });
    toast.success(tForm("saved"));
    navigate(routes.articles);
  };

  return (
    <AdminShell
      activeNavId="articles"
      breadcrumbs={[
        {
          label: article?.title ?? t("actions.edit"),
        },
        { label: t("actions.edit") },
      ]}
      className={className}
    >
      <div className={styles.content()}>
        {loading ? (
          <div className={styles.status()}>
            <Spinner />
          </div>
        ) : null}
        {error ? (
          <Typography className={styles.error()} role="alert">
            {error}
          </Typography>
        ) : null}
        {article && initialValues ? (
          <AdminFormPage title={t("actions.editTitle")}>
            <ArticlesForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.articles)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
