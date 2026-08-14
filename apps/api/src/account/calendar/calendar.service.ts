import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import { StaffService } from '../staff/staff.service';
import {
  AuditAction,
  CalendarResourceType,
  EntityStatus,
  StaffPermissionKey,
} from '../../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { Club, ClubDocument } from '../../schemas/club.schema';
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
    private readonly staff: StaffService,
    private readonly audit: AuditService,
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

    let block: ResourceCalendarBlockDocument | null = null;
    if (dto.id) {
      block = await this.findOrFail(dto.id);
      if (
        block.resource.type !== dto.resource.type ||
        block.resource.id.toString() !== dto.resource.id
      ) {
        throw new BadRequestException('Cannot change block resource on upsert');
      }
      block.reason = dto.reason;
      block.window = { from, to };
      if (dto.note !== undefined) block.note = dto.note;
      if (dto.status !== undefined) block.status = dto.status;
      await block.save();
    } else {
      block = await this.blockModel.create({
        resource: {
          type: dto.resource.type,
          id: new Types.ObjectId(dto.resource.id),
        },
        reason: dto.reason,
        window: { from, to },
        note: dto.note,
        createdBy: new Types.ObjectId(actorId),
        status: dto.status ?? EntityStatus.ACTIVE,
      });
    }

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

    return this.toPublic(block);
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
    if (type === CalendarResourceType.CLUB && resourceId !== clubId) {
      throw new ForbiddenException('Club resource id must match path clubId');
    }
    await this.assertClubExists(clubId);
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
