import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditAction } from '../common/enums';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';

export interface AuditEntry {
  action: AuditAction;
  actorId?: string | Types.ObjectId;
  targetUserId?: string | Types.ObjectId;
  metadata?: Record<string, unknown>;
  request?: Request;
}

export interface AuditQuery {
  action?: AuditAction;
  actorId?: string;
  targetUserId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  /** Fire-and-forget: auditing must never break the main flow. */
  log(entry: AuditEntry): void {
    const { request, ...rest } = entry;
    void this.auditModel
      .create({
        ...rest,
        ip: request?.ip,
        userAgent: request?.headers['user-agent'],
      })
      .catch((err) => this.logger.error(`Failed to write audit log: ${err}`));
  }

  async find(query: AuditQuery) {
    const filter: QueryFilter<AuditLogDocument> = {};
    if (query.action) filter.action = query.action;
    if (query.actorId) filter.actorId = new Types.ObjectId(query.actorId);
    if (query.targetUserId)
      filter.targetUserId = new Types.ObjectId(query.targetUserId);

    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);

    const [items, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }
}
