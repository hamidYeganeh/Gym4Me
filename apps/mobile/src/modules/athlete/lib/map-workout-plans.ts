import type { WorkoutLog, WorkoutPlan } from "@repo/api";
import type {
  AthleteWorkoutLogItem,
  AthleteWorkoutPlanDetail,
  AthleteWorkoutPlanExercise,
  AthleteWorkoutPlanItem,
  AthleteWorkoutPlanStatus,
} from "./workout-programs-data";
import { toPersianDigits } from "./weight/format";

function periodLabel(plan: WorkoutPlan): string {
  const weeks = plan.weeks?.length ?? 0;
  if (weeks > 0) return `${toPersianDigits(weeks)} هفته`;
  if (plan.period?.start && plan.period?.end) {
    return `${new Date(plan.period.start).toLocaleDateString("fa-IR")} – ${new Date(plan.period.end).toLocaleDateString("fa-IR")}`;
  }
  return "—";
}

export function mapWorkoutPlan(plan: WorkoutPlan): AthleteWorkoutPlanItem {
  return {
    id: plan.id,
    title: plan.title,
    status: plan.status as AthleteWorkoutPlanStatus,
    focusLabel: plan.programId ? "برنامه مربی" : "برنامه شخصی",
    periodLabel: periodLabel(plan),
    weeksCount: plan.weeks?.length ?? 0,
    updatedLabel: new Date(plan.updatedAt).toLocaleDateString("fa-IR"),
    programId: plan.programId,
  };
}

export function flattenPlanExercises(
  plan: WorkoutPlan,
  nameById: Map<string, string> = new Map(),
): AthleteWorkoutPlanExercise[] {
  const seen = new Map<string, AthleteWorkoutPlanExercise>();
  for (const week of plan.weeks ?? []) {
    for (const day of week.days ?? []) {
      for (const exercise of day.exercises ?? []) {
        if (seen.has(exercise.exerciseId)) continue;
        seen.set(exercise.exerciseId, {
          exerciseId: exercise.exerciseId,
          label:
            nameById.get(exercise.exerciseId) ??
            `تمرین ${exercise.exerciseId.slice(-4)}`,
          plannedSets: exercise.sets,
          plannedReps: exercise.reps,
        });
      }
    }
  }
  return [...seen.values()];
}

export function mapWorkoutLog(log: WorkoutLog): AthleteWorkoutLogItem {
  return {
    id: log.id,
    sessionIndex: log.sessionIndex,
    status: log.status,
    loggedLabel: new Date(log.loggedAt).toLocaleString("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    setsCount: log.sets.length,
    sets: log.sets.map((set) => ({
      exerciseId: set.exerciseId,
      reps: set.reps,
      weightKg: set.weightKg,
      durationSec: set.durationSec,
      distanceM: set.distanceM,
      rpe: set.rpe,
    })),
    note: log.note,
    pain: log.pain,
    planRevisionId: log.planRevisionId,
    reviews: log.reviews.map((review) => ({
      id: review.id,
      note: review.note,
      reviewedAt: review.reviewedAt,
    })),
  };
}

export function mapWorkoutPlanDetail(
  plan: WorkoutPlan,
  logs: WorkoutLog[],
  nameById?: Map<string, string>,
): AthleteWorkoutPlanDetail {
  return {
    ...mapWorkoutPlan(plan),
    exercises: flattenPlanExercises(plan, nameById),
    logs: logs.map(mapWorkoutLog),
    currentRevision: plan.currentRevision,
  };
}
