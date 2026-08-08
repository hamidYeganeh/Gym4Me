import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import type {
  AdminKycRequest,
  ListAdminKycQuery,
  ReviewKycInput,
} from "./kyc.dto";
import { adminKycEndpoints as ep } from "./kyc.endpoint";

/** Admin KYC review (`/admin/kyc`). */
export function createAdminKycApi(client: ApiClient) {
  return {
    list(query: ListAdminKycQuery = {}) {
      return client.request<Paginated<AdminKycRequest>>(ep.requests, {
        query,
      });
    },

    review(id: string, input: ReviewKycInput) {
      return client.request<AdminKycRequest>(ep.requestById(id), {
        method: "PATCH",
        body: input,
      });
    },

    documentPath(id: string) {
      return ep.document(id);
    },

    fetchDocument(id: string) {
      return client.requestBlob(ep.document(id));
    },
  };
}

export type AdminKycApi = ReturnType<typeof createAdminKycApi>;
