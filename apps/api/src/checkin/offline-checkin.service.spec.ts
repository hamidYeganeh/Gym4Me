import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import type { BookingDocument } from '../schemas/booking.schema';
import type { CheckinDeviceDocument } from '../schemas/checkin-device.schema';
import {
  CheckinOfflineReconciliationStatus,
  CheckinOfflineResolutionAction,
  type CheckinOfflineReconciliationDocument,
} from '../schemas/checkin-offline-reconciliation.schema';
import type { CheckinOfflineSnapshotDocument } from '../schemas/checkin-offline-snapshot.schema';
import type { ClubMembershipDocument } from '../schemas/club-membership.schema';
import type { MongoTransactionService } from '../common/mongo/mongo-transaction.service';
import type { CheckinService } from './checkin.service';
import type { AuditService } from '../audit/audit.service';
import { CheckInMethod } from '../common/enums';
import { OfflineCheckinService } from './offline-checkin.service';

function createService(config: Record<string, string>) {
  const model = {} as Model<never>;
  return new OfflineCheckinService(
    model as Model<CheckinOfflineSnapshotDocument>,
    model as Model<CheckinOfflineReconciliationDocument>,
    model as Model<CheckinDeviceDocument>,
    model as Model<BookingDocument>,
    model as Model<ClubMembershipDocument>,
    {} as CheckinService,
    {} as MongoTransactionService,
    {} as AuditService,
    { track: jest.fn().mockResolvedValue(undefined) } as never,
    new ConfigService(config),
  );
}

describe('OfflineCheckinService signed snapshot boundary', () => {
  const payload = {
    version: 1 as const,
    snapshotId: '64b000000000000000000001',
    clubId: '64b000000000000000000002',
    deviceId: '64b000000000000000000003',
    actorId: '64b000000000000000000004',
    issuedAt: '2026-08-25T08:00:00.000Z',
    expiresAt: '2026-08-25T12:00:00.000Z',
    syncDeadline: '2026-08-26T08:00:00.000Z',
    maxEvents: 100,
  };

  it('fails closed without a dedicated production signing secret', () => {
    expect(() => createService({ NODE_ENV: 'production' })).toThrow(
      'OFFLINE_CHECKIN_SIGNING_SECRET',
    );
  });

  it('accepts its signed claims and rejects payload tampering', () => {
    const service = createService({
      NODE_ENV: 'test',
      OFFLINE_CHECKIN_SIGNING_SECRET:
        'a-dedicated-test-key-that-is-long-enough',
    });
    const token = service['signToken'](payload);
    expect(service['verifyToken'](token)).toEqual(payload);

    const [encoded, signature] = token.split('.');
    const tampered = Buffer.from(
      JSON.stringify({ ...payload, actorId: '64b000000000000000000005' }),
    ).toString('base64url');
    expect(() => service['verifyToken'](`${tampered}.${signature}`)).toThrow(
      UnauthorizedException,
    );
    expect(encoded).toBeTruthy();
  });
});

