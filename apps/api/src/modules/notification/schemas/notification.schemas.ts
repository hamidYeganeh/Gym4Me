import { z } from "zod";
import { RECORD_STATUSES } from "../../../common/enums/index.js";
import {
  AUDIENCE_TYPES,
  CHANNEL_STATES,
  DEVICE_PLATFORMS,
  NOTIFICATION_CHANNELS,
  PUSH_PROVIDERS,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const page = z.coerce.number().int().min(1);
export const notificationListSchema = z.object({
  page: page.default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  unread_only: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});
export const preferenceSchema = z.object({
  channels: z
    .object({
      in_app: z.enum(CHANNEL_STATES).default("enabled"),
      sms: z.enum(CHANNEL_STATES).default("enabled"),
      push: z.enum(CHANNEL_STATES).default("enabled"),
    })
    .optional(),
  topics: z
    .object({
      transactional: z.literal("enabled").default("enabled"),
      reminders: z.enum(CHANNEL_STATES).default("enabled"),
      announcements: z.enum(CHANNEL_STATES).default("enabled"),
      marketing: z.enum(CHANNEL_STATES).default("disabled"),
    })
    .optional(),
  quiet_hours: z
    .object({
      status: z.enum(CHANNEL_STATES),
      starts_at: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
        .optional(),
      ends_at: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
        .optional(),
      timezone: z.string().default("Asia/Tehran"),
    })
    .optional(),
});
export const deviceRegistrationSchema = z.object({
  installation_id: z.string().min(8).max(200),
  platform: z.enum(DEVICE_PLATFORMS),
  push: z.object({
    token: z.string().min(8).max(4096),
    provider: z.enum(PUSH_PROVIDERS),
  }),
  device: z.record(z.string(), z.unknown()).optional(),
  app: z.record(z.string(), z.unknown()).optional(),
});
const announcementBase = z.object({
  profile: z.object({
    title: z.string().trim().min(2).max(160),
    message: z.string().trim().min(2).max(2000),
    action: z.object({ label: z.string().max(80), url: z.string().url() }).optional(),
  }),
  audience: z.object({
    type: z.enum(AUDIENCE_TYPES),
    branch_ids: z.array(objectId).default([]),
  }),
  channels: z
    .array(z.enum(NOTIFICATION_CHANNELS))
    .min(1)
    .default(["in_app"]),
  schedule: z.object({ send_at: z.coerce.date().optional() }).default({}),
  status: z.literal("draft").default("draft"),
  custom_data: z.record(z.string(), z.unknown()).optional(),
});
export const announcementCreateSchema = announcementBase.superRefine((value, context) => {
  if (value.audience.type === "branch_members" && !value.audience.branch_ids.length)
    context.addIssue({
      code: "custom",
      path: ["audience", "branch_ids"],
      message: "انتخاب شعبه الزامی است",
    });
});
export const announcementPatchSchema = announcementBase.partial();
export const templatePatchSchema = z.object({
  content: z.object({ text: z.string().min(2).max(2000) }).optional(),
  provider: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(RECORD_STATUSES).optional(),
});
export const retrySchema = z.object({ reason: z.string().trim().min(2).max(500) });
