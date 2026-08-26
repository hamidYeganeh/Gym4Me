import type { ListQuery, ListQueryFilter, Paginated } from '../types';
import type { AccountDeletionRequestStatus } from '../account/profile.dto';

export type AdminAccountDeletionRequest = {
  id: string;
  userId: string;
  status: AccountDeletionRequestStatus;
  requestedAt: string;
  coolingOffUntil: string;
  retentionPolicyVersion: string;
  reason: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
};

export type ListAdminAccountDeletionRequestsQuery = ListQuery & {
  status?: ListQueryFilter<AccountDeletionRequestStatus>;
};

export type AdminAccountDeletionRequestsResponse =
  Paginated<AdminAccountDeletionRequest>;
