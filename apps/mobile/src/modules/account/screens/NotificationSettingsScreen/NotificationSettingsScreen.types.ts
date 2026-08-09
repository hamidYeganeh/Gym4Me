import type { HTMLAttributes } from "react";

export type NotificationSettingsScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
};
