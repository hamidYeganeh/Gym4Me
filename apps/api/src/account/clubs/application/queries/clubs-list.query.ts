import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import { RefType } from '../../../../common/enums';
import { escapeRegex } from '../../../../common/utils/escape-regex.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../../../../common/utils/list-query.util';
import { resolvePageSize } from '../../../../common/utils/pagination.util';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';
import {
  RefItem,
  type RefItemDocument,
} from '../../../../schemas/ref-item.schema';
import type {
  DiscoveryClubsQueryDto,
  ListClubsQueryDto,
} from '../../dto/club.dto';
import { DISCOVERY_VISIBLE_CLUB_MATCH } from '../../discovery-club-facets';

const CLUB_SORT_FIELDS = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'identity.name',
  status: 'review.status',
  operationalStatus: 'operationalStatus',
  rating: 'reviewsSummary.average',
} as const;

export type ClubsListResult = {
  items: ClubDocument[];
  total: number;
  page: number;
  pageSize: number;
};

/** Builds bounded club lists; facade owns the enriched public projection. */
@Injectable()
export class ClubsListQuery {
  constructor(
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(RefItem.name)
    private readonly refModel: Model<RefItemDocument>,
  ) {}

  async discovery(query: DiscoveryClubsQueryDto): Promise<ClubsListResult> {
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<ClubDocument> = {
      ...DISCOVERY_VISIBLE_CLUB_MATCH,
    };

    if (query.q?.trim()) {
      const q = query.q.trim().slice(0, 64);
      filter['identity.name'] = {
        $regex: escapeRegex(q),
        $options: 'i',
      };
    }
    if (query.categoryId) {
      filter['categories.categoryId'] = new Types.ObjectId(query.categoryId);
    }
    if (query.sportId) {
      filter['sports.sportId'] = new Types.ObjectId(query.sportId);
    }
    if (query.locationId) {
      const locationId = new Types.ObjectId(query.locationId);
      filter.$or = [
        { 'location.locationId': locationId },
        { 'location.ancestors': locationId },
      ];
    }
    if (query.direction) filter['location.direction'] = query.direction;
    if (query.genderPolicy?.trim()) {
      filter['audience.genderPolicy'] = query.genderPolicy.trim();
    }
    if (query.ageGroupKey?.trim()) {
      filter['audience.ageGroupKeys'] = query.ageGroupKey.trim();
    }
    if (query.levelKey?.trim()) {
      filter['audience.levelKeys'] = query.levelKey.trim();
    }
    if (query.accessibility?.trim()) {
      filter['audience.accessibility'] = query.accessibility.trim();
    }
    if (query.amenitySlug?.trim()) {
      const amenity = await this.refModel
        .findOne({
          type: RefType.AMENITY,
          slug: query.amenitySlug.trim().toLowerCase(),
          isActive: true,
        })
        .select({ _id: 1 })
        .lean();
      if (!amenity) return { items: [], total: 0, page, pageSize };
      filter['amenities.amenityId'] = amenity._id;
    }

    const useGeo =
      query.lng !== undefined &&
      query.lat !== undefined &&
      Number.isFinite(query.lng) &&
      Number.isFinite(query.lat);
    if (useGeo) {
      filter['location.point'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [query.lng!, query.lat!],
          },
          $maxDistance: query.radiusMeters ?? 10_000,
        },
      };
    }

    return this.execute(
      filter,
      page,
      pageSize,
      useGeo ? undefined : { 'reviewsSummary.average': -1, createdAt: -1 },
    );
  }

  async internal(query: ListClubsQueryDto): Promise<ClubsListResult> {
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<ClubDocument> = {};
    const andFilters: QueryFilter<ClubDocument>[] = [];

    if (query.ownerId) filter.ownerId = new Types.ObjectId(query.ownerId);
    const search = query.search ?? query.q;
    if (search?.trim()) {
      andFilters.push(
        createSearchFilter(search, [
          'identity.name',
          'identity.description',
          'contact.email',
          'contact.phones.number',
          'location.address',
        ]),
      );
    }
    if (query.categoryId) {
      filter['categories.categoryId'] = new Types.ObjectId(query.categoryId);
    }
    if (query.sportId) {
      filter['sports.sportId'] = new Types.ObjectId(query.sportId);
    }
    if (query.locationId) {
      const locationId = new Types.ObjectId(query.locationId);
      andFilters.push({
        $or: [
          { 'location.locationId': locationId },
          { 'location.ancestors': locationId },
        ],
      });
    }
    if (query.direction) filter['location.direction'] = query.direction;
    if (query.lifecycleStatus) {
      filter['review.status'] = { $in: query.lifecycleStatus };
    }
    if (query.operationalStatus) {
      filter.operationalStatus = { $in: query.operationalStatus };
    }
    if (andFilters.length > 0) filter.$and = andFilters;

    return this.execute(
      filter,
      page,
      pageSize,
      resolveListSort(query, CLUB_SORT_FIELDS, { createdAt: -1 }),
    );
  }

  private async execute(
    filter: QueryFilter<ClubDocument>,
    page: number,
    pageSize: number,
    sort: Record<string, 1 | -1> | undefined,
  ): Promise<ClubsListResult> {
    const [items, total] = await Promise.all([
      this.clubModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.clubModel.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }
}
