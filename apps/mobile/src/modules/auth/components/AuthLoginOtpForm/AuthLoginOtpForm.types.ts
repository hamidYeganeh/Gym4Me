import type { ConfirmOtpInput } from "@repo/api";

export type AuthLoginOtpFormProps = {
  className?: string;
  phone: string;
  debugCode?: string | null;
  remainingSeconds: number;
  notice?: string | null;
  error?: string | null;
  isPending?: boolean;
  isResending?: boolean;
  onSubmit: (payload: ConfirmOtpInput) => Promise<void>;
  onResend: () => void;
  onDismissError?: () => void;
};
