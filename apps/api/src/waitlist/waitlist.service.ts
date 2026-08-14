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
import { AuditService } from '../audit/audit.service';
import { StaffService } from '../account/staff/staff.service';
import {
  AuditAction,
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

    let waitlist = await this.waitlistModel.findOne(filter);

    if (!waitlist) {
      waitlist = await this.waitlistModel.create({
        resource: { type: dto.resource.type, id: resourceId },
        clubId: clubOid,
        occurrenceDate: dto.occurrenceDate,
        entries: [],
      });
    }

    const active = waitlist.entries.filter(
      (e) =>
        e.status === WaitlistEntryStatus.WAITING ||
        e.status === WaitlistEntryStatus.OFFERED,
    );
    if (active.some((e) => e.userId.toString() === userId)) {
      throw new ConflictException('Already on this waitlist');
    }
    if (active.length >= MAX_ENTRIES) {
      throw new BadRequestException('Waitlist is full');
    }

    const priority =
      active.reduce((max, e) => Math.max(max, e.priority), 0) + 1;
    waitlist.entries.push({
      userId: new Types.ObjectId(userId),
      priority,
      status: WaitlistEntryStatus.WAITING,
      joinedAt: new Date(),
    } as WaitlistEntry);
    await waitlist.save();

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
    const waitlist = await this.findOrFail(waitlistId);
    const entry = waitlist.entries.find(
      (e) =>
        e.userId.toString() === userId &&
        (e.status === WaitlistEntryStatus.WAITING ||
          e.status === WaitlistEntryStatus.OFFERED),
    );
    if (!entry) {
      throw new NotFoundException('Active waitlist entry not found');
    }
    entry.status = WaitlistEntryStatus.CANCELLED;
    await waitlist.save();

    this.audit.log({
      action: AuditAction.WAITLIST_JOINED,
      actorId: userId,
      metadata: {
        waitlistId,
        entryId: entry._id?.toString(),
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

    const waitlist = await this.findOrFail(waitlistId);
    if (waitlist.clubId?.toString() !== clubId) {
      throw new ForbiddenException('Waitlist does not belong to this club');
    }

    const ttl = dto.offerTtlSeconds ?? DEFAULT_OFFER_TTL_SECONDS;
    const count = dto.count ?? 1;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const waiting = waitlist.entries
      .filter((e) => e.status === WaitlistEntryStatus.WAITING)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, count);

    if (waiting.length === 0) {
      throw new NotFoundException('No waiting entries to offer');
    }

    for (const entry of waiting) {
      entry.status = WaitlistEntryStatus.OFFERED;
      entry.offeredAt = now;
      entry.offerExpiresAt = expiresAt;
    }
    await waitlist.save();

    this.audit.log({
      action: AuditAction.WAITLIST_OFFERED,
      actorId,
      metadata: {
        clubId,
        waitlistId,
        entryIds: waiting.map((e) => e._id?.toString()),
        offerExpiresAt: expiresAt.toISOString(),
      },
      request,
    });

    return this.toPublic(waitlist);
  }

  async claim(
    userId: string,
    waitlistId: string,
    dto: ClaimWaitlistDto,
    request?: Request,
  ) {
    const waitlist = await this.findOrFail(waitlistId);
    const entry = waitlist.entries.find(
      (e) => e._id.toString() === dto.entryId,
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
    if (entry.offerExpiresAt && entry.offerExpiresAt.getTime() < Date.now()) {
      entry.status = WaitlistEntryStatus.EXPIRED;
      await waitlist.save();
      throw new ConflictException('Offer has expired');
    }

    entry.status = WaitlistEntryStatus.CLAIMED;
    await waitlist.save();

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

    const lists = await this.waitlistModel.find({
      ...filter,
      'entries.status': WaitlistEntryStatus.OFFERED,
    });

    const now = Date.now();
    let expired = 0;
    for (const list of lists) {
      let dirty = false;
      for (const entry of list.entries) {
        if (
          entry.status === WaitlistEntryStatus.OFFERED &&
          entry.offerExpiresAt &&
          entry.offerExpiresAt.getTime() < now
        ) {
          entry.status = WaitlistEntryStatus.EXPIRED;
          dirty = true;
          expired += 1;
        }
      }
      if (dirty) await list.save();
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

  private async findOrFail(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Waitlist not found');
    }
    const waitlist = await this.waitlistModel.findById(id);
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
