import type { AuthLoginPasswordPayload } from "./AuthLoginPasswordForm.schema";

export type AuthLoginPasswordFormProps = {
  className?: string;
  error?: string | null;
  isPending?: boolean;
  forgotPasswordHref?: string;
  onForgotPassword?: () => void;
  onSubmit: (payload: AuthLoginPasswordPayload) => Promise<void>;
  onDismissError?: () => void;
};
