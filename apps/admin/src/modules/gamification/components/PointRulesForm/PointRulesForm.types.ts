import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { PointRulesFormValues } from "./PointRulesForm.schema";

export type PointRulesFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: PointRulesFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: PointRulesFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
