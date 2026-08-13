import type {
  DevicePlatform,
  NotificationReadStatus,
} from "../types";

/** One inbox notification as returned by `GET /account/notifications`. */
export interface NotificationItem {
  id: string;
  templateKey: string;
  title: string;
  body: string;
  /** Structured deep-link context (e.g. bookingId, invoiceId). */
  payload: Record<string, unknown> | null;
  readStatus: NotificationReadStatus;
  createdAt: string;
}

export interface NotificationInbox {
  items: NotificationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    unreadCount: number;
  };
}

/** Type alias (not interface) so it satisfies the client's Record query constraint. */
export type ListNotificationsQuery = {
  page?: number;
  limit?: number;
  readStatus?: NotificationReadStatus;
};

export interface RegisterDeviceInput {
  token: string;
  platform: DevicePlatform;
}

export interface RegisterDeviceResult {
  id: string;
  status: string;
}

/** Per-user notification channel preferences. */
export interface NotificationPreferences {
  userId: string;
  channels: {
    push: boolean;
    sms: boolean;
    inApp: boolean;
    email: boolean;
    marketing: boolean;
  };
  quietHours: {
    start: string;
    end: string;
    timezone: string;
  };
  marketingDailyCap: number;
  updatedAt: string;
}

export type UpdateNotificationPreferencesInput = {
  channels?: Partial<NotificationPreferences["channels"]>;
  quietHours?: Partial<NotificationPreferences["quietHours"]>;
  marketingDailyCap?: number;
};
