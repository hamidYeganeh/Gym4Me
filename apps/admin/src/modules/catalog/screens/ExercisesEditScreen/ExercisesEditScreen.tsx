import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { Exercise } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminProgress } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  exerciseToFormValues,
  ExercisesForm,
  type ExercisesFormValues,
} from "../../components/ExercisesForm";
import { exercisesEditScreenVariants } from "./ExercisesEditScreen.styles";
import type { ExercisesEditScreenProps } from "./ExercisesEditScreen.types";

export function ExercisesEditScreen({ className }: ExercisesEditScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const { exerciseId = "" } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const styles = exercisesEditScreenVariants();
  const [item, setItem] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (item ? exerciseToFormValues(item) : null),
    [item],
  );

  const load = useCallback(async () => {
    if (!exerciseId) return;
    setLoading(true);
    setError(null);
    try {
      setItem(await adminProgress.getExercise(exerciseId));
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : t("exercises.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [exerciseId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleEdit = async (values: ExercisesFormValues, _intent: FormSubmitIntent) => {
    if (!item) return;
    await adminProgress.updateExercise(item.id, {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
    });
    toast.success(tForm("saved"));
    navigate(routes.catalogExercises);
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
          <AdminFormPage title={t("exercises.editTitle")}>
            <ExercisesForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.catalogExercises)}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
