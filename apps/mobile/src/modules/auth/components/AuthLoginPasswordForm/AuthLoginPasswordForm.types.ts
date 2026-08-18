import type { AuthLoginPasswordPayload } from "./AuthLoginPasswordForm.schema";

export type AuthLoginPasswordFormProps = {
  className?: string;
  isPending?: boolean;
  forgotPasswordHref?: string;
  onForgotPassword?: () => void;
  onSubmit: (payload: AuthLoginPasswordPayload) => Promise<void>;
};
