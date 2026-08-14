import { Injectable, Logger } from '@nestjs/common';

export interface PushMessage {
  title: string;
  body: string;
  /** String-only map forwarded to the client for deep-linking. */
  data?: Record<string, string>;
}

export interface PushSendResult {
  sent: number;
  failed: number;
  /** Tokens the provider reported as permanently invalid (should be revoked). */
  invalidTokens: string[];
}

export abstract class PushService {
  abstract send(
    tokens: string[],
    message: PushMessage,
  ): Promise<PushSendResult>;
}

@Injectable()
export class MockPushService extends PushService {
  private readonly logger = new Logger('MockPush');

  async send(tokens: string[], message: PushMessage): Promise<PushSendResult> {
    this.logger.log(
      `[PUSH] tokens=${tokens.length} title="${message.title}" body="${message.body}" data=${JSON.stringify(message.data ?? {})}`,
    );
    return { sent: tokens.length, failed: 0, invalidTokens: [] };
  }
}
