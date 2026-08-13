export type AthleteWorkoutPlanStatus =
  | "draft"
  | "active"
  | "completed"
  | "archived";

export type AthleteWorkoutLogStatus = "completed" | "skipped";

export type AthleteWorkoutLogItem = {
  id: string;
  sessionIndex: number;
  status: AthleteWorkoutLogStatus;
  loggedLabel: string;
  setsCount: number;
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
  logs: [
    {
      id: "demo-log-1",
      sessionIndex: 1,
      status: "completed",
      loggedLabel: "امروز · ۰۸:۲۰",
      setsCount: 12,
    },
    {
      id: "demo-log-2",
      sessionIndex: 2,
      status: "skipped",
      loggedLabel: "دیروز · ۱۹:۱۰",
      setsCount: 0,
    },
  ],
};
