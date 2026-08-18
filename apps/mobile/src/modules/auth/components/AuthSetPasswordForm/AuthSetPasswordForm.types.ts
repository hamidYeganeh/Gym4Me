import type { SetPasswordInput } from "@repo/api";

export type AuthSetPasswordFormProps = {
  className?: string;
  isPending?: boolean;
  onSubmit: (payload: SetPasswordInput) => Promise<void>;
};
