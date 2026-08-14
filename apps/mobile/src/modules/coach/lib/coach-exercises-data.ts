export type CoachExerciseVerificationStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected";

export type CoachExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  notes: string;
  status: CoachExerciseVerificationStatus;
  updatedLabel: string;
};

export const COACH_EXERCISES: CoachExercise[] = [
  {
    id: "ex1",
    name: "پرس سینه با دمبل شیب دار",
    muscleGroup: "سینه",
    notes: "تمرکز روی بالای سینه",
    status: "approved",
    updatedLabel: "تأیید ۲ هفته پیش",
  },
  {
    id: "ex2",
    name: "کشش کابل تک دست",
    muscleGroup: "پشت",
    notes: "حرکت اصلاحی برای شانه",
    status: "pending",
    updatedLabel: "ارسال ۳ روز پیش",
  },
  {
    id: "ex3",
    name: "اسکات بلغاری با وزنه",
    muscleGroup: "پا",
    notes: "برای شاگردان پیشرفته",
    status: "draft",
    updatedLabel: "پیش‌نویس امروز",
  },
  {
    id: "ex4",
    name: "پلانک جانبی پویا",
    muscleGroup: "میان‌تنه",
    notes: "—",
    status: "rejected",
    updatedLabel: "رد شده — نامشخص",
  },
];
