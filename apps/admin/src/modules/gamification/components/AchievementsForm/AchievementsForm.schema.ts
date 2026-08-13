import { z } from "zod";
import type {
  AchievementGrantMode,
  AchievementMetric,
  AdminAchievement,
  GamificationSubjectType,
} from "@repo/api";
import {
  ACHIEVEMENT_METRICS,
  GRANT_MODES,
  SUBJECT_TYPES,
} from "../../lib/gamification-constants";

export type AchievementsFormMessages = { required: string };

const audienceSchema = z.custom<GamificationSubjectType>(
  (value) =>
    typeof value === "string" && (SUBJECT_TYPES as string[]).includes(value),
);
const grantModeSchema = z.custom<AchievementGrantMode>(
  (value) =>
    typeof value === "string" && (GRANT_MODES as string[]).includes(value),
);
const metricSchema = z.custom<AchievementMetric>(
  (value) =>
    typeof value === "string" &&
    (ACHIEVEMENT_METRICS as string[]).includes(value),
);

export function createAchievementsFormSchema(messages: AchievementsFormMessages) {
  return z
    .object({
      title: z.string().trim().min(2, messages.required),
      description: z.string(),
      icon: z.string(),
      audience: z.array(audienceSchema).min(1, messages.required),
      grantMode: grantModeSchema,
      metric: metricSchema,
      threshold: z.string(),
      bonusPoints: z.string(),
      order: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.grantMode !== "automatic") return;
      const threshold = Number.parseInt(values.threshold, 10);
      if (!Number.isFinite(threshold) || threshold < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["threshold"],
          message: messages.required,
        });
      }
    });
}

export type AchievementsFormValues = z.infer<
  ReturnType<typeof createAchievementsFormSchema>
>;

export const achievementsFormDefaults: AchievementsFormValues = {
  title: "",
  description: "",
  icon: "",
  audience: ["athlete"],
  grantMode: "automatic",
  metric: "lifetime_points",
  threshold: "1",
  bonusPoints: "0",
  order: "0",
};

export function achievementToFormValues(
  item: AdminAchievement,
): AchievementsFormValues {
  return {
    title: item.title,
    description: item.description ?? "",
    icon: item.icon ?? "",
    audience: item.audience,
    grantMode: item.grant.mode,
    metric: item.grant.rule?.metric ?? "lifetime_points",
    threshold: String(item.grant.rule?.threshold ?? 1),
    bonusPoints: String(item.bonusPoints),
    order: String(item.order),
  };
}
