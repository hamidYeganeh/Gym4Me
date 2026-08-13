import { z } from "zod";
import type { ClubSlot, SlotKind, SlotRecurrenceType } from "@repo/api";

export type ClubSlotsFormMessages = { required: string; classRequired: string };

const kindSchema = z.custom<SlotKind>(
  (value) => value === "class" || value === "session",
);
const recurrenceSchema = z.custom<SlotRecurrenceType>(
  (value) => value === "weekly" || value === "once",
);

export function todayIso() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function createClubSlotsFormSchema(messages: ClubSlotsFormMessages) {
  return z
    .object({
      kind: kindSchema,
      classId: z.string(),
      newClassTitle: z.string(),
      capacity: z.string().trim().min(1, messages.required),
      recurrenceType: recurrenceSchema,
      weekday: z.string(),
      onceDate: z.string(),
      startTime: z.string().trim().min(1, messages.required),
      endTime: z.string().trim().min(1, messages.required),
      startsOn: z.string(),
      endsOn: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.kind === "class" && !values.classId && !values.newClassTitle.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["newClassTitle"],
          message: messages.classRequired,
        });
      }
      if (values.recurrenceType === "once" && !values.onceDate.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["onceDate"],
          message: messages.required,
        });
      }
      if (values.recurrenceType === "weekly" && !values.startsOn.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["startsOn"],
          message: messages.required,
        });
      }
    });
}

export type ClubSlotsFormValues = z.infer<
  ReturnType<typeof createClubSlotsFormSchema>
>;

export const clubSlotsFormDefaults: ClubSlotsFormValues = {
  kind: "class",
  classId: "",
  newClassTitle: "",
  capacity: "20",
  recurrenceType: "weekly",
  weekday: "0",
  onceDate: todayIso(),
  startTime: "08:00",
  endTime: "09:00",
  startsOn: todayIso(),
  endsOn: "",
};

export function slotToFormValues(slot: ClubSlot): ClubSlotsFormValues {
  const r = slot.schedule.recurrence;
  return {
    kind: slot.kind === "session" ? "session" : "class",
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
