import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { FoodItemsFormValues } from "./FoodItemsForm.schema";

export type FoodItemsFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: FoodItemsFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: FoodItemsFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
