import { useNavigate } from "react-router-dom";
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
  type PointRulesFormValues,
} from "../../components/PointRulesForm";
import { pointRulesCreateScreenVariants } from "./PointRulesCreateScreen.styles";
import type { PointRulesCreateScreenProps } from "./PointRulesCreateScreen.types";

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

export function PointRulesCreateScreen({
  className,
}: PointRulesCreateScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = pointRulesCreateScreenVariants();

  const handleCreate = async (
    values: PointRulesFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminGamification.createPointRule(toInput(values));
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.gamificationRules);
  };

  return (
    <AdminShell
      activeNavId="gamification"
      breadcrumbs={[{ label: t("rules.actions.create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("rules.subtitle")}
          title={t("rules.actions.createTitle")}
        >
          <PointRulesForm
            onCancel={() => navigate(routes.gamificationRules)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
