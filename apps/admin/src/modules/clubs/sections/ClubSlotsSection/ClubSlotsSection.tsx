import { useMemo, useState } from "react";
import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  Typography,
} from "@heroui/react";
import { Pencil1, Plus, Trash1 } from "@repo/icons";
import type {
  ClubSlot,
  CreateClubSlotInput,
  SlotKind,
  SlotRecurrenceType,
  UpdateClubSlotInput,
} from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components/AdminFormDrawer";
import {
  archiveClubSlot,
  cancelClubSlotOccurrence,
  createClubClass,
  createClubSlot,
  updateClubSlot,
} from "../../lib/clubs-repository";
import { clubSlotsSectionVariants } from "./ClubSlotsSection.styles";
import type { ClubSlotsSectionProps } from "./ClubSlotsSection.types";

const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

function todayIso() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

type FormState = {
  kind: SlotKind;
  classId: string;
  newClassTitle: string;
  capacity: string;
  recurrenceType: SlotRecurrenceType;
  weekday: string;
  onceDate: string;
  startTime: string;
  endTime: string;
  startsOn: string;
  endsOn: string;
};

const emptyForm = (classId = ""): FormState => ({
  kind: "class",
  classId,
  newClassTitle: "",
  capacity: "20",
  recurrenceType: "weekly",
  weekday: "0",
  onceDate: todayIso(),
  startTime: "08:00",
  endTime: "09:00",
  startsOn: todayIso(),
  endsOn: "",
});

function formFromSlot(slot: ClubSlot): FormState {
  const r = slot.schedule.recurrence;
  return {
    kind: slot.kind,
    classId: slot.classId ?? "",
    newClassTitle: "",
    capacity: String(slot.capacity),
    recurrenceType: r.type,
    weekday: String(r.weekday ?? 0),
    onceDate: r.date ?? todayIso(),
    startTime: r.startTime,
    endTime: r.endTime,
    startsOn: r.startsOn ?? todayIso(),
    endsOn: r.endsOn ?? "",
  };
}

