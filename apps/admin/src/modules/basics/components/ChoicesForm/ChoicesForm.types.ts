import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { ChoicesFormValues } from "./ChoicesForm.schema";

export type ChoicesFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: ChoicesFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: ChoicesFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
