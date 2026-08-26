import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import { BookingStatus, MembershipStatus } from '../common/enums';
import { AuditAction } from '../common/enums';
import { AuditService } from '../audit/audit.service';
import { EventWriterService } from '../analytics/event-writer.service';
import { MongoTransactionService } from '../common/mongo/mongo-transaction.service';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import {
  CheckinDevice,
  CheckinDeviceDocument,
} from '../schemas/checkin-device.schema';
import {
  CheckinOfflineReconciliation,
  CheckinOfflineReconciliationDocument,
  CheckinOfflineReconciliationStatus,
  CheckinOfflineResolutionAction,
} from '../schemas/checkin-offline-reconciliation.schema';
import {
  CheckinOfflineSnapshot,
  CheckinOfflineSnapshotDocument,
  CheckinOfflineSnapshotStatus,
} from '../schemas/checkin-offline-snapshot.schema';
import {
  ClubMembership,
  ClubMembershipDocument,
} from '../schemas/club-membership.schema';
import { CheckinService } from './checkin.service';
import { trackCheckinOfflineOps } from './offline-checkin-ops-telemetry';
import { throwIfOfflineCheckinTestFailure } from './offline-checkin-test-failures';
import {
  IssueOfflineSnapshotDto,
  ListOfflineReconciliationsQueryDto,
  OfflineCheckInItemDto,
  ResolveOfflineReconciliationDto,
  SyncOfflineBatchDto,
} from './dto/checkin.dto';

const SNAPSHOT_VALIDITY_MS = 4 * 60 * 60 * 1000;
const SYNC_DEADLINE_MS = 24 * 60 * 60 * 1000;
const BOOKING_LOOKBACK_MS = 60 * 60 * 1000;
const BOOKING_LOOKAHEAD_MS = 12 * 60 * 60 * 1000;
const BOOKING_EARLY_CHECKIN_MS = 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_ELIGIBILITY_ROWS = 100;
const RESOLUTION_CLAIM_TTL_MS = 10 * 60 * 1000;

type SnapshotTokenPayload = {
  version: 1;
  snapshotId: string;
  clubId: string;
  deviceId: string;
  actorId: string;
  issuedAt: string;
  expiresAt: string;
  syncDeadline: string;
  maxEvents: number;
};

@Injectable()
export class OfflineCheckinService {
  private readonly signingSecret: string;
  private readonly nodeEnv: string;

  constructor(
    @InjectModel(CheckinOfflineSnapshot.name)
    private readonly snapshotModel: Model<CheckinOfflineSnapshotDocument>,
    @InjectModel(CheckinOfflineReconciliation.name)
    private readonly reconciliationModel: Model<CheckinOfflineReconciliationDocument>,
    @InjectModel(CheckinDevice.name)
    private readonly deviceModel: Model<CheckinDeviceDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
    private readonly checkin: CheckinService,
    private readonly transactions: MongoTransactionService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
    config: ConfigService,
  ) {
    this.nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
    const configuredSecret = config.get<string>(
      'OFFLINE_CHECKIN_SIGNING_SECRET',
    );
    if (
      config.get<string>('NODE_ENV') === 'production' &&
      (!configuredSecret || configuredSecret.length < 32)
    ) {
      throw new Error(
        'OFFLINE_CHECKIN_SIGNING_SECRET must be at least 32 characters in production',
      );
    }
    this.signingSecret =
      configuredSecret ?? 'gym4me-development-offline-checkin-key';
  }

