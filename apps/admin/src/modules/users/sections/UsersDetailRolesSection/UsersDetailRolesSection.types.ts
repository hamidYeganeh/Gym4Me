import type { PublicUser } from "@repo/api";
import type { UsersRolesFormValues } from "../../components/UsersRolesForm";

export type UsersDetailRolesSectionProps = {
  user: PublicUser;
  defaultValues: UsersRolesFormValues;
  onSubmit: (values: UsersRolesFormValues) => Promise<void>;
  className?: string;
};
