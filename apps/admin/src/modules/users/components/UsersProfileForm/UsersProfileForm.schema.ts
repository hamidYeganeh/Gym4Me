import { z } from "zod";

export type UsersProfileFormMessages = {
  nationalIdInvalid: string;
};

export function createUsersProfileFormSchema(
  messages: UsersProfileFormMessages,
) {
  return z.object({
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    nationalId: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || /^\d{10}$/.test(value),
        messages.nationalIdInvalid,
      ),
  });
}

export type UsersProfileFormValues = z.infer<
  ReturnType<typeof createUsersProfileFormSchema>
>;
