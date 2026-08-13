import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBasics } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  ChoicesForm,
  normalizedChoiceOptions,
  type ChoicesFormValues,
} from "../../components/ChoicesForm";
import { choicesCreateScreenVariants } from "./ChoicesCreateScreen.styles";
import type { ChoicesCreateScreenProps } from "./ChoicesCreateScreen.types";

export function ChoicesCreateScreen({ className }: ChoicesCreateScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = choicesCreateScreenVariants();

  const handleCreate = async (
    values: ChoicesFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminBasics.createChoice({
      key: values.key.trim(),
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      isActive: values.isActive,
      options: normalizedChoiceOptions(values),
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.choices);
  };

  return (
    <AdminShell
      activeNavId="choices"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("choices.subtitle")}
          title={t("choices.createTitle")}
        >
          <ChoicesForm
            onCancel={() => navigate(routes.choices)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
