import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { AuditAction, FaqAudience, PublishStatus } from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../common/utils/list-query.util';
import { FaqItem, FaqItemDocument } from '../schemas/faq-item.schema';
import {
  AdminListFaqQueryDto,
  CreateFaqDto,
  UpdateFaqDto,
} from './dto/admin-support.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(FaqItem.name)
    private readonly faqModel: Model<FaqItemDocument>,
    private readonly audit: AuditService,
  ) {}

  /** Public list — published items only, ordered for display. */
  async listPublished(audience?: FaqAudience) {
    const filter: QueryFilter<FaqItemDocument> = {
      publishStatus: PublishStatus.PUBLISHED,
    };
    if (audience && audience !== FaqAudience.ALL) {
      filter.audience = { $in: [FaqAudience.ALL, audience] };
    }

    const items = await this.faqModel
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return items.map((item) => this.toPublic(item));
  }

  async adminList(query: AdminListFaqQueryDto) {
    const filter: QueryFilter<FaqItemDocument> = {
      ...createSearchFilter(query.search, ['question', 'answer']),
    };
    if (query.publishStatus) {
      filter.publishStatus = { $in: query.publishStatus };
    }
    if (query.audience) filter.audience = { $in: query.audience };

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(
      query,
      {
        question: 'question',
        audience: 'audience',
        publishStatus: 'publishStatus',
        order: 'order',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
      { order: 1, createdAt: 1 },
    );
    const [items, total] = await Promise.all([
      this.faqModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.faqModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((item) => this.toPublic(item)),
      total,
      page,
      pageSize,
    );
  }

  async get(id: string) {
    const item = await this.findItem(id);
    return this.toPublic(item.toObject());
  }

  async create(dto: CreateFaqDto, adminId: string, request: Request) {
    const item = await this.faqModel.create({
      question: dto.question,
      answer: dto.answer,
      audience: dto.audience,
      publishStatus: dto.publishStatus,
      order: dto.order,
      updatedBy: new Types.ObjectId(adminId),
    });

    this.audit.log({
      action: AuditAction.SUPPORT_FAQ_CREATED,
      actorId: adminId,
      metadata: { faqId: item._id.toString(), question: item.question },
      request,
    });

    return this.toPublic(item.toObject());
  }

  async update(
    id: string,
    dto: UpdateFaqDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findItem(id);

    if (dto.question !== undefined) item.question = dto.question;
    if (dto.answer !== undefined) item.answer = dto.answer;
    if (dto.audience !== undefined) item.audience = dto.audience;
    if (dto.publishStatus !== undefined) item.publishStatus = dto.publishStatus;
    if (dto.order !== undefined) item.order = dto.order;
    item.updatedBy = new Types.ObjectId(adminId);
    await item.save();

    this.audit.log({
      action: AuditAction.SUPPORT_FAQ_UPDATED,
      actorId: adminId,
      metadata: { faqId: item._id.toString(), question: item.question },
      request,
    });

    return this.toPublic(item.toObject());
  }

  async remove(id: string, adminId: string, request: Request) {
    const item = await this.findItem(id);
    await item.deleteOne();

    this.audit.log({
      action: AuditAction.SUPPORT_FAQ_DELETED,
      actorId: adminId,
      metadata: { faqId: item._id.toString(), question: item.question },
      request,
    });

    return { deleted: true };
  }

  private async findItem(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('FAQ item not found');
    }
    const item = await this.faqModel.findById(id);
    if (!item) throw new NotFoundException('FAQ item not found');
    return item;
  }

  private toPublic(doc: {
    _id: Types.ObjectId;
    question: string;
    answer: string;
    audience: string;
    publishStatus: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      question: doc.question,
      answer: doc.answer,
      audience: doc.audience,
      publishStatus: doc.publishStatus,
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
