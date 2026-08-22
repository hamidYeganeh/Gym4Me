import type { ReactNode } from "react";

export type ProfileSettingsFieldRowProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: ReactNode;
  locked?: boolean;
  lockedAriaLabel?: string;
  multiline?: boolean;
  valueDir?: "ltr" | "rtl";
  onPress?: () => void;
  className?: string;
};
