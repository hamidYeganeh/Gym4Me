import { z } from "zod";
import type { SetPasswordInput } from "@repo/api";
import { isValidPassword } from "@/modules/auth/lib/password-strength";

export type AuthSetPasswordFormMessages = {
  passwordRequired: string;
  passwordWeak: string;
  confirmMismatch: string;
};

export function createAuthSetPasswordFormSchema(
  messages: AuthSetPasswordFormMessages,
) {
  return z
    .object({
      currentPassword: z.string(),
      password: z
        .string()
        .min(1, messages.passwordRequired)
        .refine(isValidPassword, messages.passwordWeak),
      confirmPassword: z.string().min(1, messages.passwordRequired),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: messages.confirmMismatch,
      path: ["confirmPassword"],
    });
}

export type AuthSetPasswordFormValues = z.infer<
  ReturnType<typeof createAuthSetPasswordFormSchema>
>;

export const authSetPasswordFormDefaults: AuthSetPasswordFormValues = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};

/** Builds API set-password payload from validated form values. */
export function toAuthSetPasswordPayload(
  values: AuthSetPasswordFormValues,
): SetPasswordInput {
  const trimmedCurrent = values.currentPassword.trim();
  return {
    password: values.password,
    ...(trimmedCurrent ? { currentPassword: trimmedCurrent } : {}),
  };
}
