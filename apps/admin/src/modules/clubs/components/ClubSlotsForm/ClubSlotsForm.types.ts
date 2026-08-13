import type { ClubClass } from "@repo/api";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { ClubSlotsFormValues } from "./ClubSlotsForm.schema";

export type ClubSlotsFormProps = {
  classes: ClubClass[];
  onCancel: () => void;
  onSubmit: (
    values: ClubSlotsFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: ClubSlotsFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
