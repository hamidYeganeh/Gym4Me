import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  AchievementsForm,
  type AchievementsFormValues,
} from "../../components/AchievementsForm";
import { achievementsCreateScreenVariants } from "./AchievementsCreateScreen.styles";
import type { AchievementsCreateScreenProps } from "./AchievementsCreateScreen.types";

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

export function AchievementsCreateScreen({
  className,
}: AchievementsCreateScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = achievementsCreateScreenVariants();

  const handleCreate = async (
    values: AchievementsFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminGamification.createAchievement(toInput(values));
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.gamification);
  };

  return (
    <AdminShell
      activeNavId="gamification"
      breadcrumbs={[{ label: t("achievements.actions.create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("achievements.subtitle")}
          title={t("achievements.actions.createTitle")}
        >
          <AchievementsForm
            onCancel={() => navigate(routes.gamification)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
