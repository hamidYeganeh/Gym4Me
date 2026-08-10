import { z } from "zod";
import type { RequestOtpInput } from "@repo/api";
import {
  isIranPhoneInput,
  normalizeIranPhoneInput,
} from "@/modules/auth/lib/phone";

export type AuthLoginOtpRequestFormMessages = {
  phoneRequired: string;
  phoneInvalid: string;
};

export function createAuthLoginOtpRequestFormSchema(
  messages: AuthLoginOtpRequestFormMessages,
) {
  return z.object({
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneRequired)
      .refine(isIranPhoneInput, messages.phoneInvalid),
  });
}

export type AuthLoginOtpRequestFormValues = z.infer<
  ReturnType<typeof createAuthLoginOtpRequestFormSchema>
>;

export const authLoginOtpRequestFormDefaults: AuthLoginOtpRequestFormValues = {
  phone: "",
};

export function toAuthLoginOtpRequestPayload(
  values: AuthLoginOtpRequestFormValues,
): RequestOtpInput {
  return {
    phone: normalizeIranPhoneInput(values.phone) ?? values.phone.trim(),
  };
}
