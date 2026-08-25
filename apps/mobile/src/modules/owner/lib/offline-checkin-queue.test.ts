import { accountCheckin } from "@/shared/lib/api";
import { getNativeSecureStore } from "@/shared/lib/native-secure-store";
import {
  applyOfflineReconciliationResults,
  offlineCheckinQueueCount,
  prepareOfflineCheckin,
  queueOfflineBookingCheckin,
  syncOfflineCheckins,
} from "./offline-checkin-queue";

jest.mock("@/shared/lib/api", () => ({
  accountCheckin: {
    listDevices: jest.fn(),
    provisionDevice: jest.fn(),
    issueOfflineSnapshot: jest.fn(),
    syncOfflineBatch: jest.fn(),
  },
}));

jest.mock("@/shared/lib/native-secure-store", () => ({
  getNativeSecureStore: jest.fn(),
}));

const checkin = accountCheckin as jest.Mocked<typeof accountCheckin>;
const resolveStore = getNativeSecureStore as jest.MockedFunction<
  typeof getNativeSecureStore
>;

describe("secure offline check-in queue", () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    jest.clearAllMocks();
    resolveStore.mockResolvedValue({
      isNative: true,
      getItem: async (key) => values.get(key) ?? null,
      setItem: async (key, value) => void values.set(key, value),
      removeItem: async (key) => void values.delete(key),
    });
    checkin.listDevices.mockResolvedValue({ result: [] });
    checkin.provisionDevice.mockResolvedValue({
      device: {
        id: "device-a",
        clubId: "club-a",
        name: "capacitor-user-a",
        provider: "capacitor",
        status: "active",
        lastSeenAt: null,
        createdAt: "2026-08-25T08:00:00.000Z",
      },
      secret: "display-once",
    });
    checkin.issueOfflineSnapshot.mockResolvedValue({
      snapshotToken: "signed.snapshot.token",
      snapshot: {
        id: "snapshot-a",
        clubId: "club-a",
        deviceId: "device-a",
        deviceCredentialVersion: 1,
        issuedAt: "2026-08-25T08:00:00.000Z",
        expiresAt: "2099-08-25T12:00:00.000Z",
        syncDeadline: "2099-08-26T08:00:00.000Z",
        maxEvents: 100,
        lastSequence: 0,
        bookings: [
          {
            bookingId: "booking-a",
            userId: "athlete-a",
            code: "G4M-1234",
            validFrom: "2020-08-25T08:00:00.000Z",
            validUntil: "2099-08-25T10:00:00.000Z",
          },
        ],
        memberships: [],
      },
    });
  });

  it("queues only snapshot-eligible codes and removes accepted sync rows", async () => {
    await prepareOfflineCheckin("club-a", "user-a");
    expect(
      await queueOfflineBookingCheckin("club-a", "user-a", "UNKNOWN"),
    ).toEqual({ queued: false, reason: "not_eligible" });
    expect(
      await queueOfflineBookingCheckin("club-a", "user-a", "G4M-1234"),
    ).toEqual({ queued: true, duplicate: false });

    checkin.syncOfflineBatch.mockImplementation(async (_clubId, input) => ({
      items: input.items.map((item) => ({
        clientIdempotencyKey: item.clientIdempotencyKey,
        sequence: item.sequence,
        status: "created" as const,
      })),
    }));
    expect(await syncOfflineCheckins("club-a", "user-a")).toEqual({
      synced: 1,
      remaining: 0,
    });
    expect(await offlineCheckinQueueCount("club-a", "user-a")).toBe(0);
  });

  it("retains authoritative conflicts for reconciliation", async () => {
    await prepareOfflineCheckin("club-a", "user-a");
    await queueOfflineBookingCheckin("club-a", "user-a", "G4M-1234");
    checkin.syncOfflineBatch.mockImplementation(async (_clubId, input) => ({
      items: input.items.map((item) => ({
        clientIdempotencyKey: item.clientIdempotencyKey,
        sequence: item.sequence,
        status: "review" as const,
        error: "Membership consumed elsewhere",
      })),
    }));

    expect(await syncOfflineCheckins("club-a", "user-a")).toEqual({
      synced: 0,
      remaining: 1,
    });
    expect(await offlineCheckinQueueCount("club-a", "user-a")).toBe(1);

    await applyOfflineReconciliationResults("club-a", "user-a", [
      {
        id: "reconciliation-a",
        snapshotId: "snapshot-a",
        deviceId: "device-a",
        sequence: 1,
        status: "dismissed",
        payload: {
          clientIdempotencyKey: "offline-checkin-local",
          method: "manual",
          occurredAt: "2026-08-25T08:00:00.000Z",
          bookingCode: "G4M-1234",
        },
        checkInId: null,
        reason: null,
        reasonCode: null,
        lastResolution: {
          clientMutationId: "resolution-attempt-0001",
          action: "dismiss",
          actorId: "operator-a",
          reason: "ورود اشتباه بود",
          outcome: "dismissed",
          resolvedAt: "2026-08-25T08:10:00.000Z",
        },
        reconciledAt: "2026-08-25T08:10:00.000Z",
        createdAt: "2026-08-25T08:05:00.000Z",
      },
    ]);
    expect(await offlineCheckinQueueCount("club-a", "user-a")).toBe(0);
  });
});
