import type { SportKind, SportNode } from "@repo/api";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { SportsFormValues } from "./SportsForm.schema";

export type SportsFormProps = {
  kind: SportKind;
  parents?: SportNode[];
  onCancel: () => void;
  onSubmit: (
    values: SportsFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: SportsFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
