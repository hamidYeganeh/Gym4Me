import { generateKeyPairSync } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { assertPushConfiguration, sendPush } from "../src/push-provider.js";

const originalProvider = process.env.PUSH_PROVIDER;
afterEach(() => {
  if (originalProvider === undefined) delete process.env.PUSH_PROVIDER;
  else process.env.PUSH_PROVIDER = originalProvider;
});

describe("push provider", () => {
  it("supports a safe console provider for local development", async () => {
    process.env.PUSH_PROVIDER = "console";
    const result = await sendPush([{ token: "device-token", provider: "fcm" }], {
      title: "Gym4Me",
      body: "test",
    });
    expect(result.messageIds).toHaveLength(1);
    expect(result.invalidTokens).toEqual([]);
  });

  it("rejects unknown providers", async () => {
    process.env.PUSH_PROVIDER = "unknown";
    await expect(sendPush([], { title: "Gym4Me", body: "test" })).rejects.toThrow(
      "Unsupported PUSH_PROVIDER",
    );
  });

  it("fails closed when direct provider credentials are incomplete", () => {
    expect(() => assertPushConfiguration({ PUSH_PROVIDER: "direct" })).toThrow(
      "FCM_PROJECT_ID, FCM_CLIENT_EMAIL and FCM_PRIVATE_KEY",
    );
  });

  it("supports a production FCM-only configuration while APNs is paused", () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    expect(() =>
      assertPushConfiguration({
        PUSH_PROVIDER: "direct",
        FCM_PROJECT_ID: "gym4me-test",
        FCM_CLIENT_EMAIL: "push@gym4me-test.iam.gserviceaccount.com",
        FCM_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
        APNS_ENABLED: "false",
      }),
    ).not.toThrow();
  });

  it("fails closed when APNs is explicitly enabled without Apple credentials", () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    expect(() =>
      assertPushConfiguration({
        PUSH_PROVIDER: "direct",
        FCM_PROJECT_ID: "gym4me-test",
        FCM_CLIENT_EMAIL: "push@gym4me-test.iam.gserviceaccount.com",
        FCM_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
        APNS_ENABLED: "true",
      }),
    ).toThrow("Missing APNs configuration");
  });

  it("requires a URL for webhook delivery", () => {
    expect(() => assertPushConfiguration({ PUSH_PROVIDER: "webhook" })).toThrow(
      "PUSH_WEBHOOK_URL is required",
    );
  });
});
