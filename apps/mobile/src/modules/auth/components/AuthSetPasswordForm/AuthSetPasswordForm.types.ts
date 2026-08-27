import type { SetPasswordInput } from "@repo/api";

export type AuthSetPasswordFormProps = {
  className?: string;
  isPending?: boolean;
  onSubmit: (payload: SetPasswordInput) => Promise<void>;
  /** Hide the current-password field (first-time setup after OTP). */
  requireCurrentPassword?: boolean;
  /** Hide the post-save re-login notice (keeps session on first-time setup). */
  showReloginNote?: boolean;
};
