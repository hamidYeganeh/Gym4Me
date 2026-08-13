import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminProgress } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { ExercisesForm, type ExercisesFormValues } from "../../components/ExercisesForm";
import { exercisesCreateScreenVariants } from "./ExercisesCreateScreen.styles";
import type { ExercisesCreateScreenProps } from "./ExercisesCreateScreen.types";

export function ExercisesCreateScreen({ className }: ExercisesCreateScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = exercisesCreateScreenVariants();

  const handleCreate = async (values: ExercisesFormValues, intent: FormSubmitIntent) => {
    await adminProgress.createExercise({
      name: values.name.trim(),
      description: values.description.trim() || undefined,
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.catalogExercises);
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage description={t("exercises.subtitle")} title={t("exercises.createTitle")}>
          <ExercisesForm
            onCancel={() => navigate(routes.catalogExercises)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
