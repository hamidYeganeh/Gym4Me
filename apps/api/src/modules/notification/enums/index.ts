export const CHANNEL_STATES = ["enabled", "disabled"] as const;
export type ChannelState = (typeof CHANNEL_STATES)[number];

export const DEVICE_PLATFORMS = ["ios", "android", "web"] as const;
export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

export const PUSH_PROVIDERS = ["apns", "fcm", "webpush"] as const;
export type PushProvider = (typeof PUSH_PROVIDERS)[number];

export const AUDIENCE_TYPES = ["all_members", "active_bookers", "branch_members"] as const;
export type AudienceType = (typeof AUDIENCE_TYPES)[number];

export const NOTIFICATION_CHANNELS = ["in_app", "sms", "push"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const JOB_STATUSES = ["pending", "processing", "sent", "failed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
