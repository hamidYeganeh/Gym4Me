import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  OwnerTaskPriority,
  OwnerTaskStatus,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { Club, ClubDocument } from '../schemas/club.schema';
import { OwnerTask, OwnerTaskDocument } from '../schemas/owner-task.schema';
import {
  CreateOwnerTaskDto,
  ListOwnerTasksQueryDto,
  UpdateOwnerTaskStatusDto,
} from './dto/ops.dto';

@Injectable()
export class OpsService {
  constructor(
    @InjectModel(OwnerTask.name)
    private readonly taskModel: Model<OwnerTaskDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly audit: AuditService,
  ) {}

  async requireOwnedClub(ownerId: string, clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(new Types.ObjectId(clubId));
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  async listTasks(clubId: string, query: ListOwnerTasksQueryDto) {
    const filter: QueryFilter<OwnerTaskDocument> = {
      clubId: new Types.ObjectId(clubId),
    };
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ priority: -1, updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.taskModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toTask(item)),
      total,
      page,
      pageSize,
    );
  }

  async tasksSummary(clubId: string) {
    const openCount = await this.taskModel.countDocuments({
      clubId: new Types.ObjectId(clubId),
      status: {
        $in: [OwnerTaskStatus.OPEN, OwnerTaskStatus.IN_PROGRESS],
      },
    });
    return { openCount };
  }

  async createTask(
    clubId: string,
    ownerId: string,
    dto: CreateOwnerTaskDto,
    request?: Request,
  ) {
    const item = await this.taskModel.create({
      clubId: new Types.ObjectId(clubId),
      title: dto.title.trim(),
      body: dto.body?.trim(),
      status: OwnerTaskStatus.OPEN,
      priority: dto.priority ?? OwnerTaskPriority.NORMAL,
      assigneeUserId: dto.assigneeUserId
        ? new Types.ObjectId(dto.assigneeUserId)
        : undefined,
      createdByUserId: new Types.ObjectId(ownerId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      related: {
        membershipId: dto.related?.membershipId
          ? new Types.ObjectId(dto.related.membershipId)
          : undefined,
        debtId: dto.related?.debtId
          ? new Types.ObjectId(dto.related.debtId)
          : undefined,
        bookingId: dto.related?.bookingId
          ? new Types.ObjectId(dto.related.bookingId)
          : undefined,
        staffId: dto.related?.staffId
          ? new Types.ObjectId(dto.related.staffId)
          : undefined,
      },
    });

    this.audit.log({
      action: AuditAction.OWNER_TASK_UPSERTED,
      actorId: ownerId,
      metadata: {
        taskId: item._id.toString(),
        clubId,
        op: 'create',
      },
      request,
    });

    return this.toTask(item.toObject());
  }

  async updateTaskStatus(
    clubId: string,
    taskId: string,
    ownerId: string,
    dto: UpdateOwnerTaskStatusDto,
    request?: Request,
  ) {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new NotFoundException('Task not found');
    }
    const item = await this.taskModel.findOne({
      _id: new Types.ObjectId(taskId),
      clubId: new Types.ObjectId(clubId),
    });
    if (!item) throw new NotFoundException('Task not found');

    item.status = dto.status;
    await item.save();

    this.audit.log({
      action: AuditAction.OWNER_TASK_UPSERTED,
      actorId: ownerId,
      metadata: {
        taskId,
        clubId,
        op: 'status',
        status: dto.status,
      },
      request,
    });

    return this.toTask(item.toObject());
  }

  private toTask(doc: {
    _id: Types.ObjectId;
    clubId: Types.ObjectId;
    title: string;
    body?: string;
    status: OwnerTaskStatus;
    priority: OwnerTaskPriority;
    assigneeUserId?: Types.ObjectId;
    createdByUserId: Types.ObjectId;
    dueAt?: Date;
    related?: {
      membershipId?: Types.ObjectId;
      debtId?: Types.ObjectId;
      bookingId?: Types.ObjectId;
      staffId?: Types.ObjectId;
    };
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      clubId: doc.clubId.toString(),
      title: doc.title,
      body: doc.body ?? null,
      status: doc.status,
      priority: doc.priority,
      assigneeUserId: doc.assigneeUserId?.toString() ?? null,
      createdByUserId: doc.createdByUserId.toString(),
      dueAt: doc.dueAt?.toISOString() ?? null,
      related: {
        membershipId: doc.related?.membershipId?.toString() ?? null,
        debtId: doc.related?.debtId?.toString() ?? null,
        bookingId: doc.related?.bookingId?.toString() ?? null,
        staffId: doc.related?.staffId?.toString() ?? null,
      },
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
