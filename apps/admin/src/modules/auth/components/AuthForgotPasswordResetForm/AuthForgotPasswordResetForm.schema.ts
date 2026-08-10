import { z } from "zod";
import type { ResetPasswordInput } from "@repo/api";
import { isValidPassword } from "@/modules/auth/lib/password";

export type AuthForgotPasswordResetFormMessages = {
  passwordRequired: string;
  passwordWeak: string;
  confirmMismatch: string;
};

export function createAuthForgotPasswordResetFormSchema(
  messages: AuthForgotPasswordResetFormMessages,
) {
  return z
    .object({
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

export type AuthForgotPasswordResetFormValues = z.infer<
  ReturnType<typeof createAuthForgotPasswordResetFormSchema>
>;

export const authForgotPasswordResetFormDefaults: AuthForgotPasswordResetFormValues =
  {
    password: "",
    confirmPassword: "",
  };

/** Builds API reset-password payload from validated form values. */
export function toAuthForgotPasswordResetPayload(
  values: AuthForgotPasswordResetFormValues,
  resetToken: string,
): ResetPasswordInput {
  return {
    resetToken,
    password: values.password,
  };
}
