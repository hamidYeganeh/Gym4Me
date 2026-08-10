import type { RequestOtpInput } from "@repo/api";
import type { AuthLoginPasswordPayload } from "./AuthLoginPasswordForm.schema";

export type AuthLoginPasswordFormProps = {
  className?: string;
  error?: string | null;
  isPending?: boolean;
  isOtpPending?: boolean;
  onSubmit: (payload: AuthLoginPasswordPayload) => Promise<void>;
  onOtpLogin: (payload: RequestOtpInput) => Promise<void>;
};
