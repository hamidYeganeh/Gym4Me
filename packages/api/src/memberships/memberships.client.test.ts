import { createApiClient } from "../client";
import { createAccountMembershipsApi } from "./memberships.client";

describe("membership discovery summaries client", () => {
  it("sends one bounded public request with comma-separated club ids", async () => {
    const fetchImpl = jest.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(
        "https://api.example/api/v1/discovery/membership-plan-summaries?clubIds=club-a%2Cclub-b",
      );
      expect(new Headers(init?.headers).has("Authorization")).toBe(false);
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const client = createApiClient({
      baseUrl: "https://api.example/api/v1",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    await createAccountMembershipsApi(client).listPublicPlanSummaries([
      "club-a",
      "club-b",
    ]);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe("owner membership renewal client", () => {
  it("previews and confirms against the exact server fingerprint", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            previewFingerprint: "a".repeat(64),
            consentVersion: "membership-renewal-v1",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ idempotent: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = createApiClient({
      baseUrl: "https://api.example/api/v1",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    const memberships = createAccountMembershipsApi(client);

    await memberships.previewRenewal("club-a", "membership-a");
    await memberships.renew("club-a", "membership-a", {
      idempotencyKey: "renewal-attempt-a",
      previewFingerprint: "a".repeat(64),
      consentVersion: "membership-renewal-v1",
      consentAccepted: true,
      channel: "cash",
    });

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.example/api/v1/account/clubs/club-a/memberships/membership-a/renewal-preview",
      expect.objectContaining({ method: "POST", body: "{}" }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example/api/v1/account/clubs/club-a/memberships/membership-a/renew",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"previewFingerprint"'),
      }),
    );
  });
});

describe("athlete membership checkout client", () => {
  it("previews, initiates, and verifies the persisted checkout", async () => {
    const fetchImpl = jest.fn().mockImplementation(async () =>
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient({
      baseUrl: "https://api.example/api/v1",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    const memberships = createAccountMembershipsApi(client);

    await memberships.previewCheckout({ clubId: "club-a", planId: "plan-a" });
    await memberships.initiateCheckout({
      clubId: "club-a",
      planId: "plan-a",
      idempotencyKey: "checkout-attempt-a",
      previewFingerprint: "a".repeat(64),
      consentVersion: "membership-checkout-v1",
      consentAccepted: true,
      callbackUrl: "https://app.example/athlete/memberships",
    });
    await memberships.verifyCheckout("checkout-a", {
      authority: "authority-a",
      status: "OK",
    });

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example/api/v1/account/memberships/checkouts/preview",
      "https://api.example/api/v1/account/memberships/checkouts/initiate",
      "https://api.example/api/v1/account/memberships/checkouts/checkout-a/verify",
    ]);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      3,
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ authority: "authority-a", status: "OK" }),
      }),
    );
  });
});

describe("owner platform subscription checkout client", () => {
  it("previews, initiates, and verifies the persisted checkout", async () => {
    const fetchImpl = jest.fn().mockImplementation(async () =>
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient({
      baseUrl: "https://api.example/api/v1",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    const memberships = createAccountMembershipsApi(client);

    await memberships.previewPlatformSubscriptionCheckout({
      planId: "plan-a",
    });
    await memberships.initiatePlatformSubscriptionCheckout({
      planId: "plan-a",
      idempotencyKey: "platform-checkout-attempt-a",
      previewFingerprint: "a".repeat(64),
      consentVersion: "platform-subscription-checkout-v1",
      consentAccepted: true,
      callbackUrl: "https://app.example/owner/subscription",
    });
    await memberships.verifyPlatformSubscriptionCheckout("checkout-a", {
      authority: "authority-a",
      status: "OK",
    });

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      "https://api.example/api/v1/account/platform-subscriptions/checkouts/preview",
      "https://api.example/api/v1/account/platform-subscriptions/checkouts/initiate",
      "https://api.example/api/v1/account/platform-subscriptions/checkouts/checkout-a/verify",
    ]);
  });
});
