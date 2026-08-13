import { z } from "zod";
import type {
  AdminPointRule,
  GamificationSubjectType,
  PointRuleEvent,
  PointRuleRepeat,
} from "@repo/api";
import {
  POINT_RULE_EVENTS,
  POINT_RULE_REPEATS,
  SUBJECT_TYPES,
} from "../../lib/gamification-constants";

export type PointRulesFormMessages = { required: string };

const eventSchema = z.custom<PointRuleEvent>(
  (value) =>
    typeof value === "string" && (POINT_RULE_EVENTS as string[]).includes(value),
);
const repeatSchema = z.custom<PointRuleRepeat>(
  (value) =>
    typeof value === "string" && (POINT_RULE_REPEATS as string[]).includes(value),
);

export function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function fromLocalInputValue(value: string) {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function createPointRulesFormSchema(messages: PointRulesFormMessages) {
  return z
    .object({
      title: z.string().trim().min(2, messages.required),
      description: z.string(),
      event: eventSchema,
      awards: z.object({
        athlete: z.string(),
        coach: z.string(),
        club: z.string(),
      }),
      repeat: repeatSchema,
      dailyCap: z.string(),
      effectiveFrom: z.string(),
      effectiveTo: z.string(),
    })
    .superRefine((values, ctx) => {
      const hasAward = SUBJECT_TYPES.some((subjectType) => {
        const points = Number.parseInt(values.awards[subjectType], 10);
        return Number.isFinite(points) && points > 0;
      });
      if (!hasAward) {
        ctx.addIssue({
          code: "custom",
          path: ["awards", "athlete"],
          message: messages.required,
        });
      }
    });
}

export type PointRulesFormValues = z.infer<
  ReturnType<typeof createPointRulesFormSchema>
>;

export const pointRulesFormDefaults: PointRulesFormValues = {
  title: "",
  description: "",
  event: "booking_completed",
  awards: { athlete: "", coach: "", club: "" },
  repeat: "unlimited",
  dailyCap: "",
  effectiveFrom: "",
  effectiveTo: "",
};

export function awardsFromForm(
  awards: PointRulesFormValues["awards"],
): { subjectType: GamificationSubjectType; points: number }[] {
  return SUBJECT_TYPES.flatMap((subjectType) => {
    const points = Number.parseInt(awards[subjectType], 10);
    return Number.isFinite(points) && points > 0
      ? [{ subjectType, points }]
      : [];
  });
}

export function pointRuleToFormValues(item: AdminPointRule): PointRulesFormValues {
  const awards = { ...pointRulesFormDefaults.awards };
  for (const award of item.awards) {
    awards[award.subjectType] = String(award.points);
  }
  return {
    title: item.title,
    description: item.description ?? "",
    event: item.event,
    awards,
    repeat: item.limits.repeat,
    dailyCap: item.limits.dailyCap ? String(item.limits.dailyCap) : "",
    effectiveFrom: toLocalInputValue(item.effective.from),
    effectiveTo: toLocalInputValue(item.effective.to),
  };
}
