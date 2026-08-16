import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  EntityStatus,
} from '../../common/enums';
import { escapeRegex } from '../../common/utils/escape-regex.util';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { ClubClass, ClubClassDocument } from '../../schemas/club-class.schema';
import { Club, ClubDocument } from '../../schemas/club.schema';
import { ClubSlotsService } from './club-slots.service';
import { DiscoveryClassesQueryDto } from './dto/discovery-classes.dto';

@Injectable()
export class DiscoveryClassesService {
  constructor(
    @InjectModel(ClubClass.name)
    private readonly classModel: Model<ClubClassDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly slots: ClubSlotsService,
  ) {}

  async list(query: DiscoveryClassesQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const discoverableClubIds = await this.findDiscoverableClubIds(
      query.clubId,
    );
    if (discoverableClubIds.length === 0) {
      return paginatedResult([], 0, page, pageSize);
    }

    const filter: QueryFilter<ClubClassDocument> = {
      clubId: { $in: discoverableClubIds },
      status: { $ne: EntityStatus.ARCHIVED },
    };

    if (query.sportId && Types.ObjectId.isValid(query.sportId)) {
      filter.sportId = new Types.ObjectId(query.sportId);
    }
    if (query.coachId && Types.ObjectId.isValid(query.coachId)) {
      filter.coachId = new Types.ObjectId(query.coachId);
    }
    if (query.q?.trim()) {
      const q = query.q.trim().slice(0, 64);
      filter.$or = [
        { title: { $regex: escapeRegex(q), $options: 'i' } },
        { description: { $regex: escapeRegex(q), $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.classModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.classModel.countDocuments(filter),
    ]);

    const clubById = await this.loadClubsById(
      items.map((item) => item.clubId.toString()),
    );

    return paginatedResult(
      await Promise.all(
        items.map((doc) => this.toDiscoveryClass(doc, clubById)),
      ),
      total,
      page,
      pageSize,
    );
  }

  async get(classId: string) {
    if (!Types.ObjectId.isValid(classId)) {
      throw new NotFoundException('Class not found');
    }

    const doc = await this.classModel.findOne({
      _id: new Types.ObjectId(classId),
      status: { $ne: EntityStatus.ARCHIVED },
    });
    if (!doc) throw new NotFoundException('Class not found');

    const club = await this.clubModel
      .findOne({
        _id: doc.clubId,
        'review.status': ClubLifecycleStatus.APPROVED,
        operationalStatus: ClubOperationalStatus.ACTIVE,
      })
      .select({ identity: 1 });
    if (!club) throw new NotFoundException('Class not found');

    const clubById = new Map([[club._id.toString(), club]]);
    return this.toDiscoveryClass(doc, clubById);
  }

  private async findDiscoverableClubIds(clubId?: string) {
    const filter: QueryFilter<ClubDocument> = {
      'review.status': ClubLifecycleStatus.APPROVED,
      operationalStatus: ClubOperationalStatus.ACTIVE,
    };
    if (clubId) {
      if (!Types.ObjectId.isValid(clubId)) return [];
      filter._id = new Types.ObjectId(clubId);
    }

    const clubs = await this.clubModel.find(filter).select({ _id: 1 }).lean();
    return clubs.map((club) => club._id);
  }

  private async loadClubsById(clubIds: string[]) {
    const uniqueIds = [
      ...new Set(clubIds.filter((id) => Types.ObjectId.isValid(id))),
    ];
    if (uniqueIds.length === 0) return new Map<string, ClubDocument>();

    const clubs = await this.clubModel
      .find({ _id: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) } })
      .select({ identity: 1 });

    return new Map(clubs.map((club) => [club._id.toString(), club]));
  }

  private async toDiscoveryClass(
    doc: ClubClassDocument,
    clubById: Map<string, ClubDocument>,
  ) {
    const base = await this.slots.toClassPublic(doc);
    const club = clubById.get(doc.clubId.toString());
    return {
      ...base,
      club: {
        id: doc.clubId.toString(),
        name: club?.identity?.name ?? '',
        coverMediaId: club?.identity?.coverMediaId?.toString() ?? null,
      },
    };
  }
}
