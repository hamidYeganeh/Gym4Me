import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import { AuditService } from '../../audit/audit.service';
import { AuditAction } from '../../common/enums';
import {
  AccountDeletionRequest,
  AccountDeletionRequestDocument,
  AccountDeletionRequestStatus,
} from '../../schemas/account-deletion-request.schema';
import { TokenService } from '../auth/token.service';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';

const COOLING_OFF_DAYS = 7;
const RETENTION_POLICY_VERSION = 'pending-adr-1';

@Injectable()
export class AccountDataRightsService {
  constructor(
    @InjectModel(AccountDeletionRequest.name)
    private readonly requests: Model<AccountDeletionRequestDocument>,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  async current(userId: string) {
    const request = await this.requests
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    return request ? this.project(request) : null;
  }

  async listAdmin(query: {
    page?: number;
    limit?: number;
    page_size?: number;
    status?: AccountDeletionRequestStatus[];
  }) {
    const { page, pageSize } = resolvePageSize(query);
    const filter = query.status?.length
      ? { status: { $in: query.status } }
      : {};
    const [items, total] = await Promise.all([
      this.requests
        .find(filter)
        .sort({ requestedAt: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.requests.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => ({
        ...this.project(item),
        userId: item.userId.toString(),
        reason: item.reason ?? null,
      })),
      total,
      page,
      pageSize,
    );
  }

  async request(userId: string, reason: string | undefined, request: Request) {
    const userObjectId = new Types.ObjectId(userId);
    const existing = await this.requests.findOne({
      userId: userObjectId,
      status: {
        $in: [
          AccountDeletionRequestStatus.COOLING_OFF,
          AccountDeletionRequestStatus.BLOCKED,
          AccountDeletionRequestStatus.PROCESSING,
        ],
      },
    });
    if (existing) return { ...this.project(existing), idempotent: true };

    const now = new Date();
    let created: AccountDeletionRequestDocument;
    try {
      created = await this.requests.create({
        userId: userObjectId,
        status: AccountDeletionRequestStatus.COOLING_OFF,
        requestedAt: now,
        coolingOffUntil: new Date(
          now.getTime() + COOLING_OFF_DAYS * 86_400_000,
        ),
        reason: reason?.trim() || undefined,
        retentionPolicyVersion: RETENTION_POLICY_VERSION,
      });
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        const winner = await this.requests.findOne({
          userId: userObjectId,
          status: {
            $in: [
              AccountDeletionRequestStatus.COOLING_OFF,
              AccountDeletionRequestStatus.BLOCKED,
              AccountDeletionRequestStatus.PROCESSING,
            ],
          },
        });
        if (winner) return { ...this.project(winner), idempotent: true };
      }
      throw error;
    }
    try {
      await this.tokens.revokeAll(userObjectId);
    } catch (error) {
      await this.requests.deleteOne({ _id: created._id });
      throw error;
    }
    this.audit.log({
      action: AuditAction.ACCOUNT_DELETION_REQUESTED,
      actorId: userObjectId,
      targetUserId: userObjectId,
      metadata: { requestId: created._id.toString() },
      request,
    });
    return { ...this.project(created), idempotent: false };
  }

  async cancel(userId: string, request: Request) {
    const current = await this.requests.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        status: AccountDeletionRequestStatus.COOLING_OFF,
        coolingOffUntil: { $gt: new Date() },
      },
      {
        $set: {
          status: AccountDeletionRequestStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      },
      { new: true },
    );
    if (!current) {
      throw new ConflictException('account_deletion.not_cancellable');
    }
    this.audit.log({
      action: AuditAction.ACCOUNT_DELETION_CANCELLED,
      actorId: userId,
      targetUserId: userId,
      metadata: { requestId: current._id.toString() },
      request,
    });
    return this.project(current);
  }

  private project(request: AccountDeletionRequestDocument) {
    return {
      id: request._id.toString(),
      status: request.status,
      requestedAt: request.requestedAt.toISOString(),
      coolingOffUntil: request.coolingOffUntil.toISOString(),
      retentionPolicyVersion: request.retentionPolicyVersion,
      cancelledAt: request.cancelledAt?.toISOString() ?? null,
      completedAt: request.completedAt?.toISOString() ?? null,
    };
  }
}
