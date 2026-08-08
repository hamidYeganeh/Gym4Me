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
import { AuditAction, SportKind } from '../../common/enums';
import { asSinglePageResult } from '../../common/utils/pagination.util';
import { slugify } from '../../common/utils/slug.util';
import { MediaService } from '../../media/media.service';
import { Sport, SportDocument } from '../../schemas/sport.schema';
import { CreateSportDto, UpdateSportDto } from './dto/sport.dto';

const PARENT_KIND: Record<SportKind, SportKind | null> = {
  [SportKind.CATEGORY]: null,
  [SportKind.SPORT]: SportKind.CATEGORY,
  [SportKind.BRANCH]: SportKind.SPORT,
};

const CHILD_KIND: Record<SportKind, SportKind | null> = {
  [SportKind.CATEGORY]: SportKind.SPORT,
  [SportKind.SPORT]: SportKind.BRANCH,
  [SportKind.BRANCH]: null,
};

/** Public path aliases → SportKind */
export const SPORT_PATH_KIND: Record<string, SportKind> = {
  'sport-category': SportKind.CATEGORY,
  sport: SportKind.SPORT,
  'sport-branch': SportKind.BRANCH,
};

@Injectable()
export class SportService {
  constructor(
    @InjectModel(Sport.name) private readonly sportModel: Model<SportDocument>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}

  resolvePathKind(path: string): SportKind {
    const kind = SPORT_PATH_KIND[path];
    if (!kind) throw new NotFoundException('Unknown sport resource');
    return kind;
  }

