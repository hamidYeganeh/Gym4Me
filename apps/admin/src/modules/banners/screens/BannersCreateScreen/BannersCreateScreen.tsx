import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBanners } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import {
  BannersForm,
  fromLocalInputValue,
  type BannersFormValues,
} from "../../components/BannersForm";
import { bannersCreateScreenVariants } from "./BannersCreateScreen.styles";
import type { BannersCreateScreenProps } from "./BannersCreateScreen.types";

export function BannersCreateScreen({ className }: BannersCreateScreenProps) {
  const t = useTranslations("Admin.Banners");
  const tForm = useTranslations("Admin.Form");
  const navigate = useNavigate();
  const styles = bannersCreateScreenVariants();

  const handleCreate = async (
    values: BannersFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminBanners.create({
      label: values.label.trim(),
      placement: values.placement,
      ratio: values.ratio,
      radius: values.radius,
      slides: values.slides,
      publishStatus: values.publishStatus,
      schedule: {
        startsAt: fromLocalInputValue(values.startsAt),
        endsAt: fromLocalInputValue(values.endsAt),
      },
      order: Number.parseInt(values.order, 10) || 0,
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.banners);
  };

  return (
    <AdminShell
      activeNavId="banners"
      breadcrumbs={[{ label: t("actions.create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage description={t("subtitle")} title={t("actions.createTitle")}>
          <BannersForm
            onCancel={() => navigate(routes.banners)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
