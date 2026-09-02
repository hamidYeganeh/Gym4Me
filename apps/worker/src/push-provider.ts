import { createPrivateKey, createSign } from "node:crypto";
import { connect } from "node:http2";
import { readFileSync } from "node:fs";

export type PushTarget = { token: string; provider: "fcm" | "apns" | "webpush" };
export type PushNotification = { title: string; body: string; data?: Record<string, unknown> };
export type PushResult = { messageIds: string[]; invalidTokens: string[] };

const encode = (value: string | Buffer) => Buffer.from(value).toString("base64url");
const privateKey = (value: string | undefined) => value?.replace(/\\n/g, "\n");
let fcmToken: { value: string; expiresAt: number } | undefined;
let apnsToken: { value: string; expiresAt: number } | undefined;

type FcmCredential = { projectId: string; clientEmail: string; privateKey: string };

const apnsKeys = [
  "APNS_TEAM_ID",
  "APNS_KEY_ID",
  "APNS_BUNDLE_ID",
  "APNS_PRIVATE_KEY",
] as const;

function apnsEnabled(environment = process.env) {
  if (environment.APNS_ENABLED === "false") return false;
  if (environment.APNS_ENABLED === "true") return true;
  return apnsKeys.some((key) => Boolean(environment[key]?.trim()));
}

function fcmCredential(environment = process.env): FcmCredential {
  const file = environment.FCM_SERVICE_ACCOUNT_FILE?.trim();
  let stored: Record<string, unknown> = {};
  if (file) {
    try {
      stored = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    } catch (error) {
      throw new Error(
        `FCM_SERVICE_ACCOUNT_FILE could not be read: ${error instanceof Error ? error.message : "invalid file"}`,
      );
    }
  }
  const projectId = environment.FCM_PROJECT_ID?.trim() || String(stored.project_id ?? "");
  const clientEmail = environment.FCM_CLIENT_EMAIL?.trim() || String(stored.client_email ?? "");
  const key = environment.FCM_PRIVATE_KEY?.trim() || String(stored.private_key ?? "");
  if (!projectId || !clientEmail || !key)
    throw new Error(
      "FCM_PROJECT_ID, FCM_CLIENT_EMAIL and FCM_PRIVATE_KEY (or FCM_SERVICE_ACCOUNT_FILE) are required",
    );
  return { projectId, clientEmail, privateKey: privateKey(key)! };
}

export function assertPushConfiguration(environment = process.env) {
  const provider = environment.PUSH_PROVIDER ?? "console";
  if (provider === "console") return;
  if (provider === "webhook") {
    if (!environment.PUSH_WEBHOOK_URL) throw new Error("PUSH_WEBHOOK_URL is required");
    new URL(environment.PUSH_WEBHOOK_URL);
    return;
  }
  if (provider !== "direct") throw new Error(`Unsupported PUSH_PROVIDER: ${provider}`);
  createPrivateKey(fcmCredential(environment).privateKey);
  if (!apnsEnabled(environment)) return;
  const missing = apnsKeys.filter((key) => !environment[key]?.trim());
  if (missing.length) throw new Error(`Missing APNs configuration: ${missing.join(", ")}`);
  createPrivateKey(privateKey(environment.APNS_PRIVATE_KEY)!);
  if (!/^[A-Z0-9]{10}$/.test(environment.APNS_TEAM_ID!))
    throw new Error("APNS_TEAM_ID must be a 10-character Apple Team ID");
  if (!/^[A-Z0-9]{10}$/.test(environment.APNS_KEY_ID!))
    throw new Error("APNS_KEY_ID must be a 10-character Apple Key ID");
}

