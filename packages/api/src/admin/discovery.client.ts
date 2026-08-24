import type { ApiClient } from "../client";
import type {
  AdminDiscoveryPage,
  PreviewDiscoveryDraftInput,
  PreviewDiscoveryDraftResponse,
  UpdateDiscoveryDraftInput,
} from "./discovery.dto";
import { adminDiscoveryEndpoints as ep } from "./discovery.endpoint";

export function createAdminDiscoveryApi(client: ApiClient) {
  return {
    list() {
      return client.request<AdminDiscoveryPage[]>(ep.root);
    },
    get(pageKey: string) {
      return client.request<AdminDiscoveryPage>(ep.byKey(pageKey));
    },
    saveDraft(pageKey: string, input: UpdateDiscoveryDraftInput) {
      return client.request<AdminDiscoveryPage>(ep.draft(pageKey), {
        method: "PUT",
        body: input,
      });
    },
    preview(pageKey: string, input: PreviewDiscoveryDraftInput = {}) {
      return client.request<PreviewDiscoveryDraftResponse>(
        ep.preview(pageKey),
        { method: "POST", body: input },
      );
    },
    publish(pageKey: string) {
      return client.request<AdminDiscoveryPage>(ep.publish(pageKey), {
        method: "POST",
      });
    },
    rollback(pageKey: string, revision: number) {
      return client.request<AdminDiscoveryPage>(ep.rollback(pageKey), {
        method: "POST",
        body: { revision },
      });
    },
  };
}

export type AdminDiscoveryApi = ReturnType<typeof createAdminDiscoveryApi>;
