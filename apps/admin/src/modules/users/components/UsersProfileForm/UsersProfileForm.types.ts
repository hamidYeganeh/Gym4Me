import type { UsersProfileFormValues } from "./UsersProfileForm.schema";

export type UsersProfileFormProps = {
  defaultValues: UsersProfileFormValues;
  onSubmit: (values: UsersProfileFormValues) => Promise<void>;
  className?: string;
};
