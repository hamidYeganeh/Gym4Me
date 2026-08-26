import type { ApiClient } from '../client';
import type {
  AdminAccountDeletionRequestsResponse,
  ListAdminAccountDeletionRequestsQuery,
} from './data-rights.dto';
import { adminDataRightsEndpoints as ep } from './data-rights.endpoint';

export function createAdminDataRightsApi(client: ApiClient) {
  return {
    listAccountDeletions(
      query: ListAdminAccountDeletionRequestsQuery = {},
    ) {
      return client.request<AdminAccountDeletionRequestsResponse>(
        ep.accountDeletions,
        { query },
      );
    },
  };
}

export type AdminDataRightsApi = ReturnType<typeof createAdminDataRightsApi>;
