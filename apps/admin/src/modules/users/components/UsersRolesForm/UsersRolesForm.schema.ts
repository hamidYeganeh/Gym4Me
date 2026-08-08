import { z } from "zod";
import type { Role } from "@repo/api";
import { USER_ROLES } from "@/shared/lib/user-format";

export type UsersRolesFormMessages = {
  rolesRequired: string;
};

const roleSchema = z.custom<Role>((value) =>
  typeof value === "string" && (USER_ROLES as string[]).includes(value),
);

export function createUsersRolesFormSchema(messages: UsersRolesFormMessages) {
  return z.object({
    roles: z.array(roleSchema).min(1, messages.rolesRequired),
  });
}

export type UsersRolesFormValues = z.infer<
  ReturnType<typeof createUsersRolesFormSchema>
>;
