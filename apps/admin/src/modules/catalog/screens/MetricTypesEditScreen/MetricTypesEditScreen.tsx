import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { MetricType } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminProgress } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  metricTypeToFormValues,
  MetricTypesForm,
  type MetricTypesFormValues,
} from "../../components/MetricTypesForm";
import { metricTypesEditScreenVariants } from "./MetricTypesEditScreen.styles";
import type { MetricTypesEditScreenProps } from "./MetricTypesEditScreen.types";

export function MetricTypesEditScreen({ className }: MetricTypesEditScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const { metricId = "" } = useParams<{ metricId: string }>();
  const navigate = useNavigate();
  const styles = metricTypesEditScreenVariants();
  const [item, setItem] = useState<MetricType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? metricTypeToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!metricId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminProgress.getMetricType(metricId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("metrics.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [metricId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleEdit = async (values: MetricTypesFormValues, _intent: FormSubmitIntent) => {
    if (!item) return;
    await adminProgress.updateMetricType(item.id, {
      name: values.name.trim(),
      unit: values.unit.trim() || undefined,
      valueKind: values.valueKind,
    });
    toast.success(tForm("saved"));
    navigate(routes.catalogMetrics);
  };

  return (
    <AdminShell
      activeNavId="catalogs"
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
          <AdminFormPage title={t("metrics.editTitle")}>
            <MetricTypesForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.catalogMetrics)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
