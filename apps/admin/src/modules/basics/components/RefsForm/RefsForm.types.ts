import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { RefsFormValues } from "./RefsForm.schema";

export type RefsFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: RefsFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: RefsFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
