import type { MealAdherenceStatus } from "@repo/api/nutrition";
import type { AthleteMealLogItem } from "@/modules/athlete/lib/nutrition-data";

export type AthleteNutritionLogScreenProps = {
  logs: AthleteMealLogItem[];
  pending?: boolean;
  onQuickLog: (
    status: MealAdherenceStatus,
    file?: File,
  ) => void | Promise<void>;
  className?: string;
};
