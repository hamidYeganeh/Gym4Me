import { audit, createSchema, customData, mixed, objectId, status } from "../../../database/mongoose.js";
import { DEVICE_PLATFORMS } from "../enums/index.js";

export const notificationModels = {
  NotificationTemplate: createSchema({
    code: { type: String, unique: true },
    channel: String,
    locale: String,
    content: mixed,
    provider: mixed,
    status,
    ...audit,
  }),
  NotificationPreference: createSchema({
    userId: { type: objectId, ref: "User", required: true, unique: true },
    channels: {
      type: mixed,
      default: () => ({ inApp: "enabled", sms: "enabled", push: "enabled" }),
    },
    topics: {
      type: mixed,
      default: () => ({
        transactional: "enabled",
        reminders: "enabled",
        announcements: "enabled",
        marketing: "disabled",
      }),
    },
    quietHours: { type: mixed, default: () => ({ status: "disabled" }) },
    status,
    ...audit,
  }),
  DeviceInstallation: createSchema({
    userId: { type: objectId, ref: "User", required: true, index: true },
    installationId: { type: String, required: true },
    platform: { type: String, enum: DEVICE_PLATFORMS, required: true },
    push: mixed,
    device: mixed,
    app: mixed,
    lastSeenAt: { type: Date, default: Date.now },
    status,
    ...audit,
  }),
  Announcement: createSchema({
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    profile: { type: mixed, default: () => ({}) },
    audience: { type: mixed, default: () => ({ type: "all_members", branchIds: [] }) },
    channels: { type: [String], default: () => ["in_app"] },
    schedule: { type: mixed, default: () => ({}) },
    metrics: { type: mixed, default: () => ({ recipients: 0 }) },
    status,
    customData,
    ...audit,
  }),
  NotificationJob: createSchema({
    templateId: objectId,
    organizationId: { type: objectId, ref: "Organization", index: true },
    source: mixed,
    dedupeKey: { type: String, unique: true, sparse: true },
    recipient: mixed,
    payload: mixed,
    schedule: mixed,
    delivery: mixed,
    status: { type: String, default: "pending", index: true },
    ...audit,
  }),
} as const;

notificationModels.NotificationJob.index({ status: 1, "schedule.sendAt": 1 });
notificationModels.NotificationJob.index({ "recipient.id": 1, createdAt: -1 });
notificationModels.DeviceInstallation.index({ userId: 1, installationId: 1 }, { unique: true });
notificationModels.DeviceInstallation.index({ userId: 1, status: 1, lastSeenAt: -1 });
notificationModels.Announcement.index({ organizationId: 1, status: 1, createdAt: -1 });
