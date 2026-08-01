import type { ScheduleWorkoutIntensity } from "@repo/ui/cards/ScheduleWorkoutCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type CoachCalendarWeekDayKey =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export type CoachCalendarWeeklyWorkout = {
  id: string;
  title: string;
  duration: string;
  category: string;
  intensity?: ScheduleWorkoutIntensity;
  image?: string;
};

export type CoachCalendarWeekDay = {
  id: string;
  dayKey: CoachCalendarWeekDayKey;
  workouts: CoachCalendarWeeklyWorkout[];
};

export type CoachCalendarWeek = {
  id: string;
  startLabel: string;
  endLabel: string;
  days: CoachCalendarWeekDay[];
};

function emptyDays(
  prefix: string,
  overrides: Partial<Record<CoachCalendarWeekDayKey, CoachCalendarWeeklyWorkout[]>> = {},
): CoachCalendarWeekDay[] {
  const keys: CoachCalendarWeekDayKey[] = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  return keys.map((dayKey) => ({
    id: `${prefix}-${dayKey.slice(0, 3)}`,
    dayKey,
    workouts: overrides[dayKey] ?? [],
  }));
}

/** Persian week order: شنبه → جمعه. Index 1 is the default/current week. */
export const COACH_CALENDAR_WEEKS: CoachCalendarWeek[] = [
  {
    id: "week-prev-2",
    startLabel: "۸ بهمن",
    endLabel: "۱۵ بهمن",
    days: emptyDays("w-2", {
      saturday: [
        {
          id: "w-2-1",
          title: "Base Strength",
          duration: "۴۰ دقیقه",
          category: "قدرتی",
          intensity: "normal",
        },
      ],
      tuesday: [
        {
          id: "w-2-2",
          title: "Tempo Run",
          duration: "۳۵ دقیقه",
          category: "کاردیو",
          intensity: "intense",
        },
      ],
      friday: [
        {
          id: "w-2-3",
          title: "Stretch & Recover",
          duration: "۲۰ دقیقه",
          category: "بازیابی",
          intensity: "normal",
        },
      ],
    }),
  },
  {
    id: "week-prev-1",
    startLabel: "۱۵ بهمن",
    endLabel: "۲۲ بهمن",
    days: emptyDays("w-1", {
      sunday: [
        {
          id: "w-1-1",
          title: "Upper Hypertrophy",
          duration: "۴۵ دقیقه",
          category: "بالاتنه",
          intensity: "intense",
          image: PLACEHOLDER_IMAGE,
        },
      ],
      wednesday: [
        {
          id: "w-1-2",
          title: "Core Stability",
          duration: "۲۵ دقیقه",
          category: "مرکزی",
          intensity: "normal",
        },
      ],
      thursday: [
        {
          id: "w-1-3",
          title: "Zone 2 Cardio",
          duration: "۴۰ دقیقه",
          category: "کاردیو",
          intensity: "normal",
        },
      ],
    }),
  },
  {
    id: "week-current",
    startLabel: "۲۲ بهمن",
    endLabel: "۲۹ بهمن",
    days: emptyDays("w0", {
      saturday: [
        {
          id: "ww1",
          title: "Full Body Activation",
          duration: "۳۵ دقیقه",
          category: "قدرتی",
          intensity: "normal",
        },
      ],
      sunday: [
        {
          id: "ww2",
          title: "Long Run",
          duration: "۵۰ دقیقه",
          category: "کاردیو",
          intensity: "intense",
          image: PLACEHOLDER_IMAGE,
        },
      ],
      monday: [
        {
          id: "ww3",
          title: "Push Day",
          duration: "۴۵ دقیقه",
          category: "بالاتنه",
          intensity: "intense",
        },
        {
          id: "ww4",
          title: "Core Finisher",
          duration: "۱۵ دقیقه",
          category: "مرکزی",
          intensity: "normal",
        },
      ],
      tuesday: [
        {
          id: "ww5",
          title: "Introduction to Kickboxing",
          duration: "۲۰ دقیقه",
          category: "بالاتنه",
          intensity: "normal",
        },
      ],
      wednesday: [
        {
          id: "ww6",
          title: "Pull Strength",
          duration: "۴۰ دقیقه",
          category: "قدرتی",
          intensity: "intense",
        },
      ],
      thursday: [
        {
          id: "ww7",
          title: "HIIT Circuit",
          duration: "۳۰ دقیقه",
          category: "کاردیو",
          intensity: "extreme",
        },
        {
          id: "ww8",
          title: "Mobility Cool-down",
          duration: "۱۵ دقیقه",
          category: "انعطاف",
          intensity: "normal",
        },
      ],
      friday: [
        {
          id: "ww9",
          title: "Restorative Yoga",
          duration: "۲۵ دقیقه",
          category: "بازیابی",
          intensity: "normal",
          image: PLACEHOLDER_IMAGE,
        },
      ],
    }),
  },
  {
    id: "week-next-1",
    startLabel: "۲۹ بهمن",
    endLabel: "۶ اسفند",
    days: emptyDays("w1", {
      saturday: [
        {
          id: "w1-1",
          title: "Olympic Lift Primer",
          duration: "۴۰ دقیقه",
          category: "قدرتی",
          intensity: "intense",
        },
      ],
      monday: [
        {
          id: "w1-2",
          title: "Swim Endurance",
          duration: "۴۵ دقیقه",
          category: "کاردیو",
          intensity: "normal",
          image: PLACEHOLDER_IMAGE,
        },
      ],
      wednesday: [
        {
          id: "w1-3",
          title: "Legs & Posterior Chain",
          duration: "۵۰ دقیقه",
          category: "قدرتی",
          intensity: "extreme",
        },
      ],
      friday: [
        {
          id: "w1-4",
          title: "Breathwork + Stretch",
          duration: "۲۰ دقیقه",
          category: "بازیابی",
          intensity: "normal",
        },
      ],
    }),
  },
  {
    id: "week-next-2",
    startLabel: "۶ اسفند",
    endLabel: "۱۳ اسفند",
    days: emptyDays("w2", {
      sunday: [
        {
          id: "w2-1",
          title: "Trail Hike Prep",
          duration: "۵۵ دقیقه",
          category: "کاردیو",
          intensity: "intense",
        },
      ],
      tuesday: [
        {
          id: "w2-2",
          title: "Shoulder Health",
          duration: "۳۰ دقیقه",
          category: "انعطاف",
          intensity: "normal",
        },
      ],
      thursday: [
        {
          id: "w2-3",
          title: "MetCon Blast",
          duration: "۲۵ دقیقه",
          category: "کاردیو",
          intensity: "extreme",
          image: PLACEHOLDER_IMAGE,
        },
      ],
    }),
  },
];

export const COACH_CALENDAR_DEFAULT_WEEK_INDEX = 2;