export function ClubSlotsSection({
  clubId,
  classes,
  slots,
  onChanged,
}: ClubSlotsSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const styles = clubSlotsSectionVariants();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [cancelSlotId, setCancelSlotId] = useState<string | null>(null);
  const [cancelDate, setCancelDate] = useState(todayIso());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());

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

  const patchForm = (partial: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const openCreate = () => {
    setEditingSlotId(null);
    setForm(emptyForm(activeClasses[0]?.id ?? ""));
    setError(null);
    setDrawerOpen(true);
  };

  const openEdit = (slot: ClubSlot) => {
    setEditingSlotId(slot.id);
    setForm(formFromSlot(slot));
    setError(null);
    setDrawerOpen(true);
  };

  const openCancel = (slotId: string) => {
    setCancelSlotId(slotId);
    setCancelDate(todayIso());
    setError(null);
  };

  const buildScheduleInput = (): CreateClubSlotInput["schedule"] => {
    if (form.recurrenceType === "once") {
      return {
        recurrence: {
          type: "once",
          date: form.onceDate,
          startTime: form.startTime,
          endTime: form.endTime,
        },
      };
    }
    return {
      recurrence: {
        type: "weekly",
        weekday: Number(form.weekday),
        startTime: form.startTime,
        endTime: form.endTime,
        startsOn: form.startsOn,
        endsOn: form.endsOn.trim() || undefined,
      },
    };
  };

  const resolveClassId = async (): Promise<string | undefined> => {
    if (form.kind !== "class") return undefined;
    if (form.classId) return form.classId;
    if (!form.newClassTitle.trim()) {
      throw new Error(t("slots.errorClassRequired"));
    }
    const created = await createClubClass(clubId, {
      title: form.newClassTitle.trim(),
    });
    return created.id;
  };

  const handleSave = async () => {
    setPending(true);
    setError(null);
    try {
      const resolvedClassId = await resolveClassId();
      const schedule = buildScheduleInput();
      const capacity = Math.max(1, Number(form.capacity) || 1);

      if (editingSlotId) {
        const input: UpdateClubSlotInput = {
          kind: form.kind,
          classId: form.kind === "class" ? resolvedClassId : null,
          capacity,
          schedule,
        };
        await updateClubSlot(clubId, editingSlotId, input);
      } else {
        const input: CreateClubSlotInput = {
          kind: form.kind,
          classId: form.kind === "class" ? resolvedClassId : undefined,
          capacity,
          schedule,
        };
        await createClubSlot(clubId, input);
      }
      setDrawerOpen(false);
      setEditingSlotId(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("slots.errorSave"));
    } finally {
      setPending(false);
    }
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
        <Button size="sm" variant="primary" onPress={openCreate}>
          <Plus size={16} />
          {t("slots.create")}
        </Button>
      </div>

      {error && !drawerOpen && !cancelSlotId ? (
        <p className={styles.error()} role="alert">
          {error}
        </p>
      ) : null}

      {activeSlots.length === 0 ? (
        <p className={styles.muted()}>{t("slots.empty")}</p>
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
                  onPress={() => openEdit(slot)}
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
        isOpen={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditingSlotId(null);
        }}
        title={editingSlotId ? t("slots.editTitle") : t("slots.createTitle")}
      >
        <div className={styles.form()}>
          <Select
            value={form.kind}
            onChange={(value) => {
              if (value === "class" || value === "session") {
                patchForm({ kind: value });
              }
            }}
          >
            <Label>{t("slots.kind")}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="class" textValue={t("slots.kindClass")}>
                  {t("slots.kindClass")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="session" textValue={t("slots.kindSession")}>
                  {t("slots.kindSession")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          {form.kind === "class" ? (
            activeClasses.length > 0 ? (
              <Select
                value={form.classId || activeClasses[0]?.id || null}
                onChange={(value) =>
                  patchForm({ classId: String(value ?? "") })
                }
              >
                <Label>{t("slots.class")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {activeClasses.map((c) => (
                      <ListBox.Item id={c.id} key={c.id} textValue={c.title}>
                        {c.title}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            ) : (
              <TextField
                value={form.newClassTitle}
                onChange={(value) => patchForm({ newClassTitle: value })}
              >
                <Label>{t("slots.newClassTitle")}</Label>
                <Input placeholder={t("slots.newClassPlaceholder")} />
              </TextField>
            )
          ) : null}

          <Select
            value={form.recurrenceType}
            onChange={(value) => {
              if (value === "weekly" || value === "once") {
                patchForm({ recurrenceType: value });
              }
            }}
          >
            <Label>{t("slots.recurrenceType")}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="weekly" textValue={t("slots.recurrenceWeekly")}>
                  {t("slots.recurrenceWeekly")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="once" textValue={t("slots.recurrenceOnce")}>
                  {t("slots.recurrenceOnce")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          {form.recurrenceType === "weekly" ? (
            <>
              <Select
                value={form.weekday}
                onChange={(value) =>
                  patchForm({ weekday: String(value ?? "0") })
                }
              >
                <Label>{t("slots.weekdayLabel")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {WEEKDAY_VALUES.map((d) => (
                      <ListBox.Item
                        id={String(d)}
                        key={d}
                        textValue={t(`slots.weekday.${d}`)}
                      >
                        {t(`slots.weekday.${d}`)}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <TextField
                value={form.startsOn}
                onChange={(value) => patchForm({ startsOn: value })}
              >
                <Label>{t("slots.startsOn")}</Label>
                <Input dir="ltr" placeholder="YYYY-MM-DD" />
              </TextField>
              <TextField
                value={form.endsOn}
                onChange={(value) => patchForm({ endsOn: value })}
              >
                <Label>{t("slots.endsOn")}</Label>
                <Input dir="ltr" placeholder="YYYY-MM-DD" />
              </TextField>
            </>
          ) : (
            <TextField
              value={form.onceDate}
              onChange={(value) => patchForm({ onceDate: value })}
            >
              <Label>{t("slots.onceDate")}</Label>
              <Input dir="ltr" placeholder="YYYY-MM-DD" />
            </TextField>
          )}

          <TextField
            value={form.startTime}
            onChange={(value) => patchForm({ startTime: value })}
          >
            <Label>{t("slots.startTime")}</Label>
            <Input dir="ltr" />
          </TextField>
          <TextField
            value={form.endTime}
            onChange={(value) => patchForm({ endTime: value })}
          >
            <Label>{t("slots.endTime")}</Label>
            <Input dir="ltr" />
          </TextField>
          <TextField
            value={form.capacity}
            onChange={(value) => patchForm({ capacity: value })}
          >
            <Label>{t("slots.capacity")}</Label>
            <Input dir="ltr" inputMode="numeric" />
          </TextField>

          {error ? (
            <p className={styles.error()} role="alert">
              {error}
            </p>
          ) : null}

          <Button
            isDisabled={pending}
            variant="primary"
            onPress={() => void handleSave()}
          >
            {editingSlotId ? t("slots.saveEdit") : t("slots.save")}
          </Button>
        </div>
      </AdminFormDrawer>

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
            <Input dir="ltr" placeholder="YYYY-MM-DD" />
          </TextField>
          {error ? (
            <p className={styles.error()} role="alert">
              {error}
            </p>
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
