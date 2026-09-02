import type { ApiClient } from "../client";
import type {
  ListNotificationsQuery,
  NotificationInbox,
  NotificationPreferences,
  RegisterDeviceInput,
  RegisterDeviceResult,
  UpdateNotificationPreferencesInput,
} from "./notifications.dto";
import { accountNotificationsEndpoints as ep } from "./notifications.endpoint";

function installationId(token: string): string {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `legacy-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function enabled(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null) return fallback;
  return value === true || value === "enabled";
}

function asPreferences(data: any): NotificationPreferences {
  const channels = data?.channels ?? {};
  const topics = data?.topics ?? {};
  const quiet = data?.quietHours ?? data?.quiet_hours ?? {};
  return {
    userId: String(data?.userId ?? data?.user_id ?? ""),
    channels: {
      push: enabled(channels.push),
      sms: enabled(channels.sms),
      inApp: enabled(channels.inApp ?? channels.in_app),
      email: enabled(channels.email, false),
      marketing: enabled(topics.marketing, false),
    },
    quietHours: {
      start: String(quiet.startsAt ?? quiet.starts_at ?? "22:00"),
      end: String(quiet.endsAt ?? quiet.ends_at ?? "07:00"),
      timezone: String(quiet.timezone ?? "Asia/Tehran"),
    },
    marketingDailyCap: Number(data?.marketingDailyCap ?? 0),
    updatedAt: String(data?.updatedAt ?? data?.createdAt ?? new Date(0).toISOString()),
  };
}

function preferenceInput(input: UpdateNotificationPreferencesInput) {
  const channels = input.channels;
  const quiet = input.quietHours;
  return {
    ...(channels
      ? {
          channels: {
            ...(channels.inApp !== undefined
              ? { in_app: channels.inApp ? "enabled" : "disabled" }
              : {}),
            ...(channels.sms !== undefined
              ? { sms: channels.sms ? "enabled" : "disabled" }
              : {}),
            ...(channels.push !== undefined
              ? { push: channels.push ? "enabled" : "disabled" }
              : {}),
          },
          ...(channels.marketing !== undefined
            ? { topics: { marketing: channels.marketing ? "enabled" : "disabled" } }
            : {}),
        }
      : {}),
    ...(quiet
      ? {
          quiet_hours: {
            status: "enabled",
            ...(quiet.start !== undefined ? { starts_at: quiet.start } : {}),
            ...(quiet.end !== undefined ? { ends_at: quiet.end } : {}),
            ...(quiet.timezone !== undefined ? { timezone: quiet.timezone } : {}),
          },
        }
      : {}),
  };
}

/** Notification inbox + push device registration. */
export function createAccountNotificationsApi(client: ApiClient) {
  return {
    async list(query: ListNotificationsQuery = {}) {
      const page = await client.request<any>(ep.list, { query });
      const items = page.result ?? page.items ?? [];
      const pagination = page.pagination ?? page.meta ?? {};
      return {
        items: items.map((item: any) => ({
          id: String(item.id ?? item._id ?? ""),
          templateKey: String(item.templateKey ?? item.templateId ?? ""),
          title: String(item.title ?? item.payload?.title ?? ""),
          body: String(item.body ?? item.content?.text ?? item.payload?.message ?? ""),
          payload: item.payload ?? null,
          readStatus: item.readStatus ?? (item.recipient?.readAt ? "read" : "unread"),
          createdAt: String(item.createdAt ?? new Date(0).toISOString()),
        })),
        meta: {
          page: Number(pagination.page ?? 1),
          limit: Number(pagination.page_size ?? pagination.limit ?? items.length),
          total: Number(pagination.count ?? pagination.total ?? items.length),
          unreadCount: Number(pagination.unread ?? 0),
        },
      } satisfies NotificationInbox;
    },

    async getPreferences() {
      return asPreferences(await client.request(ep.preferences));
    },

    async updatePreferences(input: UpdateNotificationPreferencesInput) {
      const result = await client.request(ep.preferences, {
        method: "PATCH",
        body: preferenceInput(input),
      });
      return asPreferences(result);
    },

    markRead(id: string) {
      return client
        .request(ep.read(id), { method: "PATCH" })
        .then(() => ({ ok: true }));
    },

    async markAllRead() {
      const result = await client.request<any>(ep.readAll, {
        method: "POST",
      });
      return { modified: Number(result.modified ?? result.updated ?? 0) };
    },

    async registerDevice(input: RegisterDeviceInput) {
      const id = installationId(input.token);
      const result = await client.request<any>(ep.devices, {
        method: "POST",
        body: {
          installation_id: id,
          platform: input.platform,
          push: {
            token: input.token,
            provider:
              input.platform === "ios"
                ? "apns"
                : input.platform === "android"
                  ? "fcm"
                  : "webpush",
          },
        },
      });
      return {
        id: String(result.id ?? result._id ?? id),
        status: String(result.status ?? "active"),
      } satisfies RegisterDeviceResult;
    },

    revokeDevice(token: string) {
      return client
        .request(`/notifications/devices/${installationId(token)}/revoke`, {
          method: "POST",
        })
        .then(() => ({ ok: true }));
    },
  };
}

export type AccountNotificationsApi = ReturnType<
  typeof createAccountNotificationsApi
>;
