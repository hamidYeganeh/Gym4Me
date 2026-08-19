import type {
  UpdateAthleteProfileInput,
  UpdateMeInput,
} from "@repo/api";
import type {
  OnboardingMoodId,
  OnboardingSleepLevel,
} from "@/modules/app/lib/onboarding-data";
import { accountProfile, accountProgress } from "@/shared/lib/api";
import { createClientMutationId } from "@/shared/lib/offline-queue";

export type OnboardingSaveStepId =
  | "weight"
  | "height"
  | "sleep"
  | "mood"
  | "calories"
  | "goals"
  | "sports"
  | "profile";

export type OnboardingSaveStepStatus =
  | "pending"
  | "active"
  | "done"
  | "error";

export type OnboardingSaveStepView = {
  id: OnboardingSaveStepId;
  status: OnboardingSaveStepStatus;
};

export type OnboardingSaveContext = {
  weightKg: number;
  heightCm: number;
  weightProvided: boolean;
  heightProvided: boolean;
  sleep: OnboardingSleepLevel;
  mood: OnboardingMoodId;
  calories: number;
  caloriesKnown: boolean;
  goals: string[];
  sportIds: string[];
  meInput: UpdateMeInput;
  athleteInput: UpdateAthleteProfileInput;
};

const MOOD_METRIC_VALUE: Record<OnboardingMoodId, number> = {
  depressed: 1,
  sad: 2,
  neutral: 3,
  happy: 4,
  overjoyed: 5,
};

const SAVE_STEP_ORDER: OnboardingSaveStepId[] = [
  "weight",
  "height",
  "sleep",
  "mood",
  "calories",
  "goals",
  "sports",
  "profile",
];

export function selectOnboardingSaveSteps(
  ctx: OnboardingSaveContext,
): OnboardingSaveStepId[] {
  return SAVE_STEP_ORDER.filter((id) => {
    if (id === "weight") return ctx.weightProvided;
    if (id === "height") return ctx.heightProvided;
    if (id === "calories") return ctx.caloriesKnown && ctx.calories > 0;
    if (id === "sports") return ctx.sportIds.length > 0;
    if (id === "goals") return ctx.goals.length > 0;
    return true;
  });
}

export function activeSaveIndex(steps: OnboardingSaveStepView[]): number {
  const idx = steps.findIndex(
    (step) =>
      step.status === "active" ||
      step.status === "error" ||
      step.status === "pending",
  );
  return idx === -1 ? Math.max(steps.length - 1, 0) : idx;
}

export function visibleSaveWindow<T>(
  items: T[],
  activeIndex: number,
  size = 3,
): T[] {
  if (items.length <= size) return items;
  const lastStart = items.length - size;
  const start = Math.min(Math.max(activeIndex - 1, 0), lastStart);
  return items.slice(start, start + size);
}

export function ensureSaveMutationId(
  ids: Partial<Record<OnboardingSaveStepId, string>>,
  step: OnboardingSaveStepId,
): string {
  const existing = ids[step];
  if (existing) return existing;
  const next = createClientMutationId(`onboarding-${step}`);
  ids[step] = next;
  return next;
}

function recordedNow(): string {
  return new Date().toISOString();
}

async function createMetric(input: {
  metricKey: string;
  value: number;
  unit: string;
  note?: string;
  clientMutationId: string;
}) {
  await accountProgress.createMetric({
    metricKey: input.metricKey,
    value: input.value,
    unit: input.unit,
    recordedAt: recordedNow(),
    note: input.note,
    privacy: "private",
    source: "manual",
    clientMutationId: input.clientMutationId,
  });
}

export async function runOnboardingSaveStep(
  id: OnboardingSaveStepId,
  ctx: OnboardingSaveContext,
  mutationIds: Partial<Record<OnboardingSaveStepId, string>>,
): Promise<void> {
  const clientMutationId = ensureSaveMutationId(mutationIds, id);

  switch (id) {
    case "weight":
      await createMetric({
        metricKey: "weight_kg",
        value: ctx.weightKg,
        unit: "kg",
        clientMutationId,
      });
      return;
    case "height":
      await createMetric({
        metricKey: "height_cm",
        value: ctx.heightCm,
        unit: "cm",
        clientMutationId,
      });
      return;
    case "sleep":
      await createMetric({
        metricKey: "sleep_quality",
        value: ctx.sleep,
        unit: "score",
        clientMutationId,
      });
      return;
    case "mood":
      await createMetric({
        metricKey: "mood",
        value: MOOD_METRIC_VALUE[ctx.mood],
        unit: "score",
        note: ctx.mood,
        clientMutationId,
      });
      return;
    case "calories":
      await createMetric({
        metricKey: "calories_kcal",
        value: ctx.calories,
        unit: "kcal",
        clientMutationId,
      });
      return;
    case "goals":
      await accountProfile.updateAthlete({ goalKeys: ctx.goals });
      return;
    case "sports":
      await accountProfile.updateAthlete({ sportIds: ctx.sportIds });
      return;
    case "profile":
      await Promise.all([
        accountProfile.updateMe(ctx.meInput),
        accountProfile.updateAthlete(ctx.athleteInput),
      ]);
      return;
  }
}

export function minStepVisibleMs(reduceMotion: boolean | null): number {
  return reduceMotion ? 0 : 450;
}

export async function waitRemaining(startedAt: number, minMs: number) {
  const remaining = minMs - (Date.now() - startedAt);
  if (remaining <= 0) return;
  await new Promise((resolve) => {
    setTimeout(resolve, remaining);
  });
}
