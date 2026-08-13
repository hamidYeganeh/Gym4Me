import { useNavigate } from "react-router-dom";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminUsers } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { UsersCreateForm } from "../../components/UsersCreateForm";
import type { UsersCreateFormValues } from "../../components/UsersCreateForm";
import { usersCreateScreenVariants } from "./UsersCreateScreen.styles";
import type { UsersCreateScreenProps } from "./UsersCreateScreen.types";

export function UsersCreateScreen({ className }: UsersCreateScreenProps) {
  const t = useTranslations("Admin.Users");
  const navigate = useNavigate();
  const styles = usersCreateScreenVariants();

  const handleCreate = async (
    values: UsersCreateFormValues,
    intent: FormSubmitIntent,
  ) => {
    const user = await adminUsers.create({
      phone: values.phone.trim(),
      firstName: values.firstName.trim() || undefined,
      lastName: values.lastName.trim() || undefined,
      password: values.password || undefined,
      roles: values.roles,
    });

    toast.success(t("createModal.saved"));

    if (intent === "saveAndCreateNew") {
      return;
    }

    navigate(routes.user(user.id));
  };

  return (
    <AdminShell
      activeNavId="users"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("subtitle")}
          title={t("createModal.title")}
        >
          <UsersCreateForm
            onCancel={() => navigate(routes.users)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
