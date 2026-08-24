import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminBasics } from "@/shared/lib/api";
import { isRefType } from "@/shared/lib/basics-constants";
import { routes } from "@/shared/lib/routes";
import { RefsForm, type RefsFormValues } from "../../components/RefsForm";
import { refsCreateScreenVariants } from "./RefsCreateScreen.styles";
import type { RefsCreateScreenProps } from "./RefsCreateScreen.types";

export function RefsCreateScreen({ className }: RefsCreateScreenProps) {
  const t = useTranslations("Admin.Basics");
  const tForm = useTranslations("Admin.Form");
  const { type = "equipment" } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const styles = refsCreateScreenVariants();

  if (!isRefType(type)) {
    return <Navigate replace to={routes.refs()} />;
  }

  const handleCreate = async (
    values: RefsFormValues,
    intent: FormSubmitIntent,
  ) => {
    await adminBasics.createRef(type, {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      icon: values.icon.trim() || undefined,
      coverMediaId: values.coverMediaId || undefined,
    });
    toast.success(tForm("created"));
    if (intent === "saveAndCreateNew") return;
    navigate(routes.refs(type));
  };

  return (
    <AdminShell
      activeNavId="refs"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("refs.subtitle")}
          title={t("refs.createTitle")}
        >
          <RefsForm
            onCancel={() => navigate(routes.refs(type))}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
