import { z } from "zod";
import type { ConfirmOtpInput } from "@repo/api";
import {
  normalizeOtpDigits,
  OTP_LENGTH,
} from "@/modules/auth/lib/phone";

export type AuthLoginOtpFormMessages = {
  codeRequired: string;
  codeInvalid: string;
};

export function createAuthLoginOtpFormSchema(
  messages: AuthLoginOtpFormMessages,
) {
  return z.object({
    code: z
      .string()
      .min(1, messages.codeRequired)
      .length(OTP_LENGTH, messages.codeInvalid),
  });
}

export type AuthLoginOtpFormValues = z.infer<
  ReturnType<typeof createAuthLoginOtpFormSchema>
>;

export const authLoginOtpFormDefaults: AuthLoginOtpFormValues = {
  code: "",
};

/** Builds API confirm-OTP payload from validated form values. */
export function toAuthLoginOtpPayload(
  values: AuthLoginOtpFormValues,
  phone: string,
): ConfirmOtpInput {
  return {
    phone,
    code: normalizeOtpDigits(values.code),
  };
}
