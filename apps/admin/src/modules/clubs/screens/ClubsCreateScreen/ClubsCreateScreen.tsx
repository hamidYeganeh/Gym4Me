import { useNavigate } from "react-router-dom";
import { upsertClubWebsiteSocial } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { routes } from "@/shared/lib/routes";
import { ClubsCreateForm } from "../../components/ClubsCreateForm";
import type { ClubsCreateFormValues } from "../../components/ClubsCreateForm";
import { createClub } from "../../lib/clubs-repository";
import { clubsCreateScreenVariants } from "./ClubsCreateScreen.styles";
import type { ClubsCreateScreenProps } from "./ClubsCreateScreen.types";

export function ClubsCreateScreen({ className }: ClubsCreateScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const navigate = useNavigate();
  const styles = clubsCreateScreenVariants();

  const handleCreate = async (
    values: ClubsCreateFormValues,
    intent: FormSubmitIntent,
  ) => {
    const club = await createClub({
      ownerId: values.ownerId.trim(),
      identity: {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      },
      contact: {
        phones: [
          {
            number: values.phone.trim(),
            label: values.phoneLabel.trim() || undefined,
          },
        ],
      },
      socials: upsertClubWebsiteSocial([], values.website),
      location: {
        address: values.address.trim(),
        direction: values.direction,
      },
      categoryIds: values.categoryIds,
      sportIds: values.sportIds,
      audience: {
        genderPolicy: values.genderPolicy || null,
        accessibility: values.accessibility || "standard",
        ageGroupKeys: values.ageGroupKeys,
        levelKeys: values.levelKeys,
      },
    });

    toast.success(t("createModal.saved"));

    if (intent === "saveAndCreateNew") {
      return;
    }

    navigate(routes.club(club.id));
  };

  return (
    <AdminShell
      activeNavId="clubs"
      breadcrumbs={[{ label: t("create") }]}
      className={className}
    >
      <div className={styles.content()}>
        <AdminFormPage
          description={t("subtitle")}
          title={t("createModal.title")}
        >
          <ClubsCreateForm
            onCancel={() => navigate(routes.clubs)}
            onSubmit={handleCreate}
          />
        </AdminFormPage>
      </div>
    </AdminShell>
  );
}