async function getFcmAccessToken() {
  if (fcmToken && fcmToken.expiresAt > Date.now() + 60_000) return fcmToken.value;
  const credential = fcmCredential();
  const email = credential.clientEmail;
  const key = credential.privateKey;
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = encode(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${signer.sign(key, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!response.ok || !body.access_token) throw new Error(`FCM OAuth failed (${response.status})`);
  fcmToken = {
    value: body.access_token,
    expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000,
  };
  return fcmToken.value;
}

async function sendFcm(targets: PushTarget[], notification: PushNotification): Promise<PushResult> {
  const project = fcmCredential().projectId;
  const accessToken = await getFcmAccessToken();
  const messageIds: string[] = [];
  const invalidTokens: string[] = [];
  for (const target of targets) {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(project)}/messages:send`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
        body: JSON.stringify({
          message: {
            token: target.token,
            notification: { title: notification.title, body: notification.body },
            data: Object.fromEntries(
              Object.entries(notification.data ?? {}).map(([key, value]) => [key, String(value)]),
            ),
          },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const body = (await response.json()) as {
      name?: string;
      error?: { details?: Array<{ errorCode?: string }> };
    };
    if (response.ok && body.name) messageIds.push(body.name);
    else if (
      body.error?.details?.some((detail) =>
        ["UNREGISTERED", "INVALID_ARGUMENT"].includes(String(detail.errorCode)),
      )
    )
      invalidTokens.push(target.token);
    else throw new Error(`FCM delivery failed (${response.status})`);
  }
  return { messageIds, invalidTokens };
}

function getApnsToken() {
  if (apnsToken && apnsToken.expiresAt > Date.now() + 60_000) return apnsToken.value;
  const teamId = process.env.APNS_TEAM_ID;
  const keyId = process.env.APNS_KEY_ID;
  const key = privateKey(process.env.APNS_PRIVATE_KEY);
  if (!teamId || !keyId || !key)
    throw new Error("APNS_TEAM_ID, APNS_KEY_ID and APNS_PRIVATE_KEY are required");
  const header = encode(JSON.stringify({ alg: "ES256", kid: keyId }));
  const claims = encode(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }));
  const signer = createSign("SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign({ key, dsaEncoding: "ieee-p1363" }).toString("base64url");
  apnsToken = { value: `${header}.${claims}.${signature}`, expiresAt: Date.now() + 50 * 60_000 };
  return apnsToken.value;
}

async function sendApns(
  targets: PushTarget[],
  notification: PushNotification,
): Promise<PushResult> {
  const topic = process.env.APNS_BUNDLE_ID;
  if (!topic) throw new Error("APNS_BUNDLE_ID is required");
  const authority =
    process.env.APNS_ENVIRONMENT === "production"
      ? "https://api.push.apple.com"
      : "https://api.sandbox.push.apple.com";
  const client = connect(authority);
  const messageIds: string[] = [];
  const invalidTokens: string[] = [];
  try {
    for (const target of targets) {
      await new Promise<void>((resolve, reject) => {
        const request = client.request({
          ":method": "POST",
          ":path": `/3/device/${target.token}`,
          authorization: `bearer ${getApnsToken()}`,
          "apns-topic": topic,
          "apns-push-type": "alert",
          "apns-priority": "10",
        });
        let status = 0;
        let apnsId = "";
        let responseBody = "";
        request.setEncoding("utf8");
        request.on("response", (headers) => {
          status = Number(headers[":status"]);
          apnsId = String(headers["apns-id"] ?? "");
        });
        request.on("data", (chunk) => {
          responseBody += chunk;
        });
        request.on("end", () => {
          if (status === 200) {
            if (apnsId) messageIds.push(apnsId);
            resolve();
            return;
          }
          let reason = "";
          try {
            reason = String((JSON.parse(responseBody) as { reason?: string }).reason ?? "");
          } catch {}
          if (
            status === 410 ||
            ["BadDeviceToken", "DeviceTokenNotForTopic", "Unregistered"].includes(reason)
          ) {
            invalidTokens.push(target.token);
            resolve();
            return;
          }
          reject(new Error(`APNs delivery failed (${status}/${reason || "unknown"})`));
        });
        request.on("error", reject);
        request.setTimeout(10_000, () => request.destroy(new Error("APNs request timeout")));
        request.end(
          JSON.stringify({
            aps: {
              alert: { title: notification.title, body: notification.body },
              sound: "default",
            },
            ...(notification.data ?? {}),
          }),
        );
      });
    }
  } finally {
    client.close();
  }
  return { messageIds, invalidTokens };
}

async function sendWebhook(
  targets: PushTarget[],
  notification: PushNotification,
): Promise<PushResult> {
  if (!process.env.PUSH_WEBHOOK_URL) throw new Error("PUSH_WEBHOOK_URL is required");
  const response = await fetch(process.env.PUSH_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.PUSH_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${process.env.PUSH_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ targets, notification }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Push webhook failed (${response.status})`);
  const body = (await response.json()) as { message_ids?: unknown[]; invalid_tokens?: unknown[] };
  return {
    messageIds: (body.message_ids ?? []).map(String),
    invalidTokens: (body.invalid_tokens ?? []).map(String),
  };
}

export async function sendPush(
  targets: PushTarget[],
  notification: PushNotification,
): Promise<PushResult> {
  const provider = process.env.PUSH_PROVIDER ?? "console";
  if (provider === "console") {
    process.stdout.write(`[DEV PUSH] ${targets.length} device(s): ${notification.title}\n`);
    return {
      messageIds: targets.map((_, index) => `console-${Date.now()}-${index}`),
      invalidTokens: [],
    };
  }
  if (provider === "webhook") return sendWebhook(targets, notification);
  if (provider !== "direct") throw new Error(`Unsupported PUSH_PROVIDER: ${provider}`);
  const fcm = targets.filter((target) => target.provider === "fcm");
  const apns = targets.filter((target) => target.provider === "apns");
  const unsupported = targets.filter((target) => !["fcm", "apns"].includes(target.provider));
  if (unsupported.length) throw new Error("Web Push requires PUSH_PROVIDER=webhook");
  if (apns.length && !apnsEnabled())
    throw new Error("APNs delivery is disabled; set APNS_ENABLED=true and configure Apple credentials");
  const results = await Promise.all([
    fcm.length ? sendFcm(fcm, notification) : { messageIds: [], invalidTokens: [] },
    apns.length ? sendApns(apns, notification) : { messageIds: [], invalidTokens: [] },
  ]);
  return {
    messageIds: results.flatMap((result) => result.messageIds),
    invalidTokens: results.flatMap((result) => result.invalidTokens),
  };
}
