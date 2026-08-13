import { z } from "zod";
import type {
  NotificationChannelSetting,
  NotificationSmsSetting,
  NotificationTemplate,
} from "@repo/api";

export type NotificationTemplatesFormMessages = { required: string };

const CHANNEL_OPTIONS: NotificationChannelSetting[] = ["enabled", "disabled"];
const SMS_OPTIONS: NotificationSmsSetting[] = [
  "disabled",
  "otp",
  "transactional",
];

const channelSchema = z.custom<NotificationChannelSetting>(
  (value) =>
    typeof value === "string" && (CHANNEL_OPTIONS as string[]).includes(value),
);
const smsSchema = z.custom<NotificationSmsSetting>(
  (value) =>
    typeof value === "string" && (SMS_OPTIONS as string[]).includes(value),
);

export function createNotificationTemplatesFormSchema(
  messages: NotificationTemplatesFormMessages,
) {
  return z.object({
    title: z.string().trim().min(1, messages.required),
    body: z.string().trim().min(1, messages.required),
    smsTemplateKey: z.string(),
    push: channelSchema,
    inbox: channelSchema,
    sms: smsSchema,
  });
}

export type NotificationTemplatesFormValues = z.infer<
  ReturnType<typeof createNotificationTemplatesFormSchema>
>;

export const notificationTemplatesFormDefaults: NotificationTemplatesFormValues =
  {
    title: "",
    body: "",
    smsTemplateKey: "",
    push: "enabled",
    inbox: "enabled",
    sms: "disabled",
  };

export function notificationTemplateToFormValues(
  item: NotificationTemplate,
): NotificationTemplatesFormValues {
  return {
    title: item.title,
    body: item.body,
    smsTemplateKey: item.smsTemplateKey ?? "",
    push: item.channels.push,
    inbox: item.channels.inbox,
    sms: item.channels.sms,
  };
}

export { CHANNEL_OPTIONS, SMS_OPTIONS };
