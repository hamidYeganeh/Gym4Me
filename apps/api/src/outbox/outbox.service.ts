import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxMessageStatus } from '../common/enums';
import { NotificationsService } from '../notifications/notifications.service';
import {
  OutboxMessage,
  OutboxMessageDocument,
} from '../schemas/outbox-message.schema';

/**
 * Messages carrying a `notification` block are delivered through
 * NotificationsService when the worker publishes them. Other events stay
 * log-only domain events (their side effects already ran inline).
 */
export type OutboxNotification = {
  userId: string;
  templateKey: string;
  params?: Record<string, string | number>;
  payload?: Record<string, unknown>;
  critical?: boolean;
};

export type EnqueueOutboxInput = {
  eventName: string;
  payload: Record<string, unknown> & { notification?: OutboxNotification };
  idempotencyKey?: string;
};

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    @InjectModel(OutboxMessage.name)
    private readonly outboxModel: Model<OutboxMessageDocument>,
    private readonly notifications: NotificationsService,
  ) {}

  async enqueue(input: EnqueueOutboxInput) {
    if (input.idempotencyKey) {
      const existing = await this.outboxModel
        .findOne({ idempotencyKey: input.idempotencyKey })
        .lean();
      if (existing) {
        return { message: existing, idempotent: true as const };
      }
    }

    try {
      const message = await this.outboxModel.create({
        eventName: input.eventName,
        payload: input.payload,
        status: OutboxMessageStatus.PENDING,
        attempts: 0,
        nextAttemptAt: new Date(),
        idempotencyKey: input.idempotencyKey,
      });
      return { message: message.toObject(), idempotent: false as const };
    } catch (err) {
      if (
        input.idempotencyKey &&
        typeof err === 'object' &&
        err !== null &&
        (err as { code?: number }).code === 11000
      ) {
        const existing = await this.outboxModel
          .findOne({ idempotencyKey: input.idempotencyKey })
          .lean();
        if (existing) {
          return { message: existing, idempotent: true as const };
        }
      }
      throw err;
    }
  }

  /** Claim and mark a batch as published (minimal R3 worker step). */
  async publishPending(limit = 50) {
    const now = new Date();
    const pending = await this.outboxModel
      .find({
        status: OutboxMessageStatus.PENDING,
        $or: [
          { nextAttemptAt: { $lte: now } },
          { nextAttemptAt: { $exists: false } },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(limit);

    let published = 0;
    for (const message of pending) {
      message.status = OutboxMessageStatus.PROCESSING;
      message.attempts += 1;
      await message.save();

      try {
        await this.deliver(message);
        this.logger.log(
          `Outbox publish ${message.eventName} id=${message._id.toString()}`,
        );
        message.status = OutboxMessageStatus.PUBLISHED;
        message.lastError = undefined;
        await message.save();
        published += 1;
      } catch (err) {
        message.status = OutboxMessageStatus.FAILED;
        message.lastError = err instanceof Error ? err.message : String(err);
        message.nextAttemptAt = new Date(Date.now() + 60_000);
        // Allow retry by flipping back to pending after backoff.
        if (message.attempts < 5) {
          message.status = OutboxMessageStatus.PENDING;
        }
        await message.save();
      }
    }

    return { scanned: pending.length, published };
  }

  /**
   * Side effects for a published message. Notification delivery is idempotent
   * per outbox message id, so worker retries never double-send.
   */
  private async deliver(message: OutboxMessageDocument) {
    const notification = message.payload?.notification as
      | OutboxNotification
      | undefined;
    if (!notification?.userId || !notification.templateKey) return;

    await this.notifications.dispatch({
      userId: notification.userId,
      templateKey: notification.templateKey,
      params: notification.params,
      payload: notification.payload,
      critical: notification.critical,
      idempotencyKey: `outbox:${message._id.toString()}`,
    });
  }
}
