import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { Model } from 'mongoose';
import {
  WorkerLease,
  type WorkerLeaseDocument,
} from '../../schemas/worker-lease.schema';

export type WorkerLeaseRunResult<T> =
  { acquired: false } | { acquired: true; result: T };

@Injectable()
export class WorkerLeaseService {
  private readonly logger = new Logger(WorkerLeaseService.name);
  readonly instanceId = `${process.env.INSTANCE_ID ?? hostname()}:${process.pid}:${randomUUID()}`;

  constructor(
    @InjectModel(WorkerLease.name)
    private readonly leaseModel: Model<WorkerLeaseDocument>,
  ) {}

  async listOperational() {
    const now = new Date();
    const leases = await this.leaseModel.find().sort({ key: 1 }).lean();
    return {
      result: leases.map((lease) => ({
        key: lease.key,
        state:
          lease.ownerId && lease.leaseUntil > now ? 'running' : 'available',
        ownerId: lease.ownerId ?? null,
        leaseUntil: lease.leaseUntil,
        acquiredAt: lease.acquiredAt ?? null,
        heartbeatAt: lease.heartbeatAt ?? null,
        lastCompletedAt: lease.lastCompletedAt ?? null,
        lastError: lease.lastError ?? null,
        runCount: lease.runCount,
        updatedAt: lease.updatedAt,
      })),
    };
  }

  /** Run one periodic job globally, renewing its lease until work finishes. */
  async runExclusive<T>(
    key: string,
    work: () => Promise<T>,
    options: { leaseMs?: number; heartbeatMs?: number } = {},
  ): Promise<WorkerLeaseRunResult<T>> {
    const leaseMs = Math.max(10_000, options.leaseMs ?? 120_000);
    const heartbeatMs = Math.max(
      2_000,
      Math.min(options.heartbeatMs ?? Math.floor(leaseMs / 3), leaseMs / 2),
    );
    if (!(await this.tryAcquire(key, leaseMs))) return { acquired: false };

    const timer = setInterval(() => {
      void this.heartbeat(key, leaseMs).catch((error: unknown) => {
        this.logger.warn(
          `Worker lease heartbeat failed key=${key}: ${String(error)}`,
        );
      });
    }, heartbeatMs);
    timer.unref?.();

    try {
      const result = await work();
      await this.release(key);
      return { acquired: true, result };
    } catch (error) {
      await this.release(key, error).catch((releaseError: unknown) => {
        this.logger.warn(
          `Worker lease release failed key=${key}: ${String(releaseError)}`,
        );
      });
      throw error;
    } finally {
      clearInterval(timer);
    }
  }

  async tryAcquire(key: string, leaseMs: number): Promise<boolean> {
    const now = new Date();
    try {
      const lease = await this.leaseModel.findOneAndUpdate(
        {
          key,
          $or: [
            { leaseUntil: { $lte: now } },
            { leaseUntil: { $exists: false } },
          ],
        },
        {
          $setOnInsert: { key },
          $set: {
            ownerId: this.instanceId,
            acquiredAt: now,
            heartbeatAt: now,
            leaseUntil: new Date(now.getTime() + leaseMs),
          },
          $unset: { lastError: 1 },
          $inc: { runCount: 1 },
        },
        { upsert: true, new: true },
      );
      return Boolean(lease);
    } catch (error: unknown) {
      // An unexpired row does not match the update filter; upsert then loses
      // the unique-key race. That is a normal "lease busy" result.
      if ((error as { code?: number }).code === 11000) return false;
      throw error;
    }
  }

  async heartbeat(key: string, leaseMs: number): Promise<boolean> {
    const now = new Date();
    const result = await this.leaseModel.updateOne(
      { key, ownerId: this.instanceId, leaseUntil: { $gt: now } },
      {
        $set: {
          heartbeatAt: now,
          leaseUntil: new Date(now.getTime() + leaseMs),
        },
      },
    );
    return result.matchedCount === 1;
  }

  async release(key: string, error?: unknown): Promise<void> {
    const now = new Date();
    const lastError =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error) || 'Unknown worker error';
    await this.leaseModel.updateOne(
      { key, ownerId: this.instanceId },
      {
        $set: {
          leaseUntil: now,
          heartbeatAt: now,
          lastCompletedAt: now,
          ...(error
            ? {
                lastError: lastError.slice(0, 1000),
              }
            : {}),
        },
        $unset: error ? { ownerId: 1 } : { ownerId: 1, lastError: 1 },
      },
    );
  }
}
