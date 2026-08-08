import type { ConfirmOtpInput } from "./account.dto";

export type {
  ConfirmOtpInput,
  ForgotPasswordConfirmInput,
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  OtpRequested,
  RequestOtpInput,
  ResetPasswordInput,
} from "./account.dto";

export type AdminConfirmOtpInput = Pick<ConfirmOtpInput, "phone" | "code">;
