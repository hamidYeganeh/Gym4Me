import type { HTMLAttributes } from "react";

export type SecuritySettingsScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
