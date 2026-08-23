import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { MongoTransactionService } from '../common/mongo/mongo-transaction.service';
import { AuditService } from '../audit/audit.service';
import { StaffService } from '../account/staff/staff.service';
import {
  AuditAction,
  NotificationTemplateKey,
  StaffPermissionKey,
  WaitlistEntryStatus,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  Waitlist,
  WaitlistDocument,
  WaitlistEntry,
} from '../schemas/waitlist.schema';
import { OutboxService } from '../outbox/outbox.service';
import {
  ClaimWaitlistDto,
  JoinWaitlistDto,
  ListWaitlistQueryDto,
  OfferWaitlistDto,
} from './dto/waitlist.dto';

const MAX_ENTRIES = 50;
const DEFAULT_OFFER_TTL_SECONDS = 900;

@Injectable()
export class WaitlistService {
  constructor(
    @InjectModel(Waitlist.name)
    private readonly waitlistModel: Model<WaitlistDocument>,
    private readonly staff: StaffService,
    private readonly audit: AuditService,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
  ) {}

  async join(userId: string, dto: JoinWaitlistDto, request?: Request) {
    const resourceId = new Types.ObjectId(dto.resource.id);
    const clubOid = dto.clubId ? new Types.ObjectId(dto.clubId) : undefined;

    const filter: QueryFilter<WaitlistDocument> = {
      'resource.type': dto.resource.type,
      'resource.id': resourceId,
      $and: [
        clubOid
          ? { clubId: clubOid }
          : {
              $or: [{ clubId: null }, { clubId: { $exists: false } }],
            },
        dto.occurrenceDate
          ? { occurrenceDate: dto.occurrenceDate }
          : {
              $or: [
                { occurrenceDate: null },
                { occurrenceDate: { $exists: false } },
              ],
            },
      ],
    };

    const base = await this.findOrCreate(filter, {
      resource: { type: dto.resource.type, id: resourceId },
      clubId: clubOid,
      occurrenceDate: dto.occurrenceDate,
      entries: [],
    });
    const waitlist = await this.transactions.run(async (session) => {
      const current = await this.waitlistModel
        .findById(base._id)
        .session(session);
      if (!current) throw new NotFoundException('Waitlist not found');
      this.expireEntries(current, new Date());
      const active = this.activeEntries(current);
      if (active.some((e) => e.userId.toString() === userId)) {
        throw new ConflictException('Already on this waitlist');
      }
      if (active.length >= MAX_ENTRIES) {
        throw new BadRequestException('Waitlist is full');
      }

      const priority =
        current.entries.reduce((max, e) => Math.max(max, e.priority), 0) + 1;
      current.entries.push({
        userId: new Types.ObjectId(userId),
        priority,
        status: WaitlistEntryStatus.WAITING,
        joinedAt: new Date(),
      } as WaitlistEntry);
      await current.save({ session });
      return current;
    });

    this.audit.log({
      action: AuditAction.WAITLIST_JOINED,
      actorId: userId,
      metadata: {
        waitlistId: waitlist._id.toString(),
        resourceType: dto.resource.type,
        resourceId: dto.resource.id,
        occurrenceDate: dto.occurrenceDate,
      },
      request,
    });

    return this.toPublic(waitlist, userId);
  }

  async leave(userId: string, waitlistId: string, request?: Request) {
    const result = await this.transactions.run(async (session) => {
      const current = await this.findOrFail(waitlistId, session);
      this.expireEntries(current, new Date());
      const entry = current.entries.find(
        (candidate) =>
          candidate.userId.toString() === userId &&
          (candidate.status === WaitlistEntryStatus.WAITING ||
            candidate.status === WaitlistEntryStatus.OFFERED),
      );
      if (!entry) {
        throw new NotFoundException('Active waitlist entry not found');
      }
      entry.status = WaitlistEntryStatus.CANCELLED;
      await current.save({ session });
      return { waitlist: current, entryId: entry._id?.toString() };
    });
    const waitlist = result.waitlist;

    this.audit.log({
      action: AuditAction.WAITLIST_JOINED,
      actorId: userId,
      metadata: {
        waitlistId,
        entryId: result.entryId,
        left: true,
      },
      request,
    });

    return this.toPublic(waitlist, userId);
  }

