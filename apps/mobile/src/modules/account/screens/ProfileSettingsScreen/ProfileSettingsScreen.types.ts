import type { HTMLAttributes } from "react";

export type ProfileSettingsScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
