import type { ApiClient } from "../client";
import { accountCheckinEndpoints as ep } from "./checkin.endpoint";
import type {
  CheckIn,
  CheckInByBookingCodeInput,
  CheckInByMembershipInput,
  CheckInsPage,
  CheckinDevice,
  ListCheckInsQuery,
  IssueOfflineCheckinSnapshotResult,
  OfflineCheckinReconciliation,
  OfflineCheckinReconciliationsPage,
  ProvisionCheckinDeviceInput,
  ProvisionCheckinDeviceResult,
  RevokeCheckinDeviceResult,
  ResolveOfflineCheckinReconciliationInput,
  SyncOfflineBatchInput,
  SyncOfflineBatchResult,
} from "./checkin.dto";

export function createAccountCheckinApi(client: ApiClient) {
  return {
    listMine(query: ListCheckInsQuery = {}) {
      return client.request<CheckInsPage>(ep.mine, { query });
    },

    listClub(clubId: string, query: ListCheckInsQuery = {}) {
      return client.request<CheckInsPage>(ep.club(clubId), { query });
    },

    checkInByBookingCode(clubId: string, input: CheckInByBookingCodeInput) {
      return client.request<CheckIn>(ep.clubBooking(clubId), {
        method: "POST",
        body: input,
      });
    },

    checkInByMembership(clubId: string, input: CheckInByMembershipInput) {
      return client.request<CheckIn>(ep.clubMembership(clubId), {
        method: "POST",
        body: input,
      });
    },

    syncOfflineBatch(clubId: string, input: SyncOfflineBatchInput) {
      return client.request<SyncOfflineBatchResult>(ep.clubSync(clubId), {
        method: "POST",
        body: input,
      });
    },

    issueOfflineSnapshot(clubId: string, deviceId: string) {
      return client.request<IssueOfflineCheckinSnapshotResult>(
        ep.offlineSnapshots(clubId),
        { method: "POST", body: { deviceId } },
      );
    },

    listOfflineReconciliations(
      clubId: string,
      query: { page?: number; page_size?: number; status?: string } = {},
    ) {
      return client.request<OfflineCheckinReconciliationsPage>(
        ep.offlineReconciliations(clubId),
        { query },
      );
    },

    resolveOfflineReconciliation(
      clubId: string,
      reconciliationId: string,
      input: ResolveOfflineCheckinReconciliationInput,
    ) {
      return client.request<OfflineCheckinReconciliation>(
        ep.resolveOfflineReconciliation(clubId, reconciliationId),
        { method: "POST", body: input },
      );
    },

    listDevices(clubId: string) {
      return client.request<{ result: CheckinDevice[] }>(ep.devices(clubId));
    },

    provisionDevice(clubId: string, input: ProvisionCheckinDeviceInput) {
      return client.request<ProvisionCheckinDeviceResult>(ep.devices(clubId), {
        method: "POST",
        body: input,
      });
    },

    rotateDeviceSecret(clubId: string, deviceId: string) {
      return client.request<ProvisionCheckinDeviceResult>(
        ep.rotateDevice(clubId, deviceId),
        { method: "POST" },
      );
    },

    revokeDevice(clubId: string, deviceId: string) {
      return client.request<RevokeCheckinDeviceResult>(
        ep.revokeDevice(clubId, deviceId),
        { method: "POST" },
      );
    },
  };
}

export type AccountCheckinApi = ReturnType<typeof createAccountCheckinApi>;
