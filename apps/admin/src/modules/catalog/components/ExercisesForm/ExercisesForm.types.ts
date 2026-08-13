import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { ExercisesFormValues } from "./ExercisesForm.schema";

export type ExercisesFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: ExercisesFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: ExercisesFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
