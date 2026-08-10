import type { SetPasswordInput } from "@repo/api";

export type AuthSetPasswordFormProps = {
  className?: string;
  error?: string | null;
  isPending?: boolean;
  onSubmit: (payload: SetPasswordInput) => Promise<void>;
};
