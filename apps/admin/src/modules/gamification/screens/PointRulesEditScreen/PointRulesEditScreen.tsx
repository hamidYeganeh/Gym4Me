import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { AdminPointRule } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  awardsFromForm,
  fromLocalInputValue,
  PointRulesForm,
  pointRuleToFormValues,
  type PointRulesFormValues,
} from "../../components/PointRulesForm";
import { pointRulesEditScreenVariants } from "./PointRulesEditScreen.styles";
import type { PointRulesEditScreenProps } from "./PointRulesEditScreen.types";

function toInput(values: PointRulesFormValues) {
  const capValue = Number.parseInt(values.dailyCap, 10);
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    event: values.event,
    awards: awardsFromForm(values.awards),
    limits: {
      repeat: values.repeat,
      dailyCap: Number.isFinite(capValue) && capValue > 0 ? capValue : undefined,
    },
    effective: {
      from: fromLocalInputValue(values.effectiveFrom),
      to: fromLocalInputValue(values.effectiveTo),
    },
  };
}

export function PointRulesEditScreen({ className }: PointRulesEditScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const tForm = useTranslations("Admin.Form");
  const { ruleId = "" } = useParams<{ ruleId: string }>();
  const navigate = useNavigate();
  const styles = pointRulesEditScreenVariants();
  const [item, setItem] = useState<AdminPointRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? pointRuleToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!ruleId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminGamification.getPointRule(ruleId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [ruleId, t]);

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
    values: PointRulesFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminGamification.updatePointRule(item.id, toInput(values));
    toast.success(tForm("saved"));
    navigate(routes.gamificationRules);
  };

  return (
    <AdminShell
      activeNavId="gamification"
      breadcrumbs={[
        { label: item?.title ?? t("actions.edit") },
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
        {item && initialValues ? (
          <AdminFormPage title={t("rules.actions.editTitle")}>
            <PointRulesForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.gamificationRules)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
