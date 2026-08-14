export type CoachNutritionMealSlot = "breakfast" | "lunch" | "dinner";

export type CoachNutritionMeal = {
  id: string;
  slot: CoachNutritionMealSlot;
  title: string;
  calories: string;
  items: string[];
};

export type CoachNutritionPlan = {
  id: string;
  title: string;
  clientLabel: string;
  status: "active" | "draft" | "archived";
  updatedLabel: string;
  meals: CoachNutritionMeal[];
};

export const COACH_NUTRITION_PLANS: CoachNutritionPlan[] = [
  {
    id: "np1",
    title: "کاهش وزن — فاز ۱",
    clientLabel: "امیر حسینی",
    status: "active",
    updatedLabel: "به‌روزرسانی ۲ روز پیش",
    meals: [
      {
        id: "m1",
        slot: "breakfast",
        title: "صبحانه",
        calories: "۴۵۰",
        items: ["املت ۲ تخم‌مرغ", "نان سنگک ۱ برش", "گوجه و خیار"],
      },
      {
        id: "m2",
        slot: "lunch",
        title: "ناهار",
        calories: "۶۲۰",
        items: ["مرغ گریل ۱۵۰ گرم", "برنج قهوه‌ای ۱ پیمانه", "سالاد سبزیجات"],
      },
      {
        id: "m3",
        slot: "dinner",
        title: "شام",
        calories: "۵۱۰",
        items: ["ماهی کبابی ۱۸۰ گرم", "سیب‌زمینی پخته", "ماست یونانی"],
      },
    ],
  },
  {
    id: "np2",
    title: "افزایش حجم — هفته ۳",
    clientLabel: "سارا رضایی",
    status: "active",
    updatedLabel: "به‌روزرسانی ۱ هفته پیش",
    meals: [
      {
        id: "m4",
        slot: "breakfast",
        title: "صبحانه",
        calories: "۵۸۰",
        items: ["جو دوسر با موز", "پروتئین وی ۱ اسکوپ", "بادام ۱۵ عدد"],
      },
      {
        id: "m5",
        slot: "lunch",
        title: "ناهار",
        calories: "۷۲۰",
        items: ["گوشت قرمز ۲۰۰ گرم", "برنج ۱.۵ پیمانه", "سبزیجات بخارپز"],
      },
      {
        id: "m6",
        slot: "dinner",
        title: "شام",
        calories: "۶۴۰",
        items: ["مرغ ۱۸۰ گرم", "سیب‌زمینی تنوری", "سالاد"],
      },
    ],
  },
  {
    id: "np3",
    title: "تثبیت وزن",
    clientLabel: "—",
    status: "draft",
    updatedLabel: "پیش‌نویس امروز",
    meals: [
      {
        id: "m7",
        slot: "breakfast",
        title: "صبحانه",
        calories: "—",
        items: ["در انتظار تکمیل"],
      },
      {
        id: "m8",
        slot: "lunch",
        title: "ناهار",
        calories: "—",
        items: ["در انتظار تکمیل"],
      },
      {
        id: "m9",
        slot: "dinner",
        title: "شام",
        calories: "—",
        items: ["در انتظار تکمیل"],
      },
    ],
  },
];

export function getAllCoachNutritionPlanIds(): string[] {
  return COACH_NUTRITION_PLANS.map((plan) => plan.id);
}

export function getCoachNutritionPlan(
  planId: string,
): CoachNutritionPlan | null {
  return COACH_NUTRITION_PLANS.find((plan) => plan.id === planId) ?? null;
}
