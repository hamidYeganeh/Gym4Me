import { z } from "zod";
import type { ForgotPasswordConfirmInput } from "@repo/api";
import {
  normalizeOtpDigits,
  OTP_LENGTH,
} from "@/modules/auth/lib/phone";

export type AuthForgotPasswordOtpFormMessages = {
  codeRequired: string;
  codeInvalid: string;
};

export function createAuthForgotPasswordOtpFormSchema(
  messages: AuthForgotPasswordOtpFormMessages,
) {
  return z.object({
    code: z
      .string()
      .min(1, messages.codeRequired)
      .length(OTP_LENGTH, messages.codeInvalid),
  });
}

export type AuthForgotPasswordOtpFormValues = z.infer<
  ReturnType<typeof createAuthForgotPasswordOtpFormSchema>
>;

export const authForgotPasswordOtpFormDefaults: AuthForgotPasswordOtpFormValues =
  {
    code: "",
  };

/** Builds API forgot-password confirm payload from validated form values. */
export function toAuthForgotPasswordOtpPayload(
  values: AuthForgotPasswordOtpFormValues,
  phone: string,
): ForgotPasswordConfirmInput {
  return {
    phone,
    code: normalizeOtpDigits(values.code),
  };
}
