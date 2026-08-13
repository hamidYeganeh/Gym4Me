import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import type { NotificationTemplatesFormValues } from "./NotificationTemplatesForm.schema";

export type NotificationTemplatesFormProps = {
  onCancel: () => void;
  onSubmit: (
    values: NotificationTemplatesFormValues,
    intent: FormSubmitIntent,
  ) => Promise<void>;
  initialValues?: NotificationTemplatesFormValues | null;
  className?: string;
};
