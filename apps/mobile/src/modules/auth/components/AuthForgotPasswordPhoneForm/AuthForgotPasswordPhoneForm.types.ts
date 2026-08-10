import type { ForgotPasswordInput } from "@repo/api";

export type AuthForgotPasswordPhoneFormProps = {
  className?: string;
  error?: string | null;
  isPending?: boolean;
  onSubmit: (payload: ForgotPasswordInput) => Promise<void>;
};
