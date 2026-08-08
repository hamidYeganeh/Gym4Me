import type { UsersRolesFormValues } from "./UsersRolesForm.schema";

export type UsersRolesFormProps = {
  defaultValues: UsersRolesFormValues;
  onSubmit: (values: UsersRolesFormValues) => Promise<void>;
  className?: string;
};
