import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminSupport } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { FaqForm, type FaqFormValues } from "../../components/FaqForm";
import { faqCreateScreenVariants } from "./FaqCreateScreen.styles";
import type { FaqCreateScreenProps } from "./FaqCreateScreen.types";

export function FaqCreateScreen({ className }: FaqCreateScreenProps) {
  const t = useTranslations("Admin.Support");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = faqCreateScreenVariants();

  const handleCreate = async (values: FaqFormValues, intent: FormSubmitIntent) => {
    await adminSupport.createFaq({
      question: values.question.trim(),
      answer: values.answer.trim(),
      audience: values.audience,
      publishStatus: values.publishStatus,
      order: Number.parseInt(values.order, 10) || 0,
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.supportFaq);
  };

  return (
    <AdminShell
      activeNavId="support"
      breadcrumbs={[{ label: t("faqActions.create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage description={t("faqSubtitle")} title={t("faqActions.createTitle")}>
          <FaqForm
            onCancel={() => navigate(routes.supportFaq)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
