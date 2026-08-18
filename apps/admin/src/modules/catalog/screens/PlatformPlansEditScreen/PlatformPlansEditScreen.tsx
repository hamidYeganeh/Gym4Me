import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { PlatformPlan } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminMemberships } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  parseFeatures,
  planToFormValues,
  PlatformPlansForm,
  type PlatformPlansFormValues,
} from "../../components/PlatformPlansForm";
import { platformPlansEditScreenVariants } from "./PlatformPlansEditScreen.styles";
import type { PlatformPlansEditScreenProps } from "./PlatformPlansEditScreen.types";

export function PlatformPlansEditScreen({
  className,
}: PlatformPlansEditScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const { planId = "" } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const styles = platformPlansEditScreenVariants();
  const [item, setItem] = useState<PlatformPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? planToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminMemberships.getPlatformPlan(planId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("plans.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [planId, t]);

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
    values: PlatformPlansFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminMemberships.updatePlatformPlan(item.id, {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      pricing: {
        amount: Number.parseInt(values.amount, 10) || 0,
        periodDays: Number.parseInt(values.periodDays, 10) || 30,
      },
      features: parseFeatures(values.features),
    });
    toast.success(tForm("saved"));
    navigate(routes.catalogPlans);
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
          <AdminFormPage title={t("plans.editTitle")}>
            <PlatformPlansForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.catalogPlans)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
