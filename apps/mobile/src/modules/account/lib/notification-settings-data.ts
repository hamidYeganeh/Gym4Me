import type { NotificationPreferences } from "@repo/api";

/** Demo preferences when the user is signed out. */
export const DEMO_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  userId: "demo",
  channels: {
    push: true,
    sms: false,
    inApp: true,
    email: false,
    marketing: false,
  },
  quietHours: {
    start: "22:00",
    end: "07:00",
    timezone: "Asia/Tehran",
  },
  marketingDailyCap: 3,
  updatedAt: new Date().toISOString(),
};
