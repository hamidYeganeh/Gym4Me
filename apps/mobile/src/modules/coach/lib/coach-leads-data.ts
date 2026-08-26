export type CoachLeadStage =
  | "new"
  | "contacted"
  | "trial"
  | "converted"
  | "lost";

export type CoachLead = {
  id: string;
  name: string;
  phoneLabel: string;
  sourceLabel: string;
  note: string;
  stage: CoachLeadStage;
  updatedLabel: string;
  athleteUserId?: string;
};

export type CreateCoachLeadFormInput = {
  name: string;
  phone?: string;
  source?: string;
  notes?: string;
};

export const COACH_LEADS: CoachLead[] = [
  {
    id: "lead1",
    name: "محمد علوی",
    phoneLabel: "۰۹۱۲***۴۵۶۷",
    sourceLabel: "اینستاگرام",
    note: "علاقه‌مند به کاهش وزن",
    stage: "new",
    updatedLabel: "ثبت ۲ ساعت پیش",
  },
  {
    id: "lead2",
    name: "نیلوفر احمدی",
    phoneLabel: "۰۹۳۵***۱۲۳۴",
    sourceLabel: "معرفی شاگرد",
    note: "جلسه آزمایشی درخواست کرد",
    stage: "contacted",
    updatedLabel: "تماس دیروز",
  },
  {
    id: "lead3",
    name: "علی مرادی",
    phoneLabel: "۰۹۱۹***۸۹۰۱",
    sourceLabel: "وب‌سایت",
    note: "در حال جلسه آزمایشی",
    stage: "trial",
    updatedLabel: "جلسه فردا",
  },
  {
    id: "lead4",
    name: "فاطمه نوری",
    phoneLabel: "۰۹۳۷***۵۶۷۸",
    sourceLabel: "اینستاگرام",
    note: "خرید بسته ۸ جلسه‌ای",
    stage: "converted",
    updatedLabel: "تبدیل ۳ روز پیش",
  },
  {
    id: "lead5",
    name: "حسین جعفری",
    phoneLabel: "۰۹۱۳***۲۳۴۵",
    sourceLabel: "تبلیغات",
    note: "بودجه کافی نداشت",
    stage: "lost",
    updatedLabel: "بسته ۱ هفته پیش",
  },
];

export const COACH_LEAD_STAGES: CoachLeadStage[] = [
  "new",
  "contacted",
  "trial",
  "converted",
  "lost",
];
