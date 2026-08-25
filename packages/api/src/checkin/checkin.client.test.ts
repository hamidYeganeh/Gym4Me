import { createApiClient } from "../client";
import { createAccountCheckinApi } from "./checkin.client";

describe("offline check-in client contract", () => {
  it("issues a device-bound snapshot and sends ordered signed events", async () => {
    const fetchImpl = jest.fn().mockImplementation(async () =>
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient({
      baseUrl: "https://api.example/api/v1",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    const checkin = createAccountCheckinApi(client);

    await checkin.issueOfflineSnapshot("club-a", "device-a");
    await checkin.syncOfflineBatch("club-a", {
      snapshotToken: "signed.snapshot.token",
      items: [
        {
          clientIdempotencyKey: "client-attempt-a",
          method: "manual",
          occurredAt: "2026-08-25T08:00:00.000Z",
          sequence: 1,
          nonce: "nonce-that-is-long-enough",
          bookingCode: "G4M-1234",
        },
      ],
    });
    await checkin.resolveOfflineReconciliation("club-a", "reconciliation-a", {
      action: "dismiss",
      reason: "ورود اشتباه توسط اپراتور تأیید شد",
      clientMutationId: "resolution-attempt-0001",
    });

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example/api/v1/account/clubs/club-a/checkin/offline-snapshots",
      "https://api.example/api/v1/account/clubs/club-a/checkin/sync",
      "https://api.example/api/v1/account/clubs/club-a/checkin/offline-reconciliations/reconciliation-a/resolve",
    ]);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"snapshotToken":"signed.snapshot.token"'),
      }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"action":"dismiss"'),
      }),
    );
  });
});
