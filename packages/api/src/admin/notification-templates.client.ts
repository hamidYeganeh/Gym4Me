import type { ApiClient } from "../client";
import { adminNotificationTemplatesEndpoints as ep } from "./notification-templates.endpoint";
import type {
  CreateNotificationTemplateInput,
  ListNotificationTemplatesQuery,
  NotificationTemplate,
  NotificationTemplatesResponse,
  UpdateNotificationTemplateInput,
} from "./notification-templates.dto";

/** Admin CRUD over notification templates (push/sms/inbox copy). */
export function createAdminNotificationTemplatesApi(client: ApiClient) {
  return {
    list(query: ListNotificationTemplatesQuery = {}) {
      return client.request<NotificationTemplatesResponse>(ep.root, { query });
    },

    get(key: string) {
      return client.request<NotificationTemplate>(ep.byKey(key));
    },

    create(input: CreateNotificationTemplateInput) {
      return client.request<NotificationTemplate>(ep.root, {
        method: "POST",
        body: input,
      });
    },

    update(key: string, input: UpdateNotificationTemplateInput) {
      return client.request<NotificationTemplate>(ep.byKey(key), {
        method: "PATCH",
        body: input,
      });
    },
  };
}

export type AdminNotificationTemplatesApi = ReturnType<
  typeof createAdminNotificationTemplatesApi
>;
