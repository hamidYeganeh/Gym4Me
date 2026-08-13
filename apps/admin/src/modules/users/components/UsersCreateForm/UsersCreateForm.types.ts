import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { UsersCreateFormValues } from "./UsersCreateForm.schema";

export type UsersCreateFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: UsersCreateFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  className?: string;
};
