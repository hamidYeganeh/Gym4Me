import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner, Typography } from "@heroui/react";
import type {
  Club,
  ClubClass,
  ClubSlot,
  CreateClubSlotInput,
  UpdateClubSlotInput,
} from "@repo/api";
import { toast } from "@repo/ui/kit/Toast";
import { useTranslations } from "next-intl";
import { AdminFormPage, AdminShell } from "@/shared/components";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { routes } from "@/shared/lib/routes";
import {
  ClubSlotsForm,
  slotToFormValues,
  type ClubSlotsFormValues,
} from "../../components/ClubSlotsForm";
import {
  createClubClass,
  getClub,
  getClubSlot,
  listClubClasses,
  updateClubSlot,
} from "../../lib/clubs-repository";
import { clubSlotsEditScreenVariants } from "./ClubSlotsEditScreen.styles";
import type { ClubSlotsEditScreenProps } from "./ClubSlotsEditScreen.types";

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

export function ClubSlotsEditScreen({ className }: ClubSlotsEditScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const { clubId = "", slotId = "" } = useParams<{
    clubId: string;
    slotId: string;
  }>();
  const navigate = useNavigate();
  const styles = clubSlotsEditScreenVariants();
  const [club, setClub] = useState<Club | null>(null);
  const [slot, setSlot] = useState<ClubSlot | null>(null);
  const [classes, setClasses] = useState<ClubClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialValues = useMemo(
    () => (slot ? slotToFormValues(slot) : null),
    [slot],
  );

  const load = useCallback(async () => {
    if (!clubId || !slotId) return;
    setLoading(true);
    setError(null);
    try {
      const [nextClub, nextSlot, classPage] = await Promise.all([
        getClub(clubId),
        getClubSlot(clubId, slotId),
        listClubClasses(clubId),
      ]);
      setClub(nextClub);
      setSlot(nextSlot);
      setClasses(classPage.result);
    } catch (err) {
      setClub(null);
      setSlot(null);
      setClasses([]);
      setError(err instanceof Error ? err.message : t("slots.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [clubId, slotId, t]);

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
    values: ClubSlotsFormValues,
    _intent: FormSubmitIntent,
  ) => {
    if (!slot) return;
    let classId: string | null = null;
    if (values.kind === "class") {
      classId = values.classId || null;
      if (!classId) {
        const created = await createClubClass(clubId, {
          title: values.newClassTitle.trim(),
        });
        classId = created.id;
      }
    }
    const input: UpdateClubSlotInput = {
      kind: values.kind,
      classId,
      capacity: Math.max(1, Number(values.capacity) || 1),
      schedule: buildSchedule(values),
    };
    await updateClubSlot(clubId, slot.id, input);
    toast.success(t("slots.saved"));
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
        { label: t("slots.edit") },
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
        {slot && initialValues ? (
          <AdminFormPage title={t("slots.editTitle")}>
            <ClubSlotsForm
              classes={classes}
              initialValues={initialValues}
              mode="edit"
              onCancel={() => navigate(routes.club(clubId))}
              onSubmit={handleEdit}
            />
          </AdminFormPage>
        ) : null}
      </div>
    </AdminShell>
  );
}
