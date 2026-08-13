import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { MetricTypesFormValues } from "./MetricTypesForm.schema";

export type MetricTypesFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: MetricTypesFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: MetricTypesFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
