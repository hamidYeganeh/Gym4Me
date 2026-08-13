import type { WorkoutLog, WorkoutPlan } from "@repo/api";
import type {
  AthleteWorkoutLogItem,
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
  };
}
