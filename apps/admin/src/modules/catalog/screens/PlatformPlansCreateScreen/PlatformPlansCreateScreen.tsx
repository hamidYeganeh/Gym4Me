import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminMemberships } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  parseFeatures,
  PlatformPlansForm,
  type PlatformPlansFormValues,
} from "../../components/PlatformPlansForm";
import { platformPlansCreateScreenVariants } from "./PlatformPlansCreateScreen.styles";
import type { PlatformPlansCreateScreenProps } from "./PlatformPlansCreateScreen.types";

export function PlatformPlansCreateScreen({
  className,
}: PlatformPlansCreateScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = platformPlansCreateScreenVariants();

  const handleCreate = async (
    values: PlatformPlansFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminMemberships.createPlatformPlan({
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      pricing: {
        amount: Number.parseInt(values.amount, 10) || 0,
        periodDays: Number.parseInt(values.periodDays, 10) || 30,
      },
      features: parseFeatures(values.features),
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.catalogPlans);
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage description={t("plans.subtitle")} title={t("plans.createTitle")}>
          <PlatformPlansForm
            onCancel={() => navigate(routes.catalogPlans)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
