import type { RequestOtpInput } from "@repo/api";

export type AuthLoginOtpRequestFormProps = {
  className?: string;
  defaultPhone?: string;
  error?: string | null;
  isPending?: boolean;
  onSubmit: (payload: RequestOtpInput) => Promise<void>;
  onDismissError?: () => void;
};
