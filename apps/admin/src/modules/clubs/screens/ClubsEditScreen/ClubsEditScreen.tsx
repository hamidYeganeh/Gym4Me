import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { Club } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { routes } from "@/shared/lib/routes";
import { ClubsCreateForm } from "../../components/ClubsCreateForm";
import type { ClubsCreateFormValues } from "../../components/ClubsCreateForm";
import { clubToFormValues } from "../../lib/clubs-form";
import { getClub, updateClub } from "../../lib/clubs-repository";
import { clubsEditScreenVariants } from "./ClubsEditScreen.styles";
import type { ClubsEditScreenProps } from "./ClubsEditScreen.types";

export function ClubsEditScreen({ className }: ClubsEditScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const { clubId = "" } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const styles = clubsEditScreenVariants();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (club ? clubToFormValues(club) : null),
    [club],
  );

  const load = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      setClub(await getClub(clubId));
    } catch (err) {
      setClub(null);
      setError(err instanceof Error ? err.message : t("detail.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [clubId, t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleEdit = async (
    values: ClubsCreateFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!club) return;
    await updateClub(club.id, {
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
        website: values.website.trim() || undefined,
      },
      location: {
        address: values.address.trim(),
        direction: values.direction,
        locationId: club.location?.locationId ?? undefined,
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
    toast.success(t("detail.saved"));
    navigate(routes.club(club.id));
  };

  return (
    <AdminShell
      activeNavId="clubs"
      breadcrumbs={[
        {
          label: club?.identity.name ?? t("detail.unnamed"),
          onPress: club ? () => navigate(routes.club(club.id)) : undefined,
        },
        { label: t("actions.edit") },
      ]}
      className={className}
    >
      <div className={styles.content()}>
        {loading ? (
          <div className={styles.status()}>
            <Spinner />
          </div>
        ) : null}
        {error ? (
          <Typography className={styles.error()} role="alert">
            {error}
          </Typography>
        ) : null}
        {club && initialValues ? (
          <AdminFormPage title={t("editModal.title")}>
            <ClubsCreateForm
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.club(club.id))}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
