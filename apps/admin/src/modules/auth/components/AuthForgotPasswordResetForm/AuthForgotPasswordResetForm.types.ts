import type { ResetPasswordInput } from "@repo/api";

export type AuthForgotPasswordResetFormProps = {
  className?: string;
  resetToken: string;
  error?: string | null;
  isPending?: boolean;
  onSubmit: (payload: ResetPasswordInput) => Promise<void>;
};
