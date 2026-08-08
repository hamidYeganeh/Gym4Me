export type CoachProgramState = "draft" | "published" | "archived";

export type CoachProgram = {
  id: string;
  title: string;
  focusLabel: string;
  weeks: string;
  sessionsPerWeek: string;
  assignedCount: string;
  state: CoachProgramState;
  updatedLabel: string;
};

export const COACH_PROGRAMS: CoachProgram[] = [
  {
    id: "p1",
    title: "چربی‌سوزی ۸ هفته‌ای",
    focusLabel: "کاهش وزن و کاردیو",
    weeks: "۸",
    sessionsPerWeek: "۴",
    assignedCount: "۱۲",
    state: "published",
    updatedLabel: "به‌روزرسانی ۳ روز پیش",
  },
  {
    id: "p2",
    title: "قدرت پایه با هالتر",
    focusLabel: "قدرتی و پاورلیفتینگ",
    weeks: "۱۲",
    sessionsPerWeek: "۳",
    assignedCount: "۷",
    state: "published",
    updatedLabel: "به‌روزرسانی ۱ هفته پیش",
  },
  {
    id: "p3",
    title: "آمادگی جسمانی مبتدی",
    focusLabel: "تمرین عمومی بدن",
    weeks: "۶",
    sessionsPerWeek: "۳",
    assignedCount: "۰",
    state: "draft",
    updatedLabel: "به‌روزرسانی امروز",
  },
  {
    id: "p4",
    title: "هیپرتروفی بالا‌تنه",
    focusLabel: "افزایش حجم عضلانی",
    weeks: "۱۰",
    sessionsPerWeek: "۵",
    assignedCount: "۴",
    state: "published",
    updatedLabel: "به‌روزرسانی ۲ هفته پیش",
  },
  {
    id: "p5",
    title: "بازگشت بعد از آسیب زانو",
    focusLabel: "توان‌بخشی و حرکات اصلاحی",
    weeks: "۴",
    sessionsPerWeek: "۲",
    assignedCount: "۱",
    state: "draft",
    updatedLabel: "به‌روزرسانی دیروز",
  },
  {
    id: "p6",
    title: "چالش تابستانه ۱۴۰۳",
    focusLabel: "کاردیو و استقامت",
    weeks: "۶",
    sessionsPerWeek: "۴",
    assignedCount: "۲۳",
    state: "archived",
    updatedLabel: "به‌روزرسانی ۲ ماه پیش",
  },
];
