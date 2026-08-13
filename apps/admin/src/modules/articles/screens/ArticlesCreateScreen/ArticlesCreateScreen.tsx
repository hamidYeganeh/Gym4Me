import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminArticles } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  ArticlesForm,
  parseTags,
  type ArticlesFormValues,
} from "../../components/ArticlesForm";
import { articlesCreateScreenVariants } from "./ArticlesCreateScreen.styles";
import type { ArticlesCreateScreenProps } from "./ArticlesCreateScreen.types";

export function ArticlesCreateScreen({ className }: ArticlesCreateScreenProps) {
  const t = useTranslations("Admin.Articles");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = articlesCreateScreenVariants();

  const handleCreate = async (
    values: ArticlesFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminArticles.create({
      title: values.title.trim(),
      slug: values.slug.trim() || undefined,
      taxonomy: {
        category: values.category.trim(),
        kind: values.kind,
        audience: values.audience,
      },
      excerpt: values.excerpt.trim() || undefined,
      body: values.body,
      coverMediaId: values.coverMediaId ?? undefined,
      publishStatus: values.publishStatus,
      tags: parseTags(values.tags),
      seo: {
        title: values.seoTitle.trim() || undefined,
        description: values.seoDescription.trim() || undefined,
      },
    });

    toast.success(tForm("created"));

    if (intent === "saveAndCreateNew") {
      return;
    }

    navigate(routes.articles);
  };

  return (
    <AdminShell
      activeNavId="articles"
      breadcrumbs={[{ label: t("actions.create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage description={t("subtitle")} title={t("actions.createTitle")}>
          <ArticlesForm
            onCancel={() => navigate(routes.articles)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
