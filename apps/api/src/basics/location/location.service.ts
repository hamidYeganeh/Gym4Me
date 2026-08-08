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
import { AuditAction, LocationKind } from '../../common/enums';
import { asSinglePageResult } from '../../common/utils/pagination.util';
import { slugify } from '../../common/utils/slug.util';
import { MediaService } from '../../media/media.service';
import { Location, LocationDocument } from '../../schemas/location.schema';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

const CHILD_KIND: Record<LocationKind, LocationKind | null> = {
  [LocationKind.COUNTRY]: LocationKind.PROVINCE,
  [LocationKind.PROVINCE]: LocationKind.CITY,
  [LocationKind.CITY]: LocationKind.DISTRICT,
  [LocationKind.DISTRICT]: null,
};

const PARENT_KIND: Record<LocationKind, LocationKind | null> = {
  [LocationKind.COUNTRY]: null,
  [LocationKind.PROVINCE]: LocationKind.COUNTRY,
  [LocationKind.CITY]: LocationKind.PROVINCE,
  [LocationKind.DISTRICT]: LocationKind.CITY,
};

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name)
    private readonly locationModel: Model<LocationDocument>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}

  async listByKind(kind: LocationKind, parentId?: string, admin = false) {
    const filter: Record<string, unknown> = { kind };
    if (!admin) filter.isActive = true;
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        throw new BadRequestException('Invalid parent id');
      }
      filter.parentId = new Types.ObjectId(parentId);
    } else if (kind !== LocationKind.COUNTRY && !admin) {
      // public child lists require a parent
    }

    const items = await this.locationModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .lean();
    return asSinglePageResult(items.map((l) => this.toPublic(l)));
  }

  async getById(id: string, admin = false) {
    const location = await this.findOrFail(id);
    if (!admin && !location.isActive) {
      throw new NotFoundException('Location not found');
    }
    return this.toPublic(location);
  }

  async listChildren(parentId: string, admin = false) {
    const parent = await this.findOrFail(parentId);
    if (!admin && !parent.isActive) {
      throw new NotFoundException('Location not found');
    }
    const childKind = CHILD_KIND[parent.kind];
    if (!childKind) {
      return {
        parent: this.toPublic(parent),
        ...asSinglePageResult([]),
      };
    }

    const filter: Record<string, unknown> = {
      kind: childKind,
      parentId: parent._id,
    };
    if (!admin) filter.isActive = true;

    const items = await this.locationModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    return {
      parent: this.toPublic(parent),
      ...asSinglePageResult(items.map((l) => this.toPublic(l))),
    };
  }

  async create(dto: CreateLocationDto, adminId: string, request: Request) {
    await this.media.assertExists(dto.coverMediaId);
    const { parentId, ancestors } = await this.resolveParent(dto.kind, dto.parentId);
    const slug = await this.uniqueSlug(dto.kind, dto.slug || slugify(dto.name));

    const location = await this.locationModel.create({
      kind: dto.kind,
      name: dto.name,
      slug,
      description: dto.description,
      icon: dto.icon,
      flagSvg:
        dto.kind === LocationKind.COUNTRY ? dto.flagSvg : undefined,
      parentId,
      ancestors,
      center: dto.center
        ? { type: 'Point', coordinates: [dto.center.lng, dto.center.lat] }
        : undefined,
      coverMediaId: dto.coverMediaId
        ? new Types.ObjectId(dto.coverMediaId)
        : undefined,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    this.audit.log({
      action: AuditAction.LOCATION_CREATED,
      actorId: adminId,
      metadata: { id: location._id.toString(), kind: location.kind, slug },
      request,
    });

    return this.toPublic(location);
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
    adminId: string,
    request: Request,
  ) {
    const location = await this.findOrFail(id);

    if (dto.coverMediaId !== undefined && dto.coverMediaId !== null) {
      await this.media.assertExists(dto.coverMediaId);
    }

    if (dto.name !== undefined) location.name = dto.name;
    if (dto.description !== undefined) location.description = dto.description;
    if (dto.order !== undefined) location.order = dto.order;
    if (dto.isActive !== undefined) location.isActive = dto.isActive;

    if (dto.icon === null) location.icon = undefined;
    else if (dto.icon !== undefined) location.icon = dto.icon;

    if (location.kind === LocationKind.COUNTRY) {
      if (dto.flagSvg === null) location.flagSvg = undefined;
      else if (dto.flagSvg !== undefined) location.flagSvg = dto.flagSvg;
    }

    if (dto.slug !== undefined && dto.slug !== location.slug) {
      location.slug = await this.uniqueSlug(location.kind, dto.slug, id);
    }

    if (dto.center === null) {
      location.center = undefined;
    } else if (dto.center) {
      location.center = {
        type: 'Point',
        coordinates: [dto.center.lng, dto.center.lat],
      };
    }

    if (dto.coverMediaId === null) {
      location.coverMediaId = undefined;
    } else if (dto.coverMediaId) {
      location.coverMediaId = new Types.ObjectId(dto.coverMediaId);
    }

    await location.save();

    this.audit.log({
      action: AuditAction.LOCATION_UPDATED,
      actorId: adminId,
      metadata: { id, kind: location.kind },
      request,
    });

    return this.toPublic(location);
  }

  async remove(id: string, adminId: string, request: Request) {
    const location = await this.findOrFail(id);
    const childCount = await this.locationModel.countDocuments({
      parentId: location._id,
    });
    if (childCount > 0) {
      throw new BadRequestException(
        'Cannot delete a location that still has children',
      );
    }

    await location.deleteOne();

    this.audit.log({
      action: AuditAction.LOCATION_DELETED,
      actorId: adminId,
      metadata: { id, kind: location.kind, slug: location.slug },
      request,
    });

    return { success: true };
  }

  async upsertSeed(dto: CreateLocationDto) {
    const slug = dto.slug || slugify(dto.name);
    const existing = await this.locationModel.findOne({
      kind: dto.kind,
      slug,
    });
    if (existing) return existing;

    const { parentId, ancestors } = await this.resolveParent(
      dto.kind,
      dto.parentId,
    );
    return this.locationModel.create({
      kind: dto.kind,
      name: dto.name,
      slug,
      description: dto.description,
      icon: dto.icon,
      flagSvg:
        dto.kind === LocationKind.COUNTRY ? dto.flagSvg : undefined,
      parentId,
      ancestors,
      center: dto.center
        ? { type: 'Point', coordinates: [dto.center.lng, dto.center.lat] }
        : undefined,
      order: dto.order ?? 0,
      isActive: true,
    });
  }

  private async resolveParent(kind: LocationKind, parentId?: string) {
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
    kind: LocationKind,
    base: string,
    excludeId?: string,
  ): Promise<string> {
    const slug = slugify(base) || 'location';
    let candidate = slug;
    let i = 1;
    while (true) {
      const existing = await this.locationModel.findOne({
        kind,
        slug: candidate,
        ...(excludeId ? { _id: { $ne: new Types.ObjectId(excludeId) } } : {}),
      });
      if (!existing) return candidate;
      candidate = `${slug}-${++i}`;
      if (i > 50) throw new ConflictException('Could not allocate unique slug');
    }
  }

  private async findOrFail(id: string): Promise<LocationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Location not found');
    }
    const location = await this.locationModel.findById(id);
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  private toPublic(location: Location & { _id: Types.ObjectId }) {
    return {
      id: location._id.toString(),
      kind: location.kind,
      name: location.name,
      slug: location.slug,
      description: location.description ?? null,
      icon: location.icon ?? null,
      flagSvg: location.flagSvg ?? null,
      parentId: location.parentId?.toString() ?? null,
      ancestors: (location.ancestors ?? []).map((a) => a.toString()),
      coordinates: location.center?.coordinates
        ? {
            lng: location.center.coordinates[0],
            lat: location.center.coordinates[1],
          }
        : null,
      coverMediaId: location.coverMediaId?.toString() ?? null,
      order: location.order,
      isActive: location.isActive,
    };
  }
}
