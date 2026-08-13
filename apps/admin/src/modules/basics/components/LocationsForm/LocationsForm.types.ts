import type { LocationKind, LocationNode } from "@repo/api";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { LocationsFormValues } from "./LocationsForm.schema";

export type LocationsFormProps = {
  kind: LocationKind;
  parents?: LocationNode[];
  onCancel: () => void;
  onSubmit: (
    values: LocationsFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: LocationsFormValues | null;
  mode?: "create" | "edit";
  className?: string;
};
