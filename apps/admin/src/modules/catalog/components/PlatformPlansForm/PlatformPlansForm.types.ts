import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { PlatformPlansFormValues } from "./PlatformPlansForm.schema";

export type PlatformPlansFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: PlatformPlansFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: PlatformPlansFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
