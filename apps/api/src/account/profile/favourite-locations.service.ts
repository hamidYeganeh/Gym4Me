import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, FavouriteLocationKind } from '../../common/enums';
import { UsersService } from '../../users/users.service';
import type {
  CreateFavouriteLocationDto,
  UpdateFavouriteLocationDto,
} from './dto/favourite-location.dto';
import {
  MAX_FAVOURITE_LOCATIONS,
  applyAddressPatch,
  favouriteLocationHasContent,
  findExclusiveKindConflict,
  toPublicAddress,
  toPublicFavouriteLocation,
  type FavouriteLocationPublic,
} from './favourite-locations.util';

@Injectable()
export class FavouriteLocationsService {
  constructor(
    private readonly users: UsersService,
    private readonly audit: AuditService,
  ) {}

  async list(userId: string): Promise<{ items: FavouriteLocationPublic[] }> {
    const user = await this.users.findById(userId);
    return { items: this.toPublicList(user.favouriteLocations ?? []) };
  }

  async get(userId: string, id: string): Promise<FavouriteLocationPublic> {
    const user = await this.users.findById(userId);
    return this.requireItem(user.favouriteLocations ?? [], id);
  }

  async create(
    userId: string,
    dto: CreateFavouriteLocationDto,
    request: Request,
  ): Promise<FavouriteLocationPublic> {
    const user = await this.users.findById(userId);
    const items = user.favouriteLocations ?? [];
    if (items.length >= MAX_FAVOURITE_LOCATIONS) {
      throw new BadRequestException(
        `You can save at most ${MAX_FAVOURITE_LOCATIONS} favourite locations`,
      );
    }
    this.assertLabel(dto.kind, dto.label);
    if (findExclusiveKindConflict(items, dto.kind)) {
      throw new ConflictException(
        `A ${dto.kind} location is already saved`,
      );
    }

    const address = applyAddressPatch({}, dto.address ?? {});
    if (!favouriteLocationHasContent(toPublicAddress(address))) {
      throw new BadRequestException(
        'A favourite location needs a map pin or an address',
      );
    }

    items.push({
      _id: new Types.ObjectId(),
      kind: dto.kind,
      label: this.normalizeLabel(dto.label),
      address,
    });
    user.favouriteLocations = items;
    user.markModified('favouriteLocations');
    await user.save();

    const created = items[items.length - 1];
    this.audit.log({
      action: AuditAction.PROFILE_FAVOURITE_LOCATION_CREATED,
      actorId: userId,
      metadata: { locationId: created._id.toString(), kind: created.kind },
      request,
    });
    return toPublicFavouriteLocation(created);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateFavouriteLocationDto,
    request: Request,
  ): Promise<FavouriteLocationPublic> {
    this.assertObjectId(id);
    const user = await this.users.findById(userId);
    const items = user.favouriteLocations ?? [];
    const item = items.find((row) => row._id.toString() === id);
    if (!item) throw new NotFoundException('Favourite location not found');

    const nextKind = dto.kind ?? item.kind;
    const nextLabel =
      dto.label === undefined ? item.label : this.normalizeLabel(dto.label);
    this.assertLabel(nextKind, nextLabel);
    if (findExclusiveKindConflict(items, nextKind, id)) {
      throw new ConflictException(
        `A ${nextKind} location is already saved`,
      );
    }

    item.kind = nextKind;
    item.label = nextLabel;
    if (dto.address) {
      item.address = applyAddressPatch(item.address, dto.address);
    }

    const mapped = toPublicFavouriteLocation(item);
    if (!favouriteLocationHasContent(mapped.address)) {
      throw new BadRequestException(
        'A favourite location needs a map pin or an address',
      );
    }

    user.markModified('favouriteLocations');
    await user.save();
    this.audit.log({
      action: AuditAction.PROFILE_FAVOURITE_LOCATION_UPDATED,
      actorId: userId,
      metadata: { locationId: id, kind: item.kind },
      request,
    });
    return mapped;
  }

  async remove(
    userId: string,
    id: string,
    request: Request,
  ): Promise<{ items: FavouriteLocationPublic[] }> {
    this.assertObjectId(id);
    const user = await this.users.findById(userId);
    const items = user.favouriteLocations ?? [];
    const next = items.filter((row) => row._id.toString() !== id);
    if (next.length === items.length) {
      throw new NotFoundException('Favourite location not found');
    }
    user.favouriteLocations = next;
    user.markModified('favouriteLocations');
    await user.save();
    this.audit.log({
      action: AuditAction.PROFILE_FAVOURITE_LOCATION_DELETED,
      actorId: userId,
      metadata: { locationId: id },
      request,
    });
    return { items: this.toPublicList(next) };
  }

  private toPublicList(
    items: Array<Parameters<typeof toPublicFavouriteLocation>[0]>,
  ) {
    return items.map((item) => toPublicFavouriteLocation(item));
  }

  private requireItem(
    items: Array<Parameters<typeof toPublicFavouriteLocation>[0]>,
    id: string,
  ) {
    this.assertObjectId(id);
    const item = items.find((row) => row._id.toString() === id);
    if (!item) throw new NotFoundException('Favourite location not found');
    return toPublicFavouriteLocation(item);
  }

  private assertObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Favourite location not found');
    }
  }

  private normalizeLabel(label?: string | null): string | undefined {
    const trimmed = label?.trim();
    return trimmed ? trimmed : undefined;
  }

  private assertLabel(kind: FavouriteLocationKind, label?: string | null) {
    if (kind === FavouriteLocationKind.OTHER && !label?.trim()) {
      throw new BadRequestException('label is required for other locations');
    }
  }
}
