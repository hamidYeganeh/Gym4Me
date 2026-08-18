import type { PublicUser } from "@repo/api";
import type { UsersProfileFormValues } from "./UsersProfileForm.schema";

export type UsersProfileFormProps = {
  defaultValues: UsersProfileFormValues;
  phone: string;
  user: PublicUser;
  formId?: string;
  onSubmit: (values: UsersProfileFormValues) => Promise<void>;
  className?: string;
};
