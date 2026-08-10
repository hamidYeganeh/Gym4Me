import type { ForgotPasswordConfirmInput } from "@repo/api";

export type AuthForgotPasswordOtpFormProps = {
  className?: string;
  phone: string;
  debugCode?: string | null;
  remainingSeconds: number;
  error?: string | null;
  isPending?: boolean;
  isResending?: boolean;
  onSubmit: (payload: ForgotPasswordConfirmInput) => Promise<void>;
  onResend: () => void;
};
