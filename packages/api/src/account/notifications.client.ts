import type { ApiClient } from "../client";
import type {
  ListNotificationsQuery,
  NotificationInbox,
  RegisterDeviceInput,
  RegisterDeviceResult,
} from "./notifications.dto";
import { accountNotificationsEndpoints as ep } from "./notifications.endpoint";

/** Notification inbox + push device registration. */
export function createAccountNotificationsApi(client: ApiClient) {
  return {
    list(query: ListNotificationsQuery = {}) {
      return client.request<NotificationInbox>(ep.list, { query });
    },

    markRead(id: string) {
      return client.request<{ ok: boolean }>(ep.read(id), { method: "POST" });
    },

    markAllRead() {
      return client.request<{ modified: number }>(ep.readAll, {
        method: "POST",
      });
    },

    registerDevice(input: RegisterDeviceInput) {
      return client.request<RegisterDeviceResult>(ep.devices, {
        method: "POST",
        body: input,
      });
    },

    revokeDevice(token: string) {
      return client.request<{ ok: boolean }>(ep.deviceByToken(token), {
        method: "DELETE",
      });
    },
  };
}

export type AccountNotificationsApi = ReturnType<
  typeof createAccountNotificationsApi
>;
