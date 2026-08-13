import type { ApiClient } from "../client";
import { accountCheckinEndpoints as ep } from "./checkin.endpoint";
import type {
  CheckIn,
  CheckInByBookingCodeInput,
  CheckInByMembershipInput,
  CheckInsPage,
  CheckinDevice,
  ListCheckInsQuery,
  ProvisionCheckinDeviceInput,
  ProvisionCheckinDeviceResult,
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
  };
}

export type AccountCheckinApi = ReturnType<typeof createAccountCheckinApi>;
