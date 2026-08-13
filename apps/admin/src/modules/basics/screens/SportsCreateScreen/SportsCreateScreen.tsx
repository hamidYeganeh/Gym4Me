import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { SportNode } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBasics } from "@/shared/lib/api";
import { isSportKind } from "@/shared/lib/basics-constants";
import { routes } from "@/shared/lib/routes";
import {
  SportsForm,
  sportsFormDefaults,
  type SportsFormValues,
} from "../../components/SportsForm";
import { SPORT_PARENT_KIND } from "../../lib/basics-constants";
import { sportsCreateScreenVariants } from "./SportsCreateScreen.styles";
import type { SportsCreateScreenProps } from "./SportsCreateScreen.types";

export function SportsCreateScreen({ className }: SportsCreateScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const { kind = "category" } = useParams<{ kind: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const styles = sportsCreateScreenVariants();
  const [parents, setParents] = useState<SportNode[]>([]);
  const parentId = searchParams.get("parentId") ?? "";
  const parentKind = isSportKind(kind) ? SPORT_PARENT_KIND[kind] : null;
  const initialValues = useMemo(
    () => ({ ...sportsFormDefaults, parentId }),
    [parentId],
  );

  const loadParents = useCallback(async () => {
    if (!parentKind) {
      setParents([]);
      return;
    }
    try {
      const result = await adminBasics.listSports({ kind: parentKind });
      setParents(result.result);
    } catch {
      setParents([]);
    }
  }, [parentKind]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadParents();
    });
    return () => {
      cancelled = true;
    };
  }, [loadParents]);

  if (!isSportKind(kind)) {
    return <Navigate replace to={routes.sports()} />;
  }

  const handleCreate = async (
    values: SportsFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminBasics.createSport({
      kind,
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      description: values.description.trim() || undefined,
      icon: values.icon.trim() || undefined,
      coverMediaId: values.coverMediaId || undefined,
      parentId: values.parentId || undefined,
      order: Number(values.order) || 0,
      isActive: values.isActive,
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.sports(kind));
  };

  return (
    <AdminShell
      activeNavId="sports"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("sports.subtitle")}
          title={t("sports.createTitle")}
        >
          <SportsForm
            initialValues={initialValues}
            kind={kind}
            parents={parents}
            onCancel={() => navigate(routes.sports(kind))}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
