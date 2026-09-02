import type { ApiEntity, PaginationParams } from "../organizations/types";
export type { ApiEntity };
export interface NotificationListParams extends PaginationParams {
  status?: string;
  unread_only?: boolean;
}
export interface NotificationPreferenceInput {
  channels?: {
    in_app: "enabled" | "disabled";
    sms: "enabled" | "disabled";
    push: "enabled" | "disabled";
  };
  topics?: {
    transactional: "enabled";
    reminders: "enabled" | "disabled";
    announcements: "enabled" | "disabled";
    marketing: "enabled" | "disabled";
  };
  quiet_hours?: {
    status: "enabled" | "disabled";
    starts_at?: string;
    ends_at?: string;
    timezone?: string;
  };
}
export interface AnnouncementInput {
  profile: { title: string; message: string; action?: { label: string; url: string } };
  audience: { type: "all_members" | "active_bookers" | "branch_members"; branch_ids: string[] };
  channels: Array<"in_app" | "sms" | "push">;
  schedule?: { send_at?: string | Date };
  status?: "draft";
  custom_data?: ApiEntity;
}
export interface DeviceRegistrationInput {
  installation_id: string;
  platform: "ios" | "android" | "web";
  push: { token: string; provider: "apns" | "fcm" | "webpush" };
  device?: ApiEntity;
  app?: ApiEntity;
}