  async offer(
    actorId: string,
    clubId: string,
    waitlistId: string,
    dto: OfferWaitlistDto,
    request?: Request,
  ) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.BOOKINGS_CREATE,
    );

    const ttl = dto.offerTtlSeconds ?? DEFAULT_OFFER_TTL_SECONDS;
    const count = dto.count ?? 1;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);
    const result = await this.transactions.run(async (session) => {
      const waitlist = await this.findOrFail(waitlistId, session);
      if (waitlist.clubId?.toString() !== clubId) {
        throw new ForbiddenException('Waitlist does not belong to this club');
      }
      this.expireEntries(waitlist, now);
      if (
        waitlist.entries.some(
          (entry) => entry.status === WaitlistEntryStatus.OFFERED,
        )
      ) {
        throw new ConflictException(
          'An active waitlist offer already exists for this resource',
        );
      }

      const waiting = waitlist.entries
        .filter((entry) => entry.status === WaitlistEntryStatus.WAITING)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, count);
      if (waiting.length === 0) {
        throw new NotFoundException('No waiting entries to offer');
      }
      for (const entry of waiting) {
        entry.status = WaitlistEntryStatus.OFFERED;
        entry.offeredAt = now;
        entry.offerExpiresAt = expiresAt;
        await this.outbox.enqueue(
          {
            eventName: 'waitlist.offer_created',
            payload: {
              waitlistId,
              entryId: entry._id.toString(),
              userId: entry.userId.toString(),
              notification: {
                userId: entry.userId.toString(),
                templateKey: NotificationTemplateKey.WAITLIST_OFFER,
                params: {
                  subject: `${waitlist.resource.type}:${waitlist.resource.id.toString()}`,
                  deadline: expiresAt.toISOString(),
                },
                payload: {
                  waitlistId,
                  entryId: entry._id.toString(),
                  action: 'claim_waitlist_offer',
                },
                critical: true,
              },
            },
            idempotencyKey: `outbox:waitlist.offer:${entry._id.toString()}`,
          },
          session,
        );
      }
      await waitlist.save({ session });
      return {
        waitlist,
        entryIds: waiting.map((entry) => entry._id?.toString()),
      };
    });

    this.audit.log({
      action: AuditAction.WAITLIST_OFFERED,
      actorId,
      metadata: {
        clubId,
        waitlistId,
        entryIds: result.entryIds,
        offerExpiresAt: expiresAt.toISOString(),
      },
      request,
    });

    return this.toPublic(result.waitlist);
  }

  async claim(
    userId: string,
    waitlistId: string,
    dto: ClaimWaitlistDto,
    request?: Request,
  ) {
    const result = await this.transactions.run(async (session) => {
      const current = await this.findOrFail(waitlistId, session);
      const entry = current.entries.find(
        (candidate) => candidate._id.toString() === dto.entryId,
      );
      if (!entry) throw new NotFoundException('Waitlist entry not found');
      if (entry.userId.toString() !== userId) {
        throw new ForbiddenException('Not your waitlist entry');
      }
      if (entry.status !== WaitlistEntryStatus.OFFERED) {
        throw new ConflictException(
          `Cannot claim entry in status "${entry.status}"`,
        );
      }
      if (
        !entry.offerExpiresAt ||
        entry.offerExpiresAt.getTime() <= Date.now()
      ) {
        entry.status = WaitlistEntryStatus.EXPIRED;
        await current.save({ session });
        return { waitlist: current, expired: true };
      }

      entry.status = WaitlistEntryStatus.CLAIMED;
      await current.save({ session });
      return { waitlist: current, expired: false };
    });
    if (result.expired) throw new ConflictException('Offer has expired');
    const waitlist = result.waitlist;

    this.audit.log({
      action: AuditAction.WAITLIST_CLAIMED,
      actorId: userId,
      metadata: {
        waitlistId,
        entryId: dto.entryId,
      },
      request,
    });

    return this.toPublic(waitlist, userId);
  }

  /**
   * Cron-less: mark offered entries past `offerExpiresAt` as expired.
   * Callable by ops / scheduled jobs.
   */
  async expireOffers(clubId?: string) {
    const filter: QueryFilter<WaitlistDocument> = {};
    if (clubId) filter.clubId = new Types.ObjectId(clubId);

    const lists = await this.waitlistModel
      .find({
        ...filter,
        'entries.status': WaitlistEntryStatus.OFFERED,
      })
      .select({ _id: 1 });

    const now = new Date();
    let expired = 0;
    for (const list of lists) {
      expired += await this.transactions.run(async (session) => {
        const current = await this.waitlistModel
          .findById(list._id)
          .session(session);
        if (!current) return 0;
        const changed = this.expireEntries(current, now);
        if (changed > 0) await current.save({ session });
        return changed;
      });
    }

    return { expired };
  }

  async listForClub(clubId: string, query: ListWaitlistQueryDto) {
    const filter: QueryFilter<WaitlistDocument> = {
      clubId: new Types.ObjectId(clubId),
    };
    if (query.resourceType) filter['resource.type'] = query.resourceType;
    if (query.resourceId) {
      filter['resource.id'] = new Types.ObjectId(query.resourceId);
    }
    if (query.occurrenceDate) filter.occurrenceDate = query.occurrenceDate;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.waitlistModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.waitlistModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((row) => this.toPublic(row)),
      total,
      page,
      pageSize,
    );
  }

  async listMine(userId: string, query: ListWaitlistQueryDto) {
    const filter: QueryFilter<WaitlistDocument> = {
      'entries.userId': new Types.ObjectId(userId),
    };
    if (query.resourceType) filter['resource.type'] = query.resourceType;
    if (query.resourceId) {
      filter['resource.id'] = new Types.ObjectId(query.resourceId);
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.waitlistModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.waitlistModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((row) => this.toPublic(row, userId)),
      total,
      page,
      pageSize,
    );
  }

  private async findOrCreate(
    filter: QueryFilter<WaitlistDocument>,
    input: {
      resource: Waitlist['resource'];
      clubId?: Types.ObjectId;
      occurrenceDate?: string;
      entries: WaitlistEntry[];
    },
  ): Promise<WaitlistDocument> {
    const existing = await this.waitlistModel.findOne(filter);
    if (existing) return existing;
    try {
      return await this.waitlistModel.create(input);
    } catch (error: unknown) {
      if ((error as { code?: number }).code !== 11000) throw error;
      const winner = await this.waitlistModel.findOne(filter);
      if (!winner) throw error;
      return winner;
    }
  }

  private activeEntries(waitlist: WaitlistDocument): WaitlistEntry[] {
    return waitlist.entries.filter(
      (entry) =>
        entry.status === WaitlistEntryStatus.WAITING ||
        entry.status === WaitlistEntryStatus.OFFERED,
    );
  }

  private expireEntries(waitlist: WaitlistDocument, now: Date): number {
    let expired = 0;
    for (const entry of waitlist.entries) {
      if (
        entry.status === WaitlistEntryStatus.OFFERED &&
        entry.offerExpiresAt &&
        entry.offerExpiresAt.getTime() <= now.getTime()
      ) {
        entry.status = WaitlistEntryStatus.EXPIRED;
        expired += 1;
      }
    }
    return expired;
  }

  private async findOrFail(
    id: string,
    session?: import('mongoose').ClientSession,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Waitlist not found');
    }
    const query = this.waitlistModel.findById(id);
    const waitlist = session ? await query.session(session) : await query;
    if (!waitlist) throw new NotFoundException('Waitlist not found');
    return waitlist;
  }

  toPublic(
    doc: WaitlistDocument | Record<string, unknown>,
    forUserId?: string,
  ) {
    const row = doc as WaitlistDocument;
    const entries = (row.entries ?? []).map((e) => ({
      id: e._id.toString(),
      userId: e.userId.toString(),
      priority: e.priority,
      status: e.status,
      offeredAt: e.offeredAt ?? null,
      offerExpiresAt: e.offerExpiresAt ?? null,
      joinedAt: e.joinedAt,
    }));

    return {
      id: row._id.toString(),
      resource: {
        type: row.resource.type,
        id: row.resource.id.toString(),
      },
      clubId: row.clubId?.toString() ?? null,
      occurrenceDate: row.occurrenceDate ?? null,
      entries: forUserId
        ? entries.filter((e) => e.userId === forUserId)
        : entries,
      entryCount: entries.filter(
        (e) =>
          e.status === WaitlistEntryStatus.WAITING ||
          e.status === WaitlistEntryStatus.OFFERED,
      ).length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
