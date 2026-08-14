export type AthleteWorkoutPlanStatus =
  | "draft"
  | "active"
  | "completed"
  | "archived";

export type AthleteWorkoutLogStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "skipped"
  | "abandoned";

export type AthleteWorkoutPlanExercise = {
  exerciseId: string;
  label: string;
  plannedSets: number;
  plannedReps: number | null;
};

export type AthleteWorkoutLogSetItem = {
  exerciseId: string;
  reps: number;
  weightKg: number | null;
};

export type AthleteWorkoutLogItem = {
  id: string;
  sessionIndex: number;
  status: AthleteWorkoutLogStatus;
  loggedLabel: string;
  setsCount: number;
  sets: AthleteWorkoutLogSetItem[];
};

export type AthleteWorkoutPlanItem = {
  id: string;
  title: string;
  status: AthleteWorkoutPlanStatus;
  focusLabel: string;
  periodLabel: string;
  weeksCount: number;
  updatedLabel: string;
  programId: string | null;
};

export type AthleteWorkoutPlanDetail = AthleteWorkoutPlanItem & {
  logs: AthleteWorkoutLogItem[];
  exercises: AthleteWorkoutPlanExercise[];
};

export const DEMO_WORKOUT_PLANS: AthleteWorkoutPlanItem[] = [
  {
    id: "demo-plan-1",
    title: "قدرت بالاتنه",
    status: "active",
    focusLabel: "قدرت · هایپرتروفی",
    periodLabel: "۴ هفته",
    weeksCount: 4,
    updatedLabel: "۲ روز پیش",
    programId: "demo-program-1",
  },
  {
    id: "demo-plan-2",
    title: "کاردیو پایه",
    status: "completed",
    focusLabel: "استقامت",
    periodLabel: "۲ هفته",
    weeksCount: 2,
    updatedLabel: "۱ هفته پیش",
    programId: null,
  },
];

export const DEMO_WORKOUT_DETAIL: AthleteWorkoutPlanDetail = {
  ...DEMO_WORKOUT_PLANS[0]!,
  exercises: [
    {
      exerciseId: "demo-ex-1",
      label: "پرس سینه",
      plannedSets: 3,
      plannedReps: 10,
    },
    {
      exerciseId: "demo-ex-2",
      label: "پارویی دمبل",
      plannedSets: 3,
      plannedReps: 12,
    },
  ],
  logs: [
    {
      id: "demo-log-1",
      sessionIndex: 1,
      status: "completed",
      loggedLabel: "امروز · ۰۸:۲۰",
      setsCount: 12,
      sets: [],
    },
    {
      id: "demo-log-2",
      sessionIndex: 2,
      status: "skipped",
      loggedLabel: "دیروز · ۱۹:۱۰",
      setsCount: 0,
      sets: [],
    },
  ],
};
