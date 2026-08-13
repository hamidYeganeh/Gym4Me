import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { FaqFormValues } from "./FaqForm.schema";

export type FaqFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: FaqFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: FaqFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