  async issueSnapshot(
    clubId: string,
    actorId: string,
    dto: IssueOfflineSnapshotDto,
  ) {
    await this.checkin.assertDeskAccess(clubId, actorId);
    await this.checkin.assertMembersCheckin(clubId, actorId);
    const device = await this.findActiveActorDevice(
      clubId,
      actorId,
      dto.deviceId,
    );
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + SNAPSHOT_VALIDITY_MS);
    const syncDeadline = new Date(issuedAt.getTime() + SYNC_DEADLINE_MS);
    const [bookings, memberships] = await Promise.all([
      this.bookingModel
        .find({
          clubId: new Types.ObjectId(clubId),
          status: BookingStatus.CONFIRMED,
          startsAt: {
            $gte: new Date(issuedAt.getTime() - BOOKING_LOOKBACK_MS),
            $lte: new Date(issuedAt.getTime() + BOOKING_LOOKAHEAD_MS),
          },
        })
        .sort({ startsAt: 1 })
        .limit(MAX_ELIGIBILITY_ROWS)
        .select('_id athleteId code startsAt endsAt')
        .lean(),
      this.membershipModel
        .find({
          clubId: new Types.ObjectId(clubId),
          status: MembershipStatus.ACTIVE,
          'holder.userId': { $exists: true },
          $and: [
            {
              $or: [
                { 'credit.expiresAt': { $exists: false } },
                { 'credit.expiresAt': { $gte: issuedAt } },
              ],
            },
            {
              $or: [
                { 'credit.remainingSessions': { $gt: 0 } },
                { 'credit.remainingEntries': { $gt: 0 } },
                {
                  'credit.remainingSessions': { $exists: false },
                  'credit.remainingEntries': { $exists: false },
                },
              ],
            },
          ],
        })
        .sort({ updatedAt: -1 })
        .limit(MAX_ELIGIBILITY_ROWS)
        .select('_id holder.userId credit.expiresAt')
        .lean(),
    ]);

