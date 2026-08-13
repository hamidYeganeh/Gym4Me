import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { BannersFormValues } from "./BannersForm.schema";

export type BannersFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: BannersFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: BannersFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
