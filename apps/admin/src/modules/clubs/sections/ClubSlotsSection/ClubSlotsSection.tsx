import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Pencil1 } from "@repo/icons/Pencil1";
import { Plus } from "@repo/icons/Plus";
import { Trash1 } from "@repo/icons/Trash1";
import type { ClubSlot } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components/AdminFormDrawer";
import { routes } from "@/shared/lib/routes";
import {
  archiveClubSlot,
  cancelClubSlotOccurrence,
} from "../../lib/clubs-repository";
import { clubSlotsSectionVariants } from "./ClubSlotsSection.styles";
import type { ClubSlotsSectionProps } from "./ClubSlotsSection.types";

function todayIso() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function ClubSlotsSection({
  clubId,
  classes,
  slots,
  onChanged,
}: ClubSlotsSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const tCommon = useTranslations("Admin.Common");
  const navigate = useNavigate();
  const styles = clubSlotsSectionVariants();
  const [cancelSlotId, setCancelSlotId] = useState<string | null>(null);
  const [cancelDate, setCancelDate] = useState(todayIso());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSlots = useMemo(
    () => slots.filter((s) => s.status !== "archived"),
    [slots],
  );
  const activeClasses = useMemo(
    () => classes.filter((c) => c.status !== "archived"),
    [classes],
  );

  const classTitle = (id: string | null) =>
    activeClasses.find((c) => c.id === id)?.title ?? id ?? "—";

  const openCancel = (slotId: string) => {
    setCancelSlotId(slotId);
    setCancelDate(todayIso());
    setError(null);
  };

  const handleArchive = async (slotId: string) => {
    setPending(true);
    setError(null);
    try {
      await archiveClubSlot(clubId, slotId);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("slots.errorSave"));
    } finally {
      setPending(false);
    }
  };

  const handleCancelOccurrence = async () => {
    if (!cancelSlotId) return;
    setPending(true);
    setError(null);
    try {
      await cancelClubSlotOccurrence(clubId, cancelSlotId, cancelDate);
      setCancelSlotId(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("slots.errorSave"));
    } finally {
      setPending(false);
    }
  };

  const scheduleLabel = (slot: ClubSlot) => {
    const r = slot.schedule.recurrence;
    if (r.type === "once") {
      return `${r.date} · ${r.startTime}–${r.endTime}`;
    }
    const ends = r.endsOn ? ` → ${r.endsOn}` : "";
    return `${t(`slots.weekday.${r.weekday ?? 0}`)} · ${r.startTime}–${r.endTime}${ends}`;
  };

  return (
    <section className={styles.root()}>
      <div className={styles.header()}>
        <Typography className={styles.title()}>{t("slots.title")}</Typography>
        <Button
          size="sm"
          variant="primary"
          onPress={() => navigate(routes.clubSlotNew(clubId))}
        >
          <Plus size={16} />
          {t("slots.create")}
        </Button>
      </div>

      {error && !cancelSlotId ? (
        <Typography className={styles.error()} role="alert">
          {error}
        </Typography>
      ) : null}

      {activeSlots.length === 0 ? (
        <Typography className={styles.muted()}>{t("slots.empty")}</Typography>
      ) : (
        <ul className={styles.list()}>
          {activeSlots.map((slot) => (
            <li className={styles.row()} key={slot.id}>
              <div className={styles.meta()}>
                <div>
                  {slot.kind === "class"
                    ? classTitle(slot.classId)
                    : t("slots.session")}
                  <span className={styles.muted()}> · {slot.kind}</span>
                </div>
                <div className={styles.muted()}>
                  {scheduleLabel(slot)} · {t("slots.capacity")}: {slot.capacity}
                  {slot.schedule.exceptions.length
                    ? ` · ${t("slots.exceptions", { count: slot.schedule.exceptions.length })}`
                    : ""}
                </div>
              </div>
              <div className={styles.actions()}>
                <Button
                  isDisabled={pending}
                  size="sm"
                  variant="outline"
                  onPress={() => navigate(routes.clubSlotEdit(clubId, slot.id))}
                >
                  <Pencil1 size={14} />
                  {t("slots.edit")}
                </Button>
                <Button
                  isDisabled={pending}
                  size="sm"
                  variant="outline"
                  onPress={() => openCancel(slot.id)}
                >
                  {t("slots.cancelOccurrence")}
                </Button>
                <Button
                  isDisabled={pending}
                  size="sm"
                  variant="danger"
                  onPress={() => void handleArchive(slot.id)}
                >
                  <Trash1 size={14} />
                  {t("slots.archive")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminFormDrawer
        isOpen={Boolean(cancelSlotId)}
        onOpenChange={(open) => {
          if (!open) setCancelSlotId(null);
        }}
        title={t("slots.cancelTitle")}
      >
        <div className={styles.form()}>
          <Typography className={styles.muted()}>
            {t("slots.cancelBody")}
          </Typography>
          <TextField value={cancelDate} onChange={setCancelDate}>
            <Label>{t("slots.cancelDate")}</Label>
            <Input
              dir="ltr"
              placeholder={tCommon("datePlaceholder")}
            />
          </TextField>
          {error ? (
            <Typography className={styles.error()} role="alert">
              {error}
            </Typography>
          ) : null}
          <Button
            isDisabled={pending || !/^\d{4}-\d{2}-\d{2}$/.test(cancelDate)}
            variant="danger"
            onPress={() => void handleCancelOccurrence()}
          >
            {t("slots.cancelConfirm")}
          </Button>
        </div>
      </AdminFormDrawer>
    </section>
  );
}