    const snapshot = await this.snapshotModel.create({
      clubId: new Types.ObjectId(clubId),
      deviceId: device._id,
      deviceCredentialVersion: device.credentialVersion,
      actorId: new Types.ObjectId(actorId),
      bookings: bookings.map((booking) => ({
        bookingId: booking._id,
        userId: booking.athleteId,
        code: booking.code,
        validFrom: new Date(
          booking.startsAt.getTime() - BOOKING_EARLY_CHECKIN_MS,
        ),
        validUntil: booking.endsAt,
      })),
      memberships: memberships.map((membership) => ({
        membershipId: membership._id,
        userId: membership.holder.userId,
        validUntil: membership.credit.expiresAt,
      })),
      issuedAt,
      expiresAt,
      syncDeadline,
      maxEvents: MAX_ELIGIBILITY_ROWS,
      lastSequence: 0,
      status: CheckinOfflineSnapshotStatus.ACTIVE,
    });
    const payload = this.snapshotTokenPayload(snapshot);
    await trackCheckinOfflineOps(this.events, {
      actorId,
      eventId: `checkin_offline_snapshot:${snapshot._id.toString()}`,
      properties: {
        kind: 'snapshot_issued',
        clubId,
        snapshotId: snapshot._id.toString(),
        deviceId: device._id.toString(),
        itemCount: bookings.length + memberships.length,
      },
    });
    return {
      snapshotToken: this.signToken(payload),
      snapshot: this.toSnapshotPublic(snapshot),
    };
  }

  async revokeActiveSnapshotsForDevice(clubId: string, deviceId: string, actorId: string) {
    if (!Types.ObjectId.isValid(deviceId)) return { revoked: 0 };
    const result = await this.snapshotModel.updateMany(
      {
        clubId: new Types.ObjectId(clubId),
        deviceId: new Types.ObjectId(deviceId),
        status: CheckinOfflineSnapshotStatus.ACTIVE,
      },
      { $set: { status: CheckinOfflineSnapshotStatus.REVOKED } },
    );
    if (result.modifiedCount > 0) {
      await trackCheckinOfflineOps(this.events, {
        actorId,
        eventId: `checkin_offline_revoke:${clubId}:${deviceId}`,
        properties: {
          kind: 'revoke',
          clubId,
          deviceId,
          itemCount: result.modifiedCount,
        },
      });
    }
    return { revoked: result.modifiedCount };
  }

  async invalidateSnapshotsAfterCredentialRotation(
    clubId: string,
    deviceId: string,
    actorId: string,
  ) {
    return this.revokeActiveSnapshotsForDevice(clubId, deviceId, actorId);
  }

  async syncBatch(
    clubId: string,
    actorId: string,
    dto: SyncOfflineBatchDto,
    request?: Request,
  ) {
    await this.checkin.assertDeskAccess(clubId, actorId);
    throwIfOfflineCheckinTestFailure('sync_before_response', this.nodeEnv);
    const startedAt = Date.now();
    const payload = this.verifyToken(dto.snapshotToken);
    if (payload.clubId !== clubId || payload.actorId !== actorId) {
      throw new UnauthorizedException('Offline snapshot binding mismatch');
    }
    const snapshot = await this.snapshotModel.findOne({
      _id: new Types.ObjectId(payload.snapshotId),
      clubId: new Types.ObjectId(clubId),
      deviceId: new Types.ObjectId(payload.deviceId),
      actorId: new Types.ObjectId(actorId),
      status: CheckinOfflineSnapshotStatus.ACTIVE,
    });
    if (!snapshot || new Date() > snapshot.syncDeadline) {
      throw new UnauthorizedException('Offline snapshot is revoked or expired');
    }
    const device = await this.findActiveActorDevice(
      clubId,
      actorId,
      payload.deviceId,
    );
    if (device.credentialVersion !== snapshot.deviceCredentialVersion) {
      throw new UnauthorizedException(
        'Offline snapshot was invalidated by credential rotation',
      );
    }

    const items: Array<Record<string, unknown>> = [];
    const reasonCodes: string[] = [];
    for (const item of dto.items) {
      const outcome = await this.reconcileItem(snapshot, item, request);
      if (
        typeof outcome.reasonCode === 'string' &&
        !reasonCodes.includes(outcome.reasonCode)
      ) {
        reasonCodes.push(outcome.reasonCode);
      }
      items.push(outcome);
    }
    throwIfOfflineCheckinTestFailure('partial_response', this.nodeEnv);
    await this.deviceModel.updateOne(
      { _id: snapshot.deviceId },
      { $set: { lastSeenAt: new Date() } },
    );
    const reasonCodesFromItems = items
      .map((entry) =>
        typeof (entry as { reasonCode?: string }).reasonCode === 'string'
          ? (entry as { reasonCode: string }).reasonCode
          : undefined,
      )
      .filter((code): code is string => Boolean(code));
    await trackCheckinOfflineOps(this.events, {
      actorId,
      eventId: `checkin_offline_sync:${snapshot._id.toString()}:${dto.items[0]?.sequence ?? 0}`,
      properties: {
        kind: 'sync_batch',
        clubId,
        snapshotId: snapshot._id.toString(),
        deviceId: snapshot.deviceId.toString(),
        itemCount: dto.items.length,
        queueDepth: dto.ops?.queueDepth,
        syncLatencyMs: dto.ops?.syncLatencyMs ?? Date.now() - startedAt,
        retryCount: dto.ops?.retryCount,
        acceptedCount: items.filter((entry) => entry.status === 'created').length,
        duplicateCount: items.filter((entry) => entry.status === 'duplicate').length,
        reviewCount: items.filter((entry) => entry.status === 'review').length,
        rejectedCount: items.filter((entry) => entry.status === 'rejected').length,
        reasonCodes: reasonCodesFromItems.length ? reasonCodesFromItems : reasonCodes,
      },
    });
    if (dto.ops?.kind === 'clock_skew' && dto.ops.syncLatencyMs !== undefined) {
      await trackCheckinOfflineOps(this.events, {
        actorId,
        eventId: `checkin_offline_clock_skew:${snapshot._id.toString()}`,
        properties: {
          kind: 'clock_skew',
          clubId,
          snapshotId: snapshot._id.toString(),
          clockSkewMs: dto.ops.syncLatencyMs,
        },
      });
    }
    throwIfOfflineCheckinTestFailure('sync_after_response', this.nodeEnv);
    return { items };
  }

  async listReconciliations(
    clubId: string,
    actorId: string,
    query: ListOfflineReconciliationsQueryDto,
  ) {
    await this.checkin.assertListAccess(clubId, actorId);
    const filter: Record<string, unknown> = {
      clubId: new Types.ObjectId(clubId),
    };
    if (query.status) filter.status = query.status;
    const { page, pageSize } = resolvePageSize(query);
    const [rows, total] = await Promise.all([
      this.reconciliationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.reconciliationModel.countDocuments(filter),
    ]);
    return paginatedResult(
      rows.map((row) => this.toReconciliationPublic(row)),
      total,
      page,
      pageSize,
    );
  }

  async resolveReconciliation(
    clubId: string,
    reconciliationId: string,
    actorId: string,
    dto: ResolveOfflineReconciliationDto,
    request?: Request,
  ) {
    await this.checkin.assertDeskAccess(clubId, actorId);
    if (!Types.ObjectId.isValid(reconciliationId)) {
      throw new NotFoundException('Offline reconciliation not found');
    }
    const rowId = new Types.ObjectId(reconciliationId);
    let row = await this.reconciliationModel.findOne({
      _id: rowId,
      clubId: new Types.ObjectId(clubId),
    });
    if (!row) throw new NotFoundException('Offline reconciliation not found');

    const mutationId = dto.clientMutationId.trim();
    if (row.lastResolution?.clientMutationId === mutationId) {
      return this.toReconciliationPublic(row);
    }
    if (
      row.resolutions?.some(
        (resolution) => resolution.clientMutationId === mutationId,
      )
    ) {
      return this.toReconciliationPublic(row);
    }
    if ((row.resolutions?.length ?? 0) >= 20) {
      throw new ConflictException(
        'Offline reconciliation resolution limit reached',
      );
    }

    const canResolve =
      row.status === CheckinOfflineReconciliationStatus.REVIEW ||
      (dto.action === CheckinOfflineResolutionAction.DISMISS &&
        row.status === CheckinOfflineReconciliationStatus.REJECTED);
    const resumesOwnClaim =
      row.status === CheckinOfflineReconciliationStatus.PROCESSING &&
      row.resolutionClaim?.clientMutationId === mutationId;
    const staleClaimBefore = new Date(Date.now() - RESOLUTION_CLAIM_TTL_MS);
    const canTakeOverStaleClaim =
      row.status === CheckinOfflineReconciliationStatus.PROCESSING &&
      Boolean(row.resolutionClaim) &&
      row.resolutionClaim!.claimedAt <= staleClaimBefore;

    if (
      dto.action === CheckinOfflineResolutionAction.RETRY &&
      row.status === CheckinOfflineReconciliationStatus.REJECTED
    ) {
      throw new ConflictException('Rejected security events cannot be retried');
    }
    if (!canResolve && !resumesOwnClaim && !canTakeOverStaleClaim) {
      throw new ConflictException(
        'Cannot resolve offline reconciliation in its current status',
      );
    }

    if (!resumesOwnClaim) {
      const statusFilter = canResolve
        ? { $in: [row.status] }
        : CheckinOfflineReconciliationStatus.PROCESSING;
      const claimFilter = canTakeOverStaleClaim
        ? { 'resolutionClaim.claimedAt': { $lte: staleClaimBefore } }
        : {};
      row = await this.reconciliationModel.findOneAndUpdate(
        {
          _id: rowId,
          clubId: new Types.ObjectId(clubId),
          status: statusFilter,
          'resolutions.19': { $exists: false },
          ...claimFilter,
        },
        {
          $set: {
            status: CheckinOfflineReconciliationStatus.PROCESSING,
            resolutionClaim: {
              clientMutationId: mutationId,
              action: dto.action,
              actorId: new Types.ObjectId(actorId),
              reason: dto.reason.trim(),
              claimedAt: new Date(),
            },
          },
        },
        { new: true },
      );
      if (!row) {
        const concurrent = await this.reconciliationModel.findOne({
          _id: rowId,
          clubId: new Types.ObjectId(clubId),
        });
        if (concurrent?.lastResolution?.clientMutationId === mutationId) {
          return this.toReconciliationPublic(concurrent);
        }
        if (concurrent?.resolutionClaim?.clientMutationId === mutationId) {
          row = concurrent;
        } else {
          throw new ConflictException('Offline reconciliation changed; reload');
        }
      }
    }

    if (dto.action === CheckinOfflineResolutionAction.DISMISS) {
      const resolved = await this.completeResolutionClaim(row, {
        actorId,
        mutationId,
        action: dto.action,
        reason: dto.reason.trim(),
        outcome: 'dismissed',
        status: CheckinOfflineReconciliationStatus.DISMISSED,
      });
      this.auditResolution(resolved, actorId, dto, request);
      return this.toReconciliationPublic(resolved);
    }

    const item = this.reconciliationItem(row);
    try {
      const result = await this.checkin.executeOfflineItem(
        clubId,
        row.actorId.toString(),
        item,
        this.serverIdempotencyKey(row.snapshotId, row.sequence, row.nonce),
        request,
      );
      const resolved = await this.completeResolutionClaim(row, {
        actorId,
        mutationId,
        action: dto.action,
        reason: dto.reason.trim(),
        outcome: 'accepted',
        status: CheckinOfflineReconciliationStatus.ACCEPTED,
        checkInId: new Types.ObjectId(result.checkIn.id),
      });
      this.auditResolution(resolved, actorId, dto, request);
      await trackCheckinOfflineOps(this.events, {
        actorId,
        eventId: `checkin_offline_resolution:${resolved._id.toString()}:${mutationId}`,
        properties: {
          kind:
            dto.action === CheckinOfflineResolutionAction.RETRY ? 'retry' : 'reject',
          clubId,
          snapshotId: resolved.snapshotId.toString(),
          reasonCodes: resolved.reasonCode ? [resolved.reasonCode] : undefined,
        },
      });
      return this.toReconciliationPublic(resolved);
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : 'Authoritative check-in retry failed';
      const resolved = await this.completeResolutionClaim(row, {
        actorId,
        mutationId,
        action: dto.action,
        reason: dto.reason.trim(),
        outcome: 'review',
        status: CheckinOfflineReconciliationStatus.REVIEW,
        reconciliationReason: reason,
        reconciliationReasonCode: 'authoritative_state_conflict',
      });
      this.auditResolution(resolved, actorId, dto, request);
      return this.toReconciliationPublic(resolved);
    }
  }

  private async reconcileItem(
    snapshot: CheckinOfflineSnapshotDocument,
    item: OfflineCheckInItemDto,
    request?: Request,
  ) {
    const fingerprint = this.eventFingerprint(item);
    let reconciliation = await this.reconciliationModel.findOne({
      snapshotId: snapshot._id,
      $or: [{ sequence: item.sequence }, { nonce: item.nonce }],
    });
    if (reconciliation && reconciliation.fingerprint !== fingerprint) {
      throw new ConflictException('Offline sequence or nonce payload drift');
    }

    if (!reconciliation) {
      try {
        reconciliation = await this.transactions.run(async (session) => {
          const claimed = await this.snapshotModel.findOneAndUpdate(
            {
              _id: snapshot._id,
              status: CheckinOfflineSnapshotStatus.ACTIVE,
              lastSequence: item.sequence - 1,
              maxEvents: { $gte: item.sequence },
              syncDeadline: { $gte: new Date() },
            },
            { $inc: { lastSequence: 1 } },
            { new: true, session },
          );
          if (!claimed) {
            throw new ConflictException('Offline events must sync in sequence');
          }
          const [created] = await this.reconciliationModel.create(
            [
              {
                snapshotId: snapshot._id,
                deviceId: snapshot.deviceId,
                clubId: snapshot.clubId,
                actorId: snapshot.actorId,
                sequence: item.sequence,
                nonce: item.nonce,
                fingerprint,
                payload: item,
                status: CheckinOfflineReconciliationStatus.PROCESSING,
              },
            ],
            { session },
          );
          return created;
        });
      } catch (error) {
        const concurrent = await this.reconciliationModel.findOne({
          snapshotId: snapshot._id,
          $or: [{ sequence: item.sequence }, { nonce: item.nonce }],
        });
        if (!concurrent || concurrent.fingerprint !== fingerprint) throw error;
        reconciliation = concurrent;
      }
    }

    if (
      reconciliation.status !== CheckinOfflineReconciliationStatus.PROCESSING
    ) {
      return this.toSyncResult(reconciliation, true);
    }

    const eligibilityError = this.getEligibilityError(snapshot, item);
    if (eligibilityError) {
      reconciliation.status = CheckinOfflineReconciliationStatus.REJECTED;
      reconciliation.reason = eligibilityError.message;
      reconciliation.reasonCode = eligibilityError.code;
      reconciliation.reconciledAt = new Date();
      await reconciliation.save();
      return {
        ...this.toSyncResult(reconciliation, false),
        reasonCode: eligibilityError.code,
      };
    }

    const idempotencyKey = this.serverIdempotencyKey(
      snapshot._id,
      item.sequence,
      item.nonce,
    );
    try {
      const result = await this.checkin.executeOfflineItem(
        snapshot.clubId.toString(),
        snapshot.actorId.toString(),
        item,
        idempotencyKey,
        request,
      );
      reconciliation.status = CheckinOfflineReconciliationStatus.ACCEPTED;
      reconciliation.checkInId = new Types.ObjectId(result.checkIn.id);
      reconciliation.reconciledAt = new Date();
      reconciliation.reason = undefined;
      await reconciliation.save();
      throwIfOfflineCheckinTestFailure('sync_after_commit', this.nodeEnv);
      return {
        clientIdempotencyKey: item.clientIdempotencyKey,
        sequence: item.sequence,
        status: result.status,
        checkIn: result.checkIn,
      };
    } catch (error) {
      reconciliation.status = CheckinOfflineReconciliationStatus.REVIEW;
      reconciliation.reason =
        error instanceof Error
          ? error.message
          : 'Authoritative check-in failed';
      reconciliation.reasonCode = 'authoritative_state_conflict';
      reconciliation.reconciledAt = new Date();
      await reconciliation.save();
      return {
        ...this.toSyncResult(reconciliation, false),
        reasonCode: 'authoritative_state_conflict',
      };
    }
  }

  private getEligibilityError(
    snapshot: CheckinOfflineSnapshotDocument,
    item: OfflineCheckInItemDto,
  ) {
    const occurredAt = new Date(item.occurredAt);
    if (
      occurredAt < new Date(snapshot.issuedAt.getTime() - CLOCK_SKEW_MS) ||
      occurredAt > snapshot.expiresAt
    ) {
      return {
        code: 'outside_snapshot_window',
        message: 'Offline event occurred outside the signed snapshot window',
      };
    }
    if (item.bookingCode) {
      if (item.membershipId || item.userId) {
        return {
          code: 'ambiguous_eligibility',
          message: 'Offline event must identify exactly one eligibility type',
        };
      }
      const booking = snapshot.bookings.find(
        (candidate) => candidate.code === item.bookingCode?.trim(),
      );
      return !booking ||
        occurredAt < booking.validFrom ||
        occurredAt > booking.validUntil
        ? {
            code: 'booking_not_snapshot_eligible',
            message: 'Booking was not eligible in the signed snapshot',
          }
        : null;
    }
    if (item.membershipId && item.userId) {
      const membership = snapshot.memberships.find(
        (candidate) =>
          candidate.membershipId.toString() === item.membershipId &&
          candidate.userId.toString() === item.userId,
      );
      return !membership ||
        (membership.validUntil && occurredAt > membership.validUntil)
        ? {
            code: 'membership_not_snapshot_eligible',
            message: 'Membership was not eligible in the signed snapshot',
          }
        : null;
    }
    if (item.membershipId || item.userId) {
      return {
        code: 'membership_identity_incomplete',
        message: 'Offline membership event needs membershipId and userId',
      };
    }
    return {
      code: 'eligibility_identity_missing',
      message: 'Offline item needs bookingCode or membershipId+userId',
    };
  }

  private async findActiveActorDevice(
    clubId: string,
    actorId: string,
    deviceId: string,
  ) {
    if (!Types.ObjectId.isValid(deviceId)) {
      throw new NotFoundException('Check-in device not found');
    }
    const device = await this.deviceModel.findOne({
      _id: new Types.ObjectId(deviceId),
      clubId: new Types.ObjectId(clubId),
      operatorUserId: new Types.ObjectId(actorId),
      status: 'active',
    });
    if (!device) throw new NotFoundException('Check-in device not found');
    return device;
  }

  private snapshotTokenPayload(snapshot: CheckinOfflineSnapshotDocument) {
    return {
      version: 1 as const,
      snapshotId: snapshot._id.toString(),
      clubId: snapshot.clubId.toString(),
      deviceId: snapshot.deviceId.toString(),
      deviceCredentialVersion: snapshot.deviceCredentialVersion,
      actorId: snapshot.actorId.toString(),
      issuedAt: snapshot.issuedAt.toISOString(),
      expiresAt: snapshot.expiresAt.toISOString(),
      syncDeadline: snapshot.syncDeadline.toISOString(),
      maxEvents: snapshot.maxEvents,
    };
  }

  private signToken(payload: SnapshotTokenPayload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${encoded}.${this.signature(encoded)}`;
  }

  private verifyToken(token: string): SnapshotTokenPayload {
    const [encoded, suppliedSignature, extra] = token.split('.');
    if (!encoded || !suppliedSignature || extra) {
      throw new UnauthorizedException('Invalid offline snapshot token');
    }
    const expected = Buffer.from(this.signature(encoded));
    const supplied = Buffer.from(suppliedSignature);
    if (
      expected.length !== supplied.length ||
      !timingSafeEqual(expected, supplied)
    ) {
      throw new UnauthorizedException('Invalid offline snapshot token');
    }
    try {
      const payload = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as SnapshotTokenPayload;
      if (
        payload.version !== 1 ||
        !Types.ObjectId.isValid(payload.snapshotId) ||
        !Types.ObjectId.isValid(payload.clubId) ||
        !Types.ObjectId.isValid(payload.deviceId) ||
        !Types.ObjectId.isValid(payload.actorId)
      ) {
        throw new Error('invalid claims');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid offline snapshot token');
    }
  }

  private signature(encoded: string) {
    return createHmac('sha256', this.signingSecret)
      .update(encoded)
      .digest('base64url');
  }

  private eventFingerprint(item: OfflineCheckInItemDto) {
    return createHash('sha256')
      .update(
        JSON.stringify({
          clientIdempotencyKey: item.clientIdempotencyKey,
          method: item.method,
          occurredAt: item.occurredAt,
          sequence: item.sequence,
          nonce: item.nonce,
          bookingCode: item.bookingCode?.trim() ?? null,
          membershipId: item.membershipId ?? null,
          userId: item.userId ?? null,
        }),
      )
      .digest('hex');
  }

  private serverIdempotencyKey(
    snapshotId: Types.ObjectId,
    sequence: number,
    nonce: string,
  ) {
    const nonceHash = createHash('sha256')
      .update(nonce)
      .digest('hex')
      .slice(0, 24);
    return `offline:${snapshotId.toString()}:${sequence}:${nonceHash}`;
  }

  private reconciliationItem(
    row: CheckinOfflineReconciliationDocument,
  ): OfflineCheckInItemDto {
    return {
      clientIdempotencyKey: row.payload.clientIdempotencyKey,
      method: row.payload.method,
      occurredAt: row.payload.occurredAt.toISOString(),
      sequence: row.sequence,
      nonce: row.nonce,
      bookingCode: row.payload.bookingCode,
      membershipId: row.payload.membershipId?.toString(),
      userId: row.payload.userId?.toString(),
    };
  }

  private async completeResolutionClaim(
    row: CheckinOfflineReconciliationDocument,
    resolution: {
      actorId: string;
      mutationId: string;
      action: CheckinOfflineResolutionAction;
      reason: string;
      outcome: 'accepted' | 'review' | 'dismissed';
      status: CheckinOfflineReconciliationStatus;
      checkInId?: Types.ObjectId;
      reconciliationReason?: string;
      reconciliationReasonCode?: string;
    },
  ) {
    const resolvedAt = new Date();
    const resolutionEvent = {
      clientMutationId: resolution.mutationId,
      action: resolution.action,
      actorId: new Types.ObjectId(resolution.actorId),
      reason: resolution.reason,
      outcome: resolution.outcome,
      resolvedAt,
    };
    const $set: Record<string, unknown> = {
      status: resolution.status,
      reconciledAt: resolvedAt,
      lastResolution: resolutionEvent,
    };
    if (resolution.checkInId) $set.checkInId = resolution.checkInId;
    if (resolution.reconciliationReason) {
      $set.reason = resolution.reconciliationReason;
    }
    if (resolution.reconciliationReasonCode) {
      $set.reasonCode = resolution.reconciliationReasonCode;
    }
    const $unset: Record<string, 1> = { resolutionClaim: 1 };
    if (resolution.outcome === 'accepted') {
      $unset.reason = 1;
      $unset.reasonCode = 1;
    }

    const resolved = await this.reconciliationModel.findOneAndUpdate(
      {
        _id: row._id,
        status: CheckinOfflineReconciliationStatus.PROCESSING,
        'resolutionClaim.clientMutationId': resolution.mutationId,
      },
      { $set, $unset, $push: { resolutions: resolutionEvent } },
      { new: true },
    );
    if (!resolved) {
      const concurrent = await this.reconciliationModel.findOne({
        _id: row._id,
        'lastResolution.clientMutationId': resolution.mutationId,
      });
      if (concurrent) return concurrent;
      throw new ConflictException('Offline reconciliation changed; reload');
    }
    return resolved;
  }

  private auditResolution(
    row: CheckinOfflineReconciliationDocument,
    actorId: string,
    dto: ResolveOfflineReconciliationDto,
    request?: Request,
  ) {
    this.audit.log({
      action:
        dto.action === CheckinOfflineResolutionAction.RETRY
          ? AuditAction.CHECKIN_OFFLINE_RETRIED
          : AuditAction.CHECKIN_OFFLINE_DISMISSED,
      actorId,
      targetUserId: row.payload.userId,
      request,
      metadata: {
        clubId: row.clubId.toString(),
        reconciliationId: row._id.toString(),
        snapshotId: row.snapshotId.toString(),
        sequence: row.sequence,
        clientMutationId: dto.clientMutationId,
        reason: dto.reason,
        outcome: row.lastResolution?.outcome,
        checkInId: row.checkInId?.toString() ?? null,
      },
    });
  }

  private toSyncResult(
    row: CheckinOfflineReconciliationDocument,
    duplicate: boolean,
  ) {
    return {
      clientIdempotencyKey: row.payload.clientIdempotencyKey,
      sequence: row.sequence,
      status:
        row.status === CheckinOfflineReconciliationStatus.ACCEPTED
          ? duplicate
            ? ('duplicate' as const)
            : ('created' as const)
          : row.status,
      checkInId: row.checkInId?.toString() ?? null,
      error: row.reason ?? undefined,
      reasonCode: row.reasonCode ?? undefined,
    };
  }

  private toSnapshotPublic(snapshot: CheckinOfflineSnapshotDocument) {
    return {
      id: snapshot._id.toString(),
      clubId: snapshot.clubId.toString(),
      deviceId: snapshot.deviceId.toString(),
      issuedAt: snapshot.issuedAt,
      expiresAt: snapshot.expiresAt,
      syncDeadline: snapshot.syncDeadline,
      maxEvents: snapshot.maxEvents,
      lastSequence: snapshot.lastSequence,
      bookings: snapshot.bookings.map((booking) => ({
        bookingId: booking.bookingId.toString(),
        userId: booking.userId.toString(),
        code: booking.code,
        validFrom: booking.validFrom,
        validUntil: booking.validUntil,
      })),
      memberships: snapshot.memberships.map((membership) => ({
        membershipId: membership.membershipId.toString(),
        userId: membership.userId.toString(),
        validUntil: membership.validUntil ?? null,
      })),
    };
  }

  private toReconciliationPublic(row: CheckinOfflineReconciliationDocument) {
    return {
      id: row._id.toString(),
      snapshotId: row.snapshotId.toString(),
      deviceId: row.deviceId.toString(),
      sequence: row.sequence,
      status: row.status,
      payload: row.payload,
      checkInId: row.checkInId?.toString() ?? null,
      reason: row.reason ?? null,
      reasonCode: row.reasonCode ?? null,
      lastResolution: row.lastResolution
        ? {
            clientMutationId: row.lastResolution.clientMutationId,
            action: row.lastResolution.action,
            actorId: row.lastResolution.actorId.toString(),
            reason: row.lastResolution.reason,
            outcome: row.lastResolution.outcome,
            resolvedAt: row.lastResolution.resolvedAt,
          }
        : null,
      reconciledAt: row.reconciledAt ?? null,
      createdAt: row.createdAt,
    };
  }
}
