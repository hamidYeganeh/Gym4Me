import { z } from "zod";
import type { ForgotPasswordInput } from "@repo/api";
import {
  isIranPhoneInput,
  normalizeIranPhoneInput,
} from "@/modules/auth/lib/phone";

export type AuthForgotPasswordPhoneFormMessages = {
  phoneRequired: string;
  phoneInvalid: string;
};

export function createAuthForgotPasswordPhoneFormSchema(
  messages: AuthForgotPasswordPhoneFormMessages,
) {
  return z.object({
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneRequired)
      .refine(isIranPhoneInput, messages.phoneInvalid),
  });
}

export type AuthForgotPasswordPhoneFormValues = z.infer<
  ReturnType<typeof createAuthForgotPasswordPhoneFormSchema>
>;

export const authForgotPasswordPhoneFormDefaults: AuthForgotPasswordPhoneFormValues =
  {
    phone: "",
  };

/** Builds API forgot-password payload from validated form values. */
export function toAuthForgotPasswordPhonePayload(
  values: AuthForgotPasswordPhoneFormValues,
): ForgotPasswordInput {
  return {
    phone: normalizeIranPhoneInput(values.phone) ?? values.phone.trim(),
  };
}
