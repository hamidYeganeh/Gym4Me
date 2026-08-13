import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type { AdminAchievement } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  achievementToFormValues,
  AchievementsForm,
  type AchievementsFormValues,
} from "../../components/AchievementsForm";
import { achievementsEditScreenVariants } from "./AchievementsEditScreen.styles";
import type { AchievementsEditScreenProps } from "./AchievementsEditScreen.types";

function toInput(values: AchievementsFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    icon: values.icon.trim() || undefined,
    audience: values.audience,
    bonusPoints: Number.parseInt(values.bonusPoints, 10) || 0,
    grant:
      values.grantMode === "manual"
        ? { mode: "manual" as const }
        : {
            mode: "automatic" as const,
            rule: {
              metric: values.metric,
              threshold: Number.parseInt(values.threshold, 10) || 1,
            },
          },
    order: Number.parseInt(values.order, 10) || 0,
  };
}

export function AchievementsEditScreen({
  className,
}: AchievementsEditScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const tForm = useTranslations("Admin.Form");
  const { achievementId = "" } = useParams<{ achievementId: string }>();
  const navigate = useNavigate();
  const styles = achievementsEditScreenVariants();
  const [item, setItem] = useState<AdminAchievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? achievementToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!achievementId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminGamification.getAchievement(achievementId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [achievementId, t]);

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
    values: AchievementsFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!item) return;
    await adminGamification.updateAchievement(item.id, toInput(values));
    toast.success(tForm("saved"));
    navigate(routes.gamification);
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
          <AdminFormPage title={t("achievements.actions.editTitle")}>
            <AchievementsForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.gamification)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
