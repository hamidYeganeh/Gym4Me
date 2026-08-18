import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import type { Club, ClubClass, CreateClubSlotInput } from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { routes } from "@/shared/lib/routes";
import {
  ClubSlotsForm,
  clubSlotsFormDefaults,
  type ClubSlotsFormValues,
} from "../../components/ClubSlotsForm";
import {
  createClubClass,
  createClubSlot,
  getClub,
  listClubClasses,
} from "../../lib/clubs-repository";
import { clubSlotsCreateScreenVariants } from "./ClubSlotsCreateScreen.styles";
import type { ClubSlotsCreateScreenProps } from "./ClubSlotsCreateScreen.types";

function buildSchedule(values: ClubSlotsFormValues): CreateClubSlotInput["schedule"] {
  if (values.recurrenceType === "once") {
    return {
      recurrence: {
        type: "once",
        date: values.onceDate,
        startTime: values.startTime,
        endTime: values.endTime,
      },
    };
  }
  return {
    recurrence: {
      type: "weekly",
      weekday: Number(values.weekday),
      startTime: values.startTime,
      endTime: values.endTime,
      startsOn: values.startsOn,
      endsOn: values.endsOn.trim() || undefined,
    },
  };
}

export function ClubSlotsCreateScreen({
  className,
}: ClubSlotsCreateScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const { clubId = "" } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const styles = clubSlotsCreateScreenVariants();
  const [club, setClub] = useState<Club | null>(null);
  const [classes, setClasses] = useState<ClubClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => ({
      ...clubSlotsFormDefaults,
      classId: classes.find((item) => item.status !== "archived")?.id ?? "",
    }),
    [classes],
  );

  const load = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const [nextClub, classPage] = await Promise.all([
        getClub(clubId),
        listClubClasses(clubId),
      ]);
      setClub(nextClub);
      setClasses(classPage.result);
    } catch (err) {
      setClub(null);
      setClasses([]);
      setError(err instanceof Error ? err.message : t("slots.errorLoad"));
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

  const handleCreate = async (
    values: ClubSlotsFormValues,
    intent: FormSubmitIntent,
  ) => {
    let classId: string | undefined;
    if (values.kind === "class") {
      classId = values.classId || undefined;
      if (!classId) {
        const created = await createClubClass(clubId, {
          title: values.newClassTitle.trim(),
        });
        classId = created.id;
      }
    }
    await createClubSlot(clubId, {
      kind: values.kind,
      classId,
      capacity: Math.max(1, Number(values.capacity) || 1),
      schedule: buildSchedule(values),
    });
    toast.success(t("slots.saved"));
    if (intent === "saveAndCreateNew") {
      const classPage = await listClubClasses(clubId);
      setClasses(classPage.result);
      return;
    }
    navigate(routes.club(clubId));
  };

  return (
    <AdminShell
      activeNavId="clubs"
      breadcrumbs={[
        {
          label: club?.identity.name ?? t("detail.unnamed"),
          onPress: club ? () => navigate(routes.club(club.id)) : undefined,
        },
        { label: t("slots.create") },
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
        {!loading && !error ? (
          <AdminFormPage title={t("slots.createTitle")}>
            <ClubSlotsForm
              classes={classes}
              initialValues={initialValues}
              onCancel={() => navigate(routes.club(clubId))}
              onSubmit={handleCreate}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
