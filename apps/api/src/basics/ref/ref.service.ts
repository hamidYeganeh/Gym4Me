import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, RefStatus, RefType } from '../../common/enums';
import { asSinglePageResult } from '../../common/utils/pagination.util';
import { slugify } from '../../common/utils/slug.util';
import { MediaService } from '../../media/media.service';
import { RefItem, RefItemDocument } from '../../schemas/ref-item.schema';
import { CreateRefItemDto, UpdateRefItemDto } from './dto/ref.dto';

const REF_TYPES = new Set<string>(Object.values(RefType));

@Injectable()
export class RefService {
  constructor(
    @InjectModel(RefItem.name)
    private readonly refModel: Model<RefItemDocument>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}

  parseType(type: string): RefType {
    if (!REF_TYPES.has(type)) {
      throw new NotFoundException(`Unknown ref type: ${type}`);
    }
    return type as RefType;
  }

  async list(type: RefType, admin = false) {
    const filter: Record<string, unknown> = { type };
    if (!admin) {
      filter.isActive = true;
      filter.status = RefStatus.APPROVED;
    }

    const items = await this.refModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .lean();
    return { type, ...asSinglePageResult(items.map((i) => this.toPublic(i))) };
  }

  async getById(type: RefType, id: string, admin = false) {
    const item = await this.findOrFail(id);
    if (item.type !== type) throw new NotFoundException('Ref item not found');
    if (!admin && (!item.isActive || item.status !== RefStatus.APPROVED)) {
      throw new NotFoundException('Ref item not found');
    }
    return this.toPublic(item);
  }

  async create(
    type: RefType,
    dto: CreateRefItemDto,
    adminId: string,
    request: Request,
  ) {
    await this.media.assertExists(dto.coverMediaId);
    const slug = await this.uniqueSlug(type, dto.slug || slugify(dto.name));

    const item = await this.refModel.create({
      type,
      name: dto.name,
      slug,
      description: dto.description,
      icon: dto.icon,
      coverMediaId: dto.coverMediaId
        ? new Types.ObjectId(dto.coverMediaId)
        : undefined,
      order: dto.order ?? 0,
      status: dto.status ?? RefStatus.APPROVED,
      isActive: dto.isActive ?? true,
    });

    this.audit.log({
      action: AuditAction.REF_CREATED,
      actorId: adminId,
      metadata: { id: item._id.toString(), type, slug },
      request,
    });

    return this.toPublic(item);
  }

  async update(
    type: RefType,
    id: string,
    dto: UpdateRefItemDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findOrFail(id);
    if (item.type !== type) throw new NotFoundException('Ref item not found');

    if (dto.coverMediaId !== undefined && dto.coverMediaId !== null) {
      await this.media.assertExists(dto.coverMediaId);
    }

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.order !== undefined) item.order = dto.order;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;

    if (dto.icon === null) item.icon = undefined;
    else if (dto.icon !== undefined) item.icon = dto.icon;

    if (dto.coverMediaId === null) item.coverMediaId = undefined;
    else if (dto.coverMediaId) {
      item.coverMediaId = new Types.ObjectId(dto.coverMediaId);
    }

    if (dto.slug !== undefined && dto.slug !== item.slug) {
      item.slug = await this.uniqueSlug(type, dto.slug, id);
    }

    await item.save();

    this.audit.log({
      action: AuditAction.REF_UPDATED,
      actorId: adminId,
      metadata: { id, type },
      request,
    });

    return this.toPublic(item);
  }

  async remove(
    type: RefType,
    id: string,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findOrFail(id);
    if (item.type !== type) throw new NotFoundException('Ref item not found');

    await item.deleteOne();

    this.audit.log({
      action: AuditAction.REF_DELETED,
      actorId: adminId,
      metadata: { id, type, slug: item.slug },
      request,
    });

    return { success: true };
  }

  async upsertSeed(type: RefType, dto: CreateRefItemDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await this.refModel.findOne({ type, slug });
    if (existing) return existing;
    return this.refModel.create({
      type,
      name: dto.name,
      slug,
      description: dto.description,
      icon: dto.icon,
      order: dto.order ?? 0,
      status: RefStatus.APPROVED,
      isActive: true,
    });
  }

  private async uniqueSlug(
    type: RefType,
    base: string,
    excludeId?: string,
  ): Promise<string> {
    const slug = slugify(base) || 'item';
    if (!slug) throw new BadRequestException('Invalid slug');
    let candidate = slug;
    let i = 1;
    while (true) {
      const existing = await this.refModel.findOne({
        type,
        slug: candidate,
        ...(excludeId ? { _id: { $ne: new Types.ObjectId(excludeId) } } : {}),
      });
      if (!existing) return candidate;
      candidate = `${slug}-${++i}`;
      if (i > 50) throw new ConflictException('Could not allocate unique slug');
    }
  }

  private async findOrFail(id: string): Promise<RefItemDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Ref item not found');
    }
    const item = await this.refModel.findById(id);
    if (!item) throw new NotFoundException('Ref item not found');
    return item;
  }

  private toPublic(item: RefItem & { _id: Types.ObjectId }) {
    return {
      id: item._id.toString(),
      type: item.type,
      name: item.name,
      slug: item.slug,
      description: item.description ?? null,
      icon: item.icon ?? null,
      coverMediaId: item.coverMediaId?.toString() ?? null,
      order: item.order,
      status: item.status,
      isActive: item.isActive,
    };
  }
}
