import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { ArticlesFormValues } from "./ArticlesForm.schema";

export type ArticlesFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: ArticlesFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: ArticlesFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