  async listByKind(kind: SportKind, parentId?: string, admin = false) {
    const filter: Record<string, unknown> = { kind };
    if (!admin) filter.isActive = true;
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        throw new BadRequestException('Invalid parent id');
      }
      filter.parentId = new Types.ObjectId(parentId);
    }

    const items = await this.sportModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .lean();
    return asSinglePageResult(items.map((s) => this.toPublic(s)));
  }

  async getById(id: string, admin = false) {
    const sport = await this.findOrFail(id);
    if (!admin && !sport.isActive) {
      throw new NotFoundException('Sport not found');
    }
    return this.toPublic(sport);
  }

  async listChildren(parentId: string, admin = false) {
    const parent = await this.findOrFail(parentId);
    if (!admin && !parent.isActive) {
      throw new NotFoundException('Sport not found');
    }
    const childKind = CHILD_KIND[parent.kind];
    if (!childKind) {
      return { parent: this.toPublic(parent), ...asSinglePageResult([]) };
    }

    const filter: Record<string, unknown> = {
      kind: childKind,
      parentId: parent._id,
    };
    if (!admin) filter.isActive = true;

    const items = await this.sportModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    return {
      parent: this.toPublic(parent),
      ...asSinglePageResult(items.map((s) => this.toPublic(s))),
    };
  }

  async create(dto: CreateSportDto, adminId: string, request: Request) {
    await this.media.assertExists(dto.coverMediaId);
    const { parentId, ancestors } = await this.resolveParent(
      dto.kind,
      dto.parentId,
    );
    const slug = await this.uniqueSlug(dto.kind, dto.slug || slugify(dto.name));

    const sport = await this.sportModel.create({
      kind: dto.kind,
      name: dto.name,
      slug,
      description: dto.description,
      icon: dto.icon,
      coverMediaId: dto.coverMediaId
        ? new Types.ObjectId(dto.coverMediaId)
        : undefined,
      parentId,
      ancestors,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    this.audit.log({
      action: AuditAction.SPORT_CREATED,
      actorId: adminId,
      metadata: { id: sport._id.toString(), kind: sport.kind, slug },
      request,
    });

    return this.toPublic(sport);
  }

  async update(
    id: string,
    dto: UpdateSportDto,
    adminId: string,
    request: Request,
  ) {
    const sport = await this.findOrFail(id);

    if (dto.coverMediaId !== undefined && dto.coverMediaId !== null) {
      await this.media.assertExists(dto.coverMediaId);
    }

    if (dto.name !== undefined) sport.name = dto.name;
    if (dto.description !== undefined) sport.description = dto.description;
    if (dto.order !== undefined) sport.order = dto.order;
    if (dto.isActive !== undefined) sport.isActive = dto.isActive;

    if (dto.icon === null) sport.icon = undefined;
    else if (dto.icon !== undefined) sport.icon = dto.icon;

    if (dto.coverMediaId === null) sport.coverMediaId = undefined;
    else if (dto.coverMediaId) {
      sport.coverMediaId = new Types.ObjectId(dto.coverMediaId);
    }

    if (dto.slug !== undefined && dto.slug !== sport.slug) {
      sport.slug = await this.uniqueSlug(sport.kind, dto.slug, id);
    }

    await sport.save();

    this.audit.log({
      action: AuditAction.SPORT_UPDATED,
      actorId: adminId,
      metadata: { id, kind: sport.kind },
      request,
    });

    return this.toPublic(sport);
  }

  async remove(id: string, adminId: string, request: Request) {
    const sport = await this.findOrFail(id);
    const childCount = await this.sportModel.countDocuments({
      parentId: sport._id,
    });
    if (childCount > 0) {
      throw new BadRequestException(
        'Cannot delete a sport node that still has children',
      );
    }

    await sport.deleteOne();

    this.audit.log({
      action: AuditAction.SPORT_DELETED,
      actorId: adminId,
      metadata: { id, kind: sport.kind, slug: sport.slug },
      request,
    });

    return { success: true };
  }

  async upsertSeed(dto: CreateSportDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await this.sportModel.findOne({ kind: dto.kind, slug });
    if (existing) return existing;

    const { parentId, ancestors } = await this.resolveParent(
      dto.kind,
      dto.parentId,
    );
    return this.sportModel.create({
      kind: dto.kind,
      name: dto.name,
      slug,
      description: dto.description,
      icon: dto.icon,
      parentId,
      ancestors,
      order: dto.order ?? 0,
      isActive: true,
    });
  }

  private async resolveParent(kind: SportKind, parentId?: string) {
    const expectedParent = PARENT_KIND[kind];
    if (!expectedParent) {
      if (parentId) {
        throw new BadRequestException(`${kind} must not have a parent`);
      }
      return { parentId: undefined, ancestors: [] as Types.ObjectId[] };
    }
    if (!parentId) {
      throw new BadRequestException(`${kind} requires parentId`);
    }
    const parent = await this.findOrFail(parentId);
    if (parent.kind !== expectedParent) {
      throw new BadRequestException(
        `${kind} parent must be a ${expectedParent}`,
      );
    }
    return {
      parentId: parent._id,
      ancestors: [...parent.ancestors, parent._id],
    };
  }

  private async uniqueSlug(
    kind: SportKind,
    base: string,
    excludeId?: string,
  ): Promise<string> {
    const slug = slugify(base) || 'sport';
    let candidate = slug;
    let i = 1;
    while (true) {
      const existing = await this.sportModel.findOne({
        kind,
        slug: candidate,
        ...(excludeId ? { _id: { $ne: new Types.ObjectId(excludeId) } } : {}),
      });
      if (!existing) return candidate;
      candidate = `${slug}-${++i}`;
      if (i > 50) throw new ConflictException('Could not allocate unique slug');
    }
  }

  private async findOrFail(id: string): Promise<SportDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Sport not found');
    }
    const sport = await this.sportModel.findById(id);
    if (!sport) throw new NotFoundException('Sport not found');
    return sport;
  }

  private toPublic(sport: Sport & { _id: Types.ObjectId }) {
    return {
      id: sport._id.toString(),
      kind: sport.kind,
      name: sport.name,
      slug: sport.slug,
      description: sport.description ?? null,
      icon: sport.icon ?? null,
      coverMediaId: sport.coverMediaId?.toString() ?? null,
      parentId: sport.parentId?.toString() ?? null,
      ancestors: (sport.ancestors ?? []).map((a) => a.toString()),
      order: sport.order,
      isActive: sport.isActive,
    };
  }
}
