import { z } from "zod";
import type { LoginInput, RequestOtpInput } from "@repo/api";
import {
  isIranPhoneInput,
  normalizeIranPhoneInput,
} from "@/modules/auth/lib/phone";

export type AuthLoginPasswordFormMessages = {
  phoneRequired: string;
  phoneInvalid: string;
  passwordRequired: string;
};

export function createAuthLoginPasswordFormSchema(
  messages: AuthLoginPasswordFormMessages,
) {
  return z.object({
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneRequired)
      .refine(isIranPhoneInput, messages.phoneInvalid),
    password: z.string().min(1, messages.passwordRequired),
    remember: z.boolean(),
  });
}

export type AuthLoginPasswordFormValues = z.infer<
  ReturnType<typeof createAuthLoginPasswordFormSchema>
>;

export const authLoginPasswordFormDefaults: AuthLoginPasswordFormValues = {
  phone: "",
  password: "",
  remember: true,
};

export type AuthLoginPasswordPayload = LoginInput & {
  remember: boolean;
};

export function toAuthLoginPasswordPayload(
  values: AuthLoginPasswordFormValues,
): AuthLoginPasswordPayload {
  return {
    phone: normalizeIranPhoneInput(values.phone) ?? values.phone.trim(),
    password: values.password,
    remember: values.remember,
  };
}

/** Builds API request-OTP payload from a validated phone value. */
export function toAuthLoginOtpRequestPayload(phone: string): RequestOtpInput {
  return {
    phone: normalizeIranPhoneInput(phone) ?? phone.trim(),
  };
}
