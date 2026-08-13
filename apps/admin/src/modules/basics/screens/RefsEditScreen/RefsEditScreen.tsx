import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { RefItem } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBasics } from "@/shared/lib/api";
import { isRefType } from "@/shared/lib/basics-constants";
import { routes } from "@/shared/lib/routes";
import {
  RefsForm,
  refToFormValues,
  type RefsFormValues,
} from "../../components/RefsForm";
import { refsEditScreenVariants } from "./RefsEditScreen.styles";
import type { RefsEditScreenProps } from "./RefsEditScreen.types";

export function RefsEditScreen({ className }: RefsEditScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const { type = "equipment", refId = "" } = useParams<{
    type: string;
    refId: string;
  }>();
  const navigate = useNavigate();
  const styles = refsEditScreenVariants();
  const [item, setItem] = useState<RefItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? refToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!refId || !isRefType(type)) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminBasics.getRef(type, refId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [refId, t, type]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (!isRefType(type)) {
    return <Navigate replace to={routes.refs()} />;
  }

  const handleEdit = async (
    values: RefsFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminBasics.updateRef(type, item.id, {
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      description: values.description.trim() || undefined,
      icon: values.icon.trim() || null,
      coverMediaId: values.coverMediaId,
      order: Number(values.order) || 0,
      status: values.status,
      isActive: values.isActive,
    });
    toast.success(tForm("saved"));
    navigate(routes.refs(type));
  };

  return (
    <AdminShell
      activeNavId="refs"
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
          <AdminFormPage title={t("refs.editTitle")}>
            <RefsForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.refs(type))}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
