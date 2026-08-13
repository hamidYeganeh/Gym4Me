import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { ClubsCreateFormValues } from "./ClubsCreateForm.schema";

export type ClubsCreateFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: ClubsCreateFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  /** When set, form opens in edit mode with these values. */
  initialValues?: ClubsCreateFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
