import type { HTMLAttributes } from "react";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from "@repo/api";

export type NotificationSettingsScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
  preferences: NotificationPreferences;
  pending?: boolean;
  error?: string | null;
  onUpdate?: (input: UpdateNotificationPreferencesInput) => Promise<void> | void;
};
