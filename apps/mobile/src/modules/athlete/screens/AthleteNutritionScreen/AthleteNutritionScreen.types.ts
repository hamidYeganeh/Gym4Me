import type { AthleteMealPlanItem } from "@/modules/athlete/lib/nutrition-data";

export type AthleteNutritionScreenProps = {
  plans: AthleteMealPlanItem[];
  className?: string;
};
