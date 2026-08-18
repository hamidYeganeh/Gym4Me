import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
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
  sportToFormValues,
  type SportsFormValues,
} from "../../components/SportsForm";
import { sportsEditScreenVariants } from "./SportsEditScreen.styles";
import type { SportsEditScreenProps } from "./SportsEditScreen.types";

export function SportsEditScreen({ className }: SportsEditScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const { kind = "category", sportId = "" } = useParams<{
    kind: string;
    sportId: string;
  }>();
  const navigate = useNavigate();
  const styles = sportsEditScreenVariants();
  const [item, setItem] = useState<SportNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? sportToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!sportId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminBasics.getSport(sportId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [sportId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (!isSportKind(kind)) {
    return <Navigate replace to={routes.sports()} />;
  }

  const handleEdit = async (
    values: SportsFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminBasics.updateSport(item.id, {
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      description: values.description.trim() || undefined,
      icon: values.icon.trim() || null,
      coverMediaId: values.coverMediaId,
      order: Number(values.order) || 0,
      isActive: values.isActive,
    });
    toast.success(tForm("saved"));
    navigate(routes.sports(kind));
  };

  return (
    <AdminShell
      activeNavId="sports"
      breadcrumbs={[
        { label: item?.name ?? t("edit") },
        { label: t("edit") },
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
        {item && initialValues ? (
          <AdminFormPage title={t("sports.editTitle")}>
            <SportsForm
              initialValues={initialValues}
              kind={kind}
              mode="edit"
              onCancel={() => navigate(routes.sports(kind))}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
