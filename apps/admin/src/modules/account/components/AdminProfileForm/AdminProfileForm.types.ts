export type { AdminProfileFormValues } from "./AdminProfileForm.schema";

export type AdminProfileFormProps = {
  defaultValues: import("./AdminProfileForm.schema").AdminProfileFormValues;
  phone: string;
  formId?: string;
  onSubmit: (
    values: import("./AdminProfileForm.schema").AdminProfileFormValues,
  ) => Promise<void>;
  className?: string;
};
