import type { ForgotPasswordInput } from "@repo/api";

export type AuthForgotPasswordPhoneFormProps = {
  className?: string;
  isPending?: boolean;
  onSubmit: (payload: ForgotPasswordInput) => Promise<void>;
};
