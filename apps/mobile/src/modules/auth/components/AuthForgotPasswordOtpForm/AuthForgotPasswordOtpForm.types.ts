import type { ForgotPasswordConfirmInput } from "@repo/api";

export type AuthForgotPasswordOtpFormProps = {
  className?: string;
  phone: string;
  debugCode?: string | null;
  remainingSeconds: number;
  isPending?: boolean;
  onSubmit: (payload: ForgotPasswordConfirmInput) => Promise<void>;
  onResend: () => void;
};
