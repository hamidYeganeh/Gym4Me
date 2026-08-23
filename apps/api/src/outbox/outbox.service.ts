import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type ClientSession } from 'mongoose';
import { OutboxMessageStatus } from '../common/enums';
import { WorkerLeaseService } from '../common/jobs/worker-lease.service';
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
  private readonly processingLeaseMs = 60_000;
  private readonly maxAttempts = 5;

  constructor(
    @InjectModel(OutboxMessage.name)
    private readonly outboxModel: Model<OutboxMessageDocument>,
    private readonly notifications: NotificationsService,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  async enqueue(input: EnqueueOutboxInput, session?: ClientSession) {
    if (input.idempotencyKey) {
      const existing = await this.outboxModel
        .findOne({ idempotencyKey: input.idempotencyKey })
        .session(session ?? null)
        .lean();
      if (existing) {
        return { message: existing, idempotent: true as const };
      }
    }

    try {
      const message = new this.outboxModel({
        eventName: input.eventName,
        payload: input.payload,
        status: OutboxMessageStatus.PENDING,
        attempts: 0,
        nextAttemptAt: new Date(),
        idempotencyKey: input.idempotencyKey,
      });
      await message.save({ session });
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
          .session(session ?? null)
          .lean();
        if (existing) {
          return { message: existing, idempotent: true as const };
        }
      }
      throw err;
    }
  }

  /** Atomically claim due messages; expired PROCESSING leases are reclaimable. */
  async publishPending(limit = 50) {
    let scanned = 0;
    let published = 0;
    for (let index = 0; index < limit; index += 1) {
      const message = await this.claimNext();
      if (!message) break;
      scanned += 1;
      try {
        await this.deliverWithHeartbeat(message);
        this.logger.log(
          `Outbox publish ${message.eventName} id=${message._id.toString()}`,
        );
        const completed = await this.outboxModel.updateOne(
          {
            _id: message._id,
            status: OutboxMessageStatus.PROCESSING,
            claimedBy: this.workerLeases.instanceId,
          },
          {
            $set: {
              status: OutboxMessageStatus.PUBLISHED,
              publishedAt: new Date(),
            },
            $unset: {
              claimedBy: 1,
              leaseUntil: 1,
              heartbeatAt: 1,
              lastError: 1,
            },
          },
        );
        if (completed.modifiedCount === 1) published += 1;
      } catch (err) {
        await this.failClaim(message, err);
      }
    }

    return { scanned, published };
  }

  async replayDeadLetter(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Outbox message not found');
    }
    const replayed = await this.outboxModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        status: {
          $in: [OutboxMessageStatus.DEAD_LETTER, OutboxMessageStatus.FAILED],
        },
      },
      {
        $set: {
          status: OutboxMessageStatus.PENDING,
          attempts: 0,
          nextAttemptAt: new Date(),
        },
        $unset: {
          claimedBy: 1,
          leaseUntil: 1,
          heartbeatAt: 1,
          deadLetteredAt: 1,
          lastError: 1,
        },
        $inc: { replayCount: 1 },
      },
      { new: true },
    );
    if (!replayed) {
      throw new NotFoundException('Dead-letter outbox message not found');
    }
    return this.toOperationalView(replayed);
  }

  async listOperational(status = OutboxMessageStatus.DEAD_LETTER, limit = 50) {
    const safeLimit = Math.max(1, Math.min(limit, 200));
    const messages = await this.outboxModel
      .find({ status })
      .sort({ updatedAt: -1 })
      .limit(safeLimit);
    return {
      result: messages.map((message) => this.toOperationalView(message)),
    };
  }

  private async claimNext(): Promise<OutboxMessageDocument | null> {
    const now = new Date();
    return this.outboxModel.findOneAndUpdate(
      {
        $or: [
          {
            status: OutboxMessageStatus.PENDING,
            $or: [
              { nextAttemptAt: { $lte: now } },
              { nextAttemptAt: { $exists: false } },
            ],
          },
          {
            status: OutboxMessageStatus.PROCESSING,
            $or: [
              { leaseUntil: { $lte: now } },
              { leaseUntil: { $exists: false } },
            ],
          },
        ],
      },
      {
        $set: {
          status: OutboxMessageStatus.PROCESSING,
          claimedBy: this.workerLeases.instanceId,
          heartbeatAt: now,
          leaseUntil: new Date(now.getTime() + this.processingLeaseMs),
        },
        $inc: { attempts: 1 },
      },
      { new: true, sort: { createdAt: 1 } },
    );
  }

  private async deliverWithHeartbeat(message: OutboxMessageDocument) {
    const timer = setInterval(
      () => {
        const now = new Date();
        void this.outboxModel
          .updateOne(
            {
              _id: message._id,
              status: OutboxMessageStatus.PROCESSING,
              claimedBy: this.workerLeases.instanceId,
            },
            {
              $set: {
                heartbeatAt: now,
                leaseUntil: new Date(now.getTime() + this.processingLeaseMs),
              },
            },
          )
          .catch((error: unknown) => {
            this.logger.warn(
              `Outbox heartbeat failed id=${message._id.toString()}: ${String(error)}`,
            );
          });
      },
      Math.floor(this.processingLeaseMs / 3),
    );
    timer.unref?.();
    try {
      await this.deliver(message);
    } finally {
      clearInterval(timer);
    }
  }

  private async failClaim(message: OutboxMessageDocument, error: unknown) {
    const deadLetter = message.attempts >= this.maxAttempts;
    const now = new Date();
    await this.outboxModel.updateOne(
      {
        _id: message._id,
        status: OutboxMessageStatus.PROCESSING,
        claimedBy: this.workerLeases.instanceId,
      },
      {
        $set: {
          status: deadLetter
            ? OutboxMessageStatus.DEAD_LETTER
            : OutboxMessageStatus.PENDING,
          lastError: (error instanceof Error
            ? error.message
            : String(error)
          ).slice(0, 1000),
          nextAttemptAt: deadLetter
            ? now
            : new Date(now.getTime() + this.retryDelayMs(message)),
          ...(deadLetter ? { deadLetteredAt: now } : {}),
        },
        $unset: { claimedBy: 1, leaseUntil: 1, heartbeatAt: 1 },
      },
    );
  }

  private retryDelayMs(message: OutboxMessageDocument): number {
    const exponential = Math.min(
      60 * 60_000,
      30_000 * 2 ** Math.max(0, message.attempts - 1),
    );
    const deterministicJitter =
      Number.parseInt(message._id.toString().slice(-4), 16) % 5_000;
    return exponential + deterministicJitter;
  }

  private toOperationalView(message: OutboxMessageDocument) {
    return {
      id: message._id.toString(),
      eventName: message.eventName,
      status: message.status,
      attempts: message.attempts,
      replayCount: message.replayCount ?? 0,
      nextAttemptAt: message.nextAttemptAt ?? null,
      leaseUntil: message.leaseUntil ?? null,
      heartbeatAt: message.heartbeatAt ?? null,
      publishedAt: message.publishedAt ?? null,
      deadLetteredAt: message.deadLetteredAt ?? null,
      lastError: message.lastError ?? null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  /**
   * Side effects for a published message. Notification delivery is idempotent
   * per outbox message id, so worker retries never double-send.
   */
  private async deliver(message: OutboxMessageDocument) {
    const notification = message.payload?.notification as
      OutboxNotification | undefined;
    if (!notification?.userId || !notification.templateKey) return;

    const delivery = await this.notifications.dispatch({
      userId: notification.userId,
      templateKey: notification.templateKey,
      params: notification.params,
      payload: notification.payload,
      critical: notification.critical,
      idempotencyKey: `outbox:${message._id.toString()}`,
    });
    if (!delivery.notificationId) {
      throw new Error(
        `Notification dispatch was not persisted for ${notification.templateKey}`,
      );
    }
  }
}
