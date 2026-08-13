import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminProgress } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { MetricTypesForm, type MetricTypesFormValues } from "../../components/MetricTypesForm";
import { metricTypesCreateScreenVariants } from "./MetricTypesCreateScreen.styles";
import type { MetricTypesCreateScreenProps } from "./MetricTypesCreateScreen.types";

export function MetricTypesCreateScreen({ className }: MetricTypesCreateScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = metricTypesCreateScreenVariants();

  const handleCreate = async (values: MetricTypesFormValues, intent: FormSubmitIntent) => {
    await adminProgress.createMetricType({
      key: values.key.trim(),
      name: values.name.trim(),
      unit: values.unit.trim() || undefined,
      valueKind: values.valueKind,
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.catalogMetrics);
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage description={t("metrics.subtitle")} title={t("metrics.createTitle")}>
          <MetricTypesForm
            onCancel={() => navigate(routes.catalogMetrics)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
