import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { AchievementsFormValues } from "./AchievementsForm.schema";

export type AchievementsFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: AchievementsFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: AchievementsFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
