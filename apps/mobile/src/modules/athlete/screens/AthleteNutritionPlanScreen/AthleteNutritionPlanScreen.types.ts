import type { MealAdherenceStatus } from "@repo/api/nutrition";
import type { AthleteMealPlanDetail } from "@/modules/athlete/lib/nutrition-data";

export type AthleteNutritionPlanScreenProps = {
  detail: AthleteMealPlanDetail;
  pendingSlot?: string | null;
  onLogMeal: (
    dayIndex: number,
    mealIndex: number,
    status: MealAdherenceStatus,
  ) => void | Promise<void>;
  className?: string;
};
