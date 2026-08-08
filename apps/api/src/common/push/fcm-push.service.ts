import { Injectable, Logger } from '@nestjs/common';
import { createSign } from 'crypto';
import { readFileSync } from 'fs';
import {
  PushMessage,
  PushSendResult,
  PushService,
} from './push.service';

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
/** FCM error codes that mean the token is permanently dead. */
const INVALID_TOKEN_CODES = new Set(['UNREGISTERED', 'INVALID_ARGUMENT']);
const SEND_CONCURRENCY = 10;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

/**
 * FCM HTTP v1 driver without the firebase-admin dependency:
 * mints a service-account OAuth token via a self-signed RS256 JWT
 * and posts one message per device token.
 */
@Injectable()
export class FcmPushService extends PushService {
  private readonly logger = new Logger('FcmPush');
  private readonly account: ServiceAccount;
  private accessToken: { value: string; expiresAt: number } | null = null;

  /**
   * @param rawServiceAccount inline JSON or a path to the
   *   Firebase service-account key file (`FCM_SERVICE_ACCOUNT`).
   */
  constructor(rawServiceAccount: string) {
    super();
    this.account = FcmPushService.parseServiceAccount(rawServiceAccount);
  }

  static parseServiceAccount(raw: string): ServiceAccount {
    const trimmed = raw.trim();
    const json = trimmed.startsWith('{')
      ? trimmed
      : readFileSync(trimmed, 'utf8');
    const parsed = JSON.parse(json) as Partial<ServiceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      throw new Error(
        'FCM service account must contain project_id, client_email and private_key',
      );
    }
    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      // Env vars often store newlines escaped.
      private_key: parsed.private_key.replace(/\\n/g, '\n'),
    };
  }

  async send(tokens: string[], message: PushMessage): Promise<PushSendResult> {
    if (tokens.length === 0) return { sent: 0, failed: 0, invalidTokens: [] };

    const accessToken = await this.getAccessToken();
    const result: PushSendResult = { sent: 0, failed: 0, invalidTokens: [] };

    for (let i = 0; i < tokens.length; i += SEND_CONCURRENCY) {
      const batch = tokens.slice(i, i + SEND_CONCURRENCY);
      const outcomes = await Promise.allSettled(
        batch.map((token) => this.sendOne(accessToken, token, message)),
      );
      outcomes.forEach((outcome, index) => {
        if (outcome.status === 'fulfilled' && outcome.value === 'sent') {
          result.sent += 1;
          return;
        }
        result.failed += 1;
        if (outcome.status === 'fulfilled' && outcome.value === 'invalid') {
          result.invalidTokens.push(batch[index]);
        }
      });
    }

    if (result.failed > 0) {
      this.logger.warn(
        `FCM send: sent=${result.sent} failed=${result.failed} invalid=${result.invalidTokens.length}`,
      );
    }
    return result;
  }

  private async sendOne(
    accessToken: string,
    token: string,
    message: PushMessage,
  ): Promise<'sent' | 'invalid' | 'failed'> {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${this.account.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title: message.title, body: message.body },
            data: message.data ?? {},
            android: { priority: 'HIGH' },
            apns: { payload: { aps: { sound: 'default' } } },
          },
        }),
      },
    );

    if (response.ok) return 'sent';

    const body = (await response.json().catch(() => null)) as {
      error?: { status?: string; details?: { errorCode?: string }[] };
    } | null;
    const status = body?.error?.status ?? `HTTP_${response.status}`;
    const fcmCode = body?.error?.details?.find((d) => d.errorCode)?.errorCode;

    if (
      INVALID_TOKEN_CODES.has(fcmCode ?? '') ||
      INVALID_TOKEN_CODES.has(status) ||
      response.status === 404
    ) {
      return 'invalid';
    }
    this.logger.warn(`FCM error for token: ${status} ${fcmCode ?? ''}`);
    return 'failed';
  }

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.accessToken.expiresAt - 60 > now) {
      return this.accessToken.value;
    }

    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claims = base64url(
      JSON.stringify({
        iss: this.account.client_email,
        scope: MESSAGING_SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      }),
    );
    const signature = createSign('RSA-SHA256')
      .update(`${header}.${claims}`)
      .sign(this.account.private_key, 'base64url');
    const assertion = `${header}.${claims}.${signature}`;

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });
    if (!response.ok) {
      throw new Error(`FCM OAuth token request failed: ${response.status}`);
    }
    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = {
      value: data.access_token,
      expiresAt: now + data.expires_in,
    };
    return data.access_token;
  }
}