describe('OfflineCheckinService reconciliation resolution', () => {
  const clubId = '64b000000000000000000010';
  const reconciliationId = '64b000000000000000000011';
  const originalActorId = new Types.ObjectId('64b000000000000000000012');
  const reviewerId = '64b000000000000000000013';

  function row(
    patch: Record<string, unknown> = {},
  ): CheckinOfflineReconciliationDocument {
    return {
      _id: new Types.ObjectId(reconciliationId),
      snapshotId: new Types.ObjectId('64b000000000000000000014'),
      deviceId: new Types.ObjectId('64b000000000000000000015'),
      clubId: new Types.ObjectId(clubId),
      actorId: originalActorId,
      sequence: 1,
      nonce: 'nonce-that-is-long-enough',
      fingerprint: 'a'.repeat(64),
      payload: {
        clientIdempotencyKey: 'client-attempt-that-is-long-enough',
        method: CheckInMethod.MANUAL,
        occurredAt: new Date('2026-08-25T08:00:00.000Z'),
        membershipId: new Types.ObjectId('64b000000000000000000016'),
        userId: new Types.ObjectId('64b000000000000000000017'),
      },
      status: CheckinOfflineReconciliationStatus.REVIEW,
      reason: 'Membership consumed elsewhere',
      reconciledAt: new Date('2026-08-25T08:05:00.000Z'),
      createdAt: new Date('2026-08-25T08:05:00.000Z'),
      updatedAt: new Date('2026-08-25T08:05:00.000Z'),
      ...patch,
    } as unknown as CheckinOfflineReconciliationDocument;
  }

  function resolutionService(options?: {
    retryFails?: boolean;
    action?: CheckinOfflineResolutionAction;
  }) {
    const action = options?.action ?? CheckinOfflineResolutionAction.RETRY;
    const initial = row();
    const claim = row({
      status: CheckinOfflineReconciliationStatus.PROCESSING,
      resolutionClaim: {
        clientMutationId: 'resolution-attempt-0001',
        action,
        actorId: new Types.ObjectId(reviewerId),
        reason: 'تلاش دوباره پس از بررسی پذیرش',
        claimedAt: new Date(),
      },
    });
    const accepted = row({
      status:
        action === CheckinOfflineResolutionAction.DISMISS
          ? CheckinOfflineReconciliationStatus.DISMISSED
          : options?.retryFails
            ? CheckinOfflineReconciliationStatus.REVIEW
            : CheckinOfflineReconciliationStatus.ACCEPTED,
      checkInId:
        options?.retryFails || action === CheckinOfflineResolutionAction.DISMISS
          ? undefined
          : new Types.ObjectId('64b000000000000000000018'),
      lastResolution: {
        clientMutationId: 'resolution-attempt-0001',
        action,
        actorId: new Types.ObjectId(reviewerId),
        reason: 'تلاش دوباره پس از بررسی پذیرش',
        outcome:
          action === CheckinOfflineResolutionAction.DISMISS
            ? 'dismissed'
            : options?.retryFails
              ? 'review'
              : 'accepted',
        resolvedAt: new Date(),
      },
    });
    const findOne = jest.fn().mockResolvedValue(initial);
    const findOneAndUpdate = jest
      .fn()
      .mockResolvedValueOnce(claim)
      .mockResolvedValueOnce(accepted);
    const reconciliationModel = {
      findOne,
      findOneAndUpdate,
    } as unknown as Model<CheckinOfflineReconciliationDocument>;
    const executeOfflineItem = options?.retryFails
      ? jest.fn().mockRejectedValue(new Error('Still not eligible'))
      : jest.fn().mockResolvedValue({
          status: 'created',
          checkIn: { id: '64b000000000000000000018' },
        });
    const checkin = {
      assertDeskAccess: jest.fn().mockResolvedValue(undefined),
      executeOfflineItem,
    } as unknown as CheckinService;
    const auditLog = jest.fn();
    const audit = { log: auditLog } as unknown as AuditService;
    const emptyModel = {} as Model<never>;
    const service = new OfflineCheckinService(
      emptyModel as Model<CheckinOfflineSnapshotDocument>,
      reconciliationModel,
      emptyModel as Model<CheckinDeviceDocument>,
      emptyModel as Model<BookingDocument>,
      emptyModel as Model<ClubMembershipDocument>,
      checkin,
      {} as MongoTransactionService,
      audit,
      { track: jest.fn().mockResolvedValue(undefined) } as never,
      new ConfigService({
        NODE_ENV: 'test',
        OFFLINE_CHECKIN_SIGNING_SECRET:
          'a-dedicated-test-key-that-is-long-enough',
      }),
    );
    return {
      service,
      reconciliationModel,
      executeOfflineItem,
      auditLog,
      findOne,
      findOneAndUpdate,
      initial,
      accepted,
    };
  }

  it('retries with the original actor and server-derived idempotency key', async () => {
    const { service, executeOfflineItem, auditLog } = resolutionService();
    const result = await service.resolveReconciliation(
      clubId,
      reconciliationId,
      reviewerId,
      {
        action: CheckinOfflineResolutionAction.RETRY,
        reason: 'تلاش دوباره پس از بررسی پذیرش',
        clientMutationId: 'resolution-attempt-0001',
      },
    );

    expect(executeOfflineItem).toHaveBeenCalledWith(
      clubId,
      originalActorId.toString(),
      expect.objectContaining({ sequence: 1 }),
      expect.stringMatching(/^offline:/),
      undefined,
    );
    expect(result.status).toBe(CheckinOfflineReconciliationStatus.ACCEPTED);
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'checkin.offline_retried',
        actorId: reviewerId,
      }),
    );
  });

  it('returns a failed retry to review instead of losing the record', async () => {
    const { service } = resolutionService({ retryFails: true });
    const result = await service.resolveReconciliation(
      clubId,
      reconciliationId,
      reviewerId,
      {
        action: CheckinOfflineResolutionAction.RETRY,
        reason: 'تلاش دوباره پس از بررسی پذیرش',
        clientMutationId: 'resolution-attempt-0001',
      },
    );
    expect(result.status).toBe(CheckinOfflineReconciliationStatus.REVIEW);
    expect(result.lastResolution?.outcome).toBe('review');
  });

  it('dismisses without creating attendance or consuming membership credit', async () => {
    const { service, executeOfflineItem, auditLog } = resolutionService({
      action: CheckinOfflineResolutionAction.DISMISS,
    });
    const result = await service.resolveReconciliation(
      clubId,
      reconciliationId,
      reviewerId,
      {
        action: CheckinOfflineResolutionAction.DISMISS,
        reason: 'ورود اشتباه توسط اپراتور تأیید شد',
        clientMutationId: 'resolution-attempt-0001',
      },
    );

    expect(executeOfflineItem).not.toHaveBeenCalled();
    expect(result.status).toBe(CheckinOfflineReconciliationStatus.DISMISSED);
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'checkin.offline_dismissed' }),
    );
  });

  it('returns a concurrently completed identical mutation idempotently', async () => {
    const {
      service,
      executeOfflineItem,
      findOne,
      findOneAndUpdate,
      initial,
      accepted,
    } = resolutionService();
    findOne.mockReset();
    findOne.mockResolvedValueOnce(initial).mockResolvedValueOnce(accepted);
    findOneAndUpdate.mockReset();
    findOneAndUpdate.mockResolvedValueOnce(null);

    const result = await service.resolveReconciliation(
      clubId,
      reconciliationId,
      reviewerId,
      {
        action: CheckinOfflineResolutionAction.RETRY,
        reason: 'تلاش دوباره پس از بررسی پذیرش',
        clientMutationId: 'resolution-attempt-0001',
      },
    );

    expect(result.status).toBe(CheckinOfflineReconciliationStatus.ACCEPTED);
    expect(executeOfflineItem).not.toHaveBeenCalled();
  });
});
