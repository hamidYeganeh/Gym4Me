import type { ScheduleWorkoutIntensity } from "@repo/ui/cards/ScheduleWorkoutCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type CoachCalendarDayKey =
  | "sat"
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri";

export type CoachCalendarDay = {
  id: string;
  dayKey: CoachCalendarDayKey;
  date: number;
  hasWorkout: boolean;
};

export type CoachCalendarDailyWorkout = {
  id: string;
  hour: number;
  title: string;
  duration: string;
  category: string;
  intensity: ScheduleWorkoutIntensity;
  image?: string;
};

export type CoachCalendarTimeSlot = {
  hour: number;
  label: string;
};

/** Persian week order: شنبه → جمعه */
export const COACH_CALENDAR_DAYS: CoachCalendarDay[] = [
  { id: "d20", dayKey: "sat", date: 20, hasWorkout: true },
  { id: "d21", dayKey: "sun", date: 21, hasWorkout: true },
  { id: "d22", dayKey: "mon", date: 22, hasWorkout: true },
  { id: "d23", dayKey: "tue", date: 23, hasWorkout: true },
  { id: "d24", dayKey: "wed", date: 24, hasWorkout: false },
  { id: "d25", dayKey: "thu", date: 25, hasWorkout: true },
  { id: "d26", dayKey: "fri", date: 26, hasWorkout: true },
  { id: "d27", dayKey: "sat", date: 27, hasWorkout: true },
];

export const COACH_CALENDAR_DEFAULT_DAY_ID = "d23";

export const COACH_CALENDAR_TIME_SLOTS: CoachCalendarTimeSlot[] = [
  { hour: 7, label: "۷ صبح" },
  { hour: 8, label: "۸" },
  { hour: 9, label: "۹ صبح" },
  { hour: 10, label: "۱۰ صبح" },
  { hour: 11, label: "۱۱ صبح" },
  { hour: 12, label: "۱۲ ظهر" },
  { hour: 13, label: "۱ بعدازظهر" },
  { hour: 14, label: "۲ بعدازظهر" },
  { hour: 15, label: "۳ بعدازظهر" },
  { hour: 16, label: "۴ بعدازظهر" },
  { hour: 17, label: "۵ عصر" },
  { hour: 18, label: "۶ عصر" },
];

export const COACH_CALENDAR_DAILY_WORKOUTS: CoachCalendarDailyWorkout[] = [
  {
    id: "w1",
    hour: 7,
    title: "Morning Mobility Flow",
    duration: "۲۰ دقیقه",
    category: "انعطاف",
    intensity: "normal",
  },
  {
    id: "w2",
    hour: 8,
    title: "HIIT & Cardio Burn",
    duration: "۳۰ دقیقه",
    category: "کاردیو",
    intensity: "intense",
  },
  {
    id: "w3",
    hour: 10,
    title: "Back Powerlifting",
    duration: "۴۵ دقیقه",
    category: "قدرتی",
    intensity: "normal",
  },
  {
    id: "w4",
    hour: 11,
    title: "Boxing Conditioning",
    duration: "۳۵ دقیقه",
    category: "هنرهای رزمی",
    intensity: "intense",
  },
  {
    id: "w5",
    hour: 12,
    title: "Endurance Ride",
    duration: "۴۰ دقیقه",
    category: "کاردیو",
    intensity: "intense",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "w6",
    hour: 14,
    title: "Core Crusher",
    duration: "۲۵ دقیقه",
    category: "مرکزی",
    intensity: "extreme",
  },
  {
    id: "w7",
    hour: 15,
    title: "Legs & Glutes",
    duration: "۵۰ دقیقه",
    category: "قدرتی",
    intensity: "intense",
  },
  {
    id: "w8",
    hour: 17,
    title: "Yoga Recovery",
    duration: "۳۰ دقیقه",
    category: "بازیابی",
    intensity: "normal",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "w9",
    hour: 18,
    title: "Sprint Intervals",
    duration: "۲۰ دقیقه",
    category: "کاردیو",
    intensity: "extreme",
  },
];
