import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'node:crypto';
import { Model, Types, type ClientSession, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import { StaffService } from '../staff/staff.service';
import {
  AuditAction,
  CalendarResourceType,
  BookingStatus,
  EntityStatus,
  StaffPermissionKey,
} from '../../common/enums';
import { MongoTransactionService } from '../../common/mongo/mongo-transaction.service';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { Club, ClubDocument } from '../../schemas/club.schema';
import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { ClubClass, ClubClassDocument } from '../../schemas/club-class.schema';
import { ClubSlot, ClubSlotDocument } from '../../schemas/club-slot.schema';
import { ClubSpace, ClubSpaceDocument } from '../../schemas/club-space.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../../schemas/coach-profile.schema';
import {
  ResourceCalendarBlock,
  ResourceCalendarBlockDocument,
} from '../../schemas/resource-calendar-block.schema';
import {
  ListCalendarBlocksQueryDto,
  UpsertCalendarBlockDto,
} from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(ResourceCalendarBlock.name)
    private readonly blockModel: Model<ResourceCalendarBlockDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(ClubClass.name)
    private readonly classModel: Model<ClubClassDocument>,
    @InjectModel(ClubSlot.name)
    private readonly slotModel: Model<ClubSlotDocument>,
    @InjectModel(ClubSpace.name)
    private readonly spaceModel: Model<ClubSpaceDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    private readonly staff: StaffService,
    private readonly audit: AuditService,
    private readonly transactions: MongoTransactionService,
  ) {}

  async upsertForClub(
    actorId: string,
    clubId: string,
    dto: UpsertCalendarBlockDto,
    request?: Request,
  ) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.SESSIONS_MANAGE,
    );
    await this.assertClubResource(clubId, dto.resource.type, dto.resource.id);

    return this.upsert(actorId, dto, request);
  }

  async upsertForCoach(
    coachUserId: string,
    dto: UpsertCalendarBlockDto,
    request?: Request,
  ) {
    if (dto.resource.type !== CalendarResourceType.COACH) {
      throw new BadRequestException('Coaches may only block coach resources');
    }
    if (dto.resource.id !== coachUserId) {
      throw new ForbiddenException('Not your coach calendar');
    }
    return this.upsert(coachUserId, dto, request);
  }

  async listForClub(clubId: string, query: ListCalendarBlocksQueryDto) {
    await this.assertClubExists(clubId);
    const filter = this.buildListFilter(query);

    if (!query.resourceId && !query.resourceType) {
      filter['resource.type'] = CalendarResourceType.CLUB;
      filter['resource.id'] = new Types.ObjectId(clubId);
    } else if (
      query.resourceType === CalendarResourceType.CLUB ||
      query.resourceId === clubId
    ) {
      filter['resource.type'] = CalendarResourceType.CLUB;
      filter['resource.id'] = new Types.ObjectId(clubId);
    } else if (query.resourceId) {
      filter['resource.id'] = new Types.ObjectId(query.resourceId);
      if (query.resourceType) {
        filter['resource.type'] = query.resourceType;
      }
    } else {
      throw new BadRequestException(
        'resourceId is required when filtering non-club resource types',
      );
    }

    return this.list(filter, query);
  }

  async listForCoach(coachUserId: string, query: ListCalendarBlocksQueryDto) {
    const filter = this.buildListFilter(query);
    filter['resource.type'] = CalendarResourceType.COACH;
    filter['resource.id'] = new Types.ObjectId(coachUserId);
    return this.list(filter, query);
  }

  async deleteForClub(
    actorId: string,
    clubId: string,
    blockId: string,
    request?: Request,
  ) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.SESSIONS_MANAGE,
    );
    const block = await this.findOrFail(blockId);
    await this.assertClubResource(
      clubId,
      block.resource.type,
      block.resource.id.toString(),
    );
    return this.softDelete(actorId, block, request);
  }

  async deleteForCoach(
    coachUserId: string,
    blockId: string,
    request?: Request,
  ) {
    const block = await this.findOrFail(blockId);
    if (
      block.resource.type !== CalendarResourceType.COACH ||
      block.resource.id.toString() !== coachUserId
    ) {
      throw new ForbiddenException('Not your calendar block');
    }
    return this.softDelete(coachUserId, block, request);
  }

  private async upsert(
    actorId: string,
    dto: UpsertCalendarBlockDto,
    request?: Request,
  ) {
    const from = new Date(dto.window.from);
    const to = new Date(dto.window.to);
    if (!(from.getTime() < to.getTime())) {
      throw new BadRequestException('window.from must be before window.to');
    }

    const fingerprint =
      dto.clientMutationId && !dto.id ? this.blockFingerprint(dto) : undefined;
    if (fingerprint && dto.clientMutationId) {
      const replay = await this.findMutationReplay(
        actorId,
        dto.clientMutationId,
      );
      if (replay) {
        this.assertMutationFingerprint(replay, fingerprint);
        return this.toPublic(replay);
      }
    }

    let block: ResourceCalendarBlockDocument;
    let idempotent = false;
    try {
      block = await this.transactions.run(async (session) => {
        await this.lockResource(dto.resource.type, dto.resource.id, session);
        if (fingerprint && dto.clientMutationId) {
          const replay = await this.findMutationReplay(
            actorId,
            dto.clientMutationId,
            session,
          );
          if (replay) {
            this.assertMutationFingerprint(replay, fingerprint);
            idempotent = true;
            return replay;
          }
        }

        let current: ResourceCalendarBlockDocument | null = null;
        if (dto.id) {
          if (!Types.ObjectId.isValid(dto.id)) {
            throw new NotFoundException('Calendar block not found');
          }
          current = await this.blockModel.findById(dto.id).session(session);
          if (!current) throw new NotFoundException('Calendar block not found');
          if (
            current.resource.type !== dto.resource.type ||
            current.resource.id.toString() !== dto.resource.id
          ) {
            throw new BadRequestException(
              'Cannot change block resource on upsert',
            );
          }
        }

        const effectiveStatus =
          dto.status ?? current?.status ?? EntityStatus.ACTIVE;
        if (effectiveStatus === EntityStatus.ACTIVE) {
          await this.assertNoActiveBooking(
            dto.resource.type,
            dto.resource.id,
            from,
            to,
            session,
          );
        }

        if (current) {
          current.reason = dto.reason;
          current.window = { from, to };
          if (dto.note !== undefined) current.note = dto.note;
          if (dto.status !== undefined) current.status = dto.status;
          await current.save({ session });
          return current;
        }

        const created = new this.blockModel({
          resource: {
            type: dto.resource.type,
            id: new Types.ObjectId(dto.resource.id),
          },
          reason: dto.reason,
          window: { from, to },
          note: dto.note,
          createdBy: new Types.ObjectId(actorId),
          clientMutationId: dto.clientMutationId,
          mutationFingerprint: fingerprint,
          status: dto.status ?? EntityStatus.ACTIVE,
        });
        await created.save({ session });
        return created;
      });
    } catch (error: unknown) {
      if (
        !fingerprint ||
        !dto.clientMutationId ||
        !this.isDuplicateKey(error)
      ) {
        throw error;
      }
      const winner = await this.findMutationReplay(
        actorId,
        dto.clientMutationId,
      );
      if (!winner) throw error;
      this.assertMutationFingerprint(winner, fingerprint);
      block = winner;
      idempotent = true;
    }

    if (!idempotent) {
      this.audit.log({
        action: AuditAction.CALENDAR_BLOCK_UPSERTED,
        actorId,
        metadata: {
          blockId: block._id.toString(),
          resourceType: dto.resource.type,
          resourceId: dto.resource.id,
          reason: dto.reason,
        },
        request,
      });
    }

    return this.toPublic(block);
  }

  private blockFingerprint(dto: UpsertCalendarBlockDto) {
    return createHash('sha256')
      .update(
        JSON.stringify({
          resource: dto.resource,
          reason: dto.reason,
          window: dto.window,
          note: dto.note?.trim() ?? null,
          status: dto.status ?? EntityStatus.ACTIVE,
        }),
      )
      .digest('hex');
  }

  private findMutationReplay(
    actorId: string,
    clientMutationId: string,
    session?: ClientSession,
  ) {
    return this.blockModel
      .findOne({
        createdBy: new Types.ObjectId(actorId),
        clientMutationId,
      })
      .session(session ?? null);
  }

  private assertMutationFingerprint(
    block: ResourceCalendarBlockDocument,
    fingerprint: string,
  ) {
    if (block.mutationFingerprint !== fingerprint) {
      throw new BadRequestException('clientMutationId payload mismatch');
    }
  }

  private isDuplicateKey(error: unknown): error is { code: 11000 } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private async softDelete(
    actorId: string,
    block: ResourceCalendarBlockDocument,
    request?: Request,
  ) {
    block.status = EntityStatus.ARCHIVED;
    await block.save();

    this.audit.log({
      action: AuditAction.CALENDAR_BLOCK_UPSERTED,
      actorId,
      metadata: {
        blockId: block._id.toString(),
        archived: true,
      },
      request,
    });

    return this.toPublic(block);
  }

  private async list(
    filter: QueryFilter<ResourceCalendarBlockDocument>,
    query: ListCalendarBlocksQueryDto,
  ) {
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.blockModel
        .find(filter)
        .sort({ 'window.from': 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.blockModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((row) => this.toPublic(row)),
      total,
      page,
      pageSize,
    );
  }

  private buildListFilter(
    query: ListCalendarBlocksQueryDto,
  ): QueryFilter<ResourceCalendarBlockDocument> {
    const filter: QueryFilter<ResourceCalendarBlockDocument> = {
      status: query.status ?? EntityStatus.ACTIVE,
    };
    if (query.resourceType) filter['resource.type'] = query.resourceType;
    if (query.resourceId) {
      filter['resource.id'] = new Types.ObjectId(query.resourceId);
    }
    if (query.from || query.to) {
      // Overlap: block.from < range.to AND block.to > range.from
      if (query.from && query.to) {
        filter['window.from'] = { $lt: new Date(query.to) };
        filter['window.to'] = { $gt: new Date(query.from) };
      } else if (query.from) {
        filter['window.to'] = { $gt: new Date(query.from) };
      } else if (query.to) {
        filter['window.from'] = { $lt: new Date(query.to) };
      }
    }
    return filter;
  }

  private async lockResource(
    type: CalendarResourceType,
    resourceId: string,
    session: ClientSession,
  ): Promise<void> {
    const id = new Types.ObjectId(resourceId);
    const options = { session };
    let matchedCount = 0;
    switch (type) {
      case CalendarResourceType.CLUB:
        matchedCount = (
          await this.clubModel.updateOne(
            { _id: id },
            { $inc: { calendarRevision: 1 } },
            options,
          )
        ).matchedCount;
        break;
      case CalendarResourceType.CLASS:
        matchedCount = (
          await this.classModel.updateOne(
            { _id: id },
            { $inc: { calendarRevision: 1 } },
            options,
          )
        ).matchedCount;
        break;
      case CalendarResourceType.SLOT:
        matchedCount = (
          await this.slotModel.updateOne(
            { _id: id },
            { $inc: { calendarRevision: 1 } },
            options,
          )
        ).matchedCount;
        break;
      case CalendarResourceType.SPACE:
        matchedCount = (
          await this.spaceModel.updateOne(
            { _id: id },
            { $inc: { calendarRevision: 1 } },
            options,
          )
        ).matchedCount;
        break;
      case CalendarResourceType.COACH:
        matchedCount = (
          await this.coachModel.updateOne(
            { userId: id },
            { $inc: { calendarRevision: 1 } },
            options,
          )
        ).matchedCount;
        break;
    }
    if (matchedCount !== 1) {
      throw new NotFoundException('Calendar resource not found');
    }
  }

  private async assertNoActiveBooking(
    type: CalendarResourceType,
    resourceId: string,
    from: Date,
    to: Date,
    session: ClientSession,
  ): Promise<void> {
    const id = new Types.ObjectId(resourceId);
    const identity: Record<CalendarResourceType, Record<string, unknown>> = {
      [CalendarResourceType.CLUB]: { clubId: id },
      [CalendarResourceType.CLASS]: { classId: id },
      [CalendarResourceType.SLOT]: { 'resource.refId': id },
      [CalendarResourceType.SPACE]: { spaceId: id },
      [CalendarResourceType.COACH]: { coachUserId: id },
    };
    const booking = await this.bookingModel
      .findOne({
        ...identity[type],
        status: {
          $in: [
            BookingStatus.PENDING,
            BookingStatus.AWAITING_PAYMENT,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ],
        },
        $or: [
          {
            calendarStartsAt: { $lt: to },
            calendarEndsAt: { $gt: from },
          },
          {
            calendarStartsAt: { $exists: false },
            startsAt: { $lt: to },
            endsAt: { $gt: from },
          },
        ],
      })
      .select({ _id: 1 })
      .session(session);
    if (booking) {
      throw new BadRequestException(
        'Calendar block overlaps an active booking',
      );
    }
  }

  private async assertClubExists(clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(clubId).select('_id');
    if (!club) throw new NotFoundException('Club not found');
  }

  private async assertClubResource(
    clubId: string,
    type: CalendarResourceType,
    resourceId: string,
  ) {
    if (type === CalendarResourceType.COACH) {
      throw new BadRequestException(
        'Use coach calendar endpoints for coach blocks',
      );
    }
    if (!Types.ObjectId.isValid(resourceId)) {
      throw new NotFoundException('Calendar resource not found');
    }
    const clubOid = new Types.ObjectId(clubId);
    const resourceOid = new Types.ObjectId(resourceId);
    if (type === CalendarResourceType.CLUB) {
      if (resourceId !== clubId) {
        throw new ForbiddenException('Club resource id must match path clubId');
      }
      await this.assertClubExists(clubId);
      return;
    }
    const exists =
      type === CalendarResourceType.CLASS
        ? await this.classModel.exists({ _id: resourceOid, clubId: clubOid })
        : type === CalendarResourceType.SPACE
          ? await this.spaceModel.exists({ _id: resourceOid, clubId: clubOid })
          : await this.slotModel.exists({ _id: resourceOid, clubId: clubOid });
    if (!exists) throw new NotFoundException('Calendar resource not found');
  }

  private async findOrFail(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Calendar block not found');
    }
    const block = await this.blockModel.findById(id);
    if (!block) throw new NotFoundException('Calendar block not found');
    return block;
  }

  toPublic(doc: ResourceCalendarBlockDocument | Record<string, unknown>) {
    const row = doc as ResourceCalendarBlockDocument;
    return {
      id: row._id.toString(),
      resource: {
        type: row.resource.type,
        id: row.resource.id.toString(),
      },
      reason: row.reason,
      window: {
        from: row.window.from,
        to: row.window.to,
      },
      note: row.note ?? null,
      createdBy: row.createdBy.toString(),
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
