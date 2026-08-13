import type {
  MealAdherence,
  MealAdherenceStatus,
  MealPlan,
  MealPlanStatus,
} from "@repo/api/nutrition";

export type AthleteMealPlanItem = {
  id: string;
  title: string;
  status: MealPlanStatus;
  daysCount: number;
  mealsCount: number;
  updatedLabel: string;
  coachLabel: string | null;
};

export type AthleteMealPlanFoodItem = {
  title: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

export type AthleteMealPlanMeal = {
  name: string;
  items: AthleteMealPlanFoodItem[];
};

export type AthleteMealPlanDay = {
  dayIndex: number;
  meals: AthleteMealPlanMeal[];
};

export type AthleteMealPlanDetail = AthleteMealPlanItem & {
  days: AthleteMealPlanDay[];
  privacy: string;
};

export type AthleteMealLogItem = {
  id: string;
  mealPlanId: string;
  planTitle: string;
  dayIndex: number;
  mealIndex: number;
  status: MealAdherenceStatus;
  loggedLabel: string;
  note: string | null;
};

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function countMeals(plan: MealPlan): number {
  return plan.days.reduce((sum, day) => sum + day.meals.length, 0);
}

export function mapMealPlan(plan: MealPlan): AthleteMealPlanItem {
  return {
    id: plan.id,
    title: plan.title,
    status: plan.status,
    daysCount: plan.days.length,
    mealsCount: countMeals(plan),
    updatedLabel: formatUpdatedAt(plan.updatedAt),
    coachLabel: plan.coachUserId ? "مربی" : null,
  };
}

export function mapMealPlanDetail(plan: MealPlan): AthleteMealPlanDetail {
  return {
    ...mapMealPlan(plan),
    privacy: plan.privacy,
    days: plan.days.map((day) => ({
      dayIndex: day.dayIndex,
      meals: day.meals.map((meal) => ({
        name: meal.name,
        items: meal.items.map((item) => ({
          title: item.title,
          calories: item.calories,
          proteinG: item.proteinG,
          carbsG: item.carbsG,
          fatG: item.fatG,
        })),
      })),
    })),
  };
}

export function mapMealAdherence(
  entry: MealAdherence,
  planTitle: string,
): AthleteMealLogItem {
  return {
    id: entry.id,
    mealPlanId: entry.mealPlanId,
    planTitle,
    dayIndex: entry.slot.dayIndex,
    mealIndex: entry.slot.mealIndex,
    status: entry.status,
    loggedLabel: formatUpdatedAt(entry.loggedAt),
    note: entry.note,
  };
}

export const DEMO_MEAL_PLANS: AthleteMealPlanItem[] = [
  {
    id: "demo-meal-1",
    title: "کاهش چربی · ۴ هفته",
    status: "active",
    daysCount: 7,
    mealsCount: 28,
    updatedLabel: "۲ روز پیش",
    coachLabel: "مربی سارا",
  },
  {
    id: "demo-meal-2",
    title: "حفظ وزن پایه",
    status: "draft",
    daysCount: 3,
    mealsCount: 9,
    updatedLabel: "۱ هفته پیش",
    coachLabel: null,
  },
];

export const DEMO_MEAL_PLAN_DETAIL: AthleteMealPlanDetail = {
  ...DEMO_MEAL_PLANS[0]!,
  privacy: "private",
  days: [
    {
      dayIndex: 0,
      meals: [
        {
          name: "صبحانه",
          items: [
            {
              title: "جو دوسر با موز",
              calories: 320,
              proteinG: 12,
              carbsG: 52,
              fatG: 8,
            },
            {
              title: "قهوه بدون شکر",
              calories: 5,
              proteinG: 0,
              carbsG: 1,
              fatG: 0,
            },
          ],
        },
        {
          name: "ناهار",
          items: [
            {
              title: "سینه مرغ گریل + برنج قهوه‌ای",
              calories: 480,
              proteinG: 42,
              carbsG: 45,
              fatG: 12,
            },
          ],
        },
        {
          name: "شام",
          items: [
            {
              title: "سالاد سبزیجات + ماهی",
              calories: 390,
              proteinG: 35,
              carbsG: 18,
              fatG: 16,
            },
          ],
        },
      ],
    },
    {
      dayIndex: 1,
      meals: [
        {
          name: "صبحانه",
          items: [
            {
              title: "املت سفیده + نان سبوس‌دار",
              calories: 280,
              proteinG: 24,
              carbsG: 22,
              fatG: 10,
            },
          ],
        },
        {
          name: "ناهار",
          items: [
            {
              title: "خوراک عدس + سالاد",
              calories: 410,
              proteinG: 22,
              carbsG: 55,
              fatG: 9,
            },
          ],
        },
      ],
    },
  ],
};

export const DEMO_MEAL_LOGS: AthleteMealLogItem[] = [
  {
    id: "demo-log-1",
    mealPlanId: "demo-meal-1",
    planTitle: "کاهش چربی · ۴ هفته",
    dayIndex: 0,
    mealIndex: 0,
    status: "followed",
    loggedLabel: "امروز",
    note: null,
  },
  {
    id: "demo-log-2",
    mealPlanId: "demo-meal-1",
    planTitle: "کاهش چربی · ۴ هفته",
    dayIndex: 0,
    mealIndex: 1,
    status: "partial",
    loggedLabel: "امروز",
    note: "برنج کمتر خوردم",
  },
  {
    id: "demo-log-3",
    mealPlanId: "demo-meal-1",
    planTitle: "کاهش چربی · ۴ هفته",
    dayIndex: 0,
    mealIndex: 2,
    status: "skipped",
    loggedLabel: "دیروز",
    note: null,
  },
];
