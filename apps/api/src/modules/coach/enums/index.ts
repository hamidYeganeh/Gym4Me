export const COACH_GENDERS = ["women", "men", "other", "undisclosed"] as const;
export type CoachGender = (typeof COACH_GENDERS)[number];

export const COACH_SERVICE_MODES = ["in_person", "online", "group"] as const;
export type CoachServiceMode = (typeof COACH_SERVICE_MODES)[number];

export const COACH_SERVICE_TYPES = ["private", "group", "online", "program"] as const;
export type CoachServiceType = (typeof COACH_SERVICE_TYPES)[number];

export const COACHING_STATUSES = [
  "requested",
  "active",
  "rejected",
  "paused",
  "ended",
  "cancelled",
] as const;
export type CoachingStatus = (typeof COACHING_STATUSES)[number];
export const COACHING_STATUS_UPDATES = [
  "active",
  "rejected",
  "paused",
  "ended",
  "cancelled",
] as const;

export const MESSAGE_STATUSES = ["sent", "delivered", "read"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
