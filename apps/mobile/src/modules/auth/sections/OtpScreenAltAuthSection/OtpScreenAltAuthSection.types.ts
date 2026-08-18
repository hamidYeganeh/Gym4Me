import type { ReactNode } from "react";

export type OtpScreenAltAuthSectionProps = {
  dividerLabel: string;
  buttonLabel: string;
  onPress: () => void;
  /** Defaults to the lock glyph used on the OTP request screen. */
  icon?: ReactNode;
  className?: string;
};
