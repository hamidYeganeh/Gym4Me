import { z } from "zod";
import type { Role } from "@repo/api";
import { USER_ROLES } from "@/shared/lib/user-format";

export type UsersCreateFormMessages = {
  phoneRequired: string;
  rolesRequired: string;
};

const roleSchema = z.custom<Role>((value) =>
  typeof value === "string" && (USER_ROLES as string[]).includes(value),
);

export function createUsersCreateFormSchema(messages: UsersCreateFormMessages) {
  return z.object({
    phone: z.string().trim().min(1, messages.phoneRequired),
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    password: z.string(),
    roles: z.array(roleSchema).min(1, messages.rolesRequired),
  });
}

export type UsersCreateFormValues = z.infer<
  ReturnType<typeof createUsersCreateFormSchema>
>;

export const usersCreateFormDefaults: UsersCreateFormValues = {
  phone: "",
  firstName: "",
  lastName: "",
  password: "",
  roles: ["athlete"],
};
