import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  ClubLifecycleStatus,
  ClubOperationalStatus,
  ClubUserReviewStatus,
  EntityStatus,
  GamificationSubjectType,
  OperatingHourAudience,
  PointRuleEvent,
  Role,
  UserStatus,
  WeekdayStatus,
} from '../../common/enums';
import { GamificationService } from '../../gamification/gamification.service';
import type { JwtUser } from '../../common/types';
import {
  createSearchFilter,
  resolveListSort,
} from '../../common/utils/list-query.util';
import {
  asSinglePageResult,
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { assertCanMutateAsRole } from '../../common/utils/role-assert.util';
import { Location, LocationDocument } from '../../schemas/location.schema';
import { ClubClass, ClubClassDocument } from '../../schemas/club-class.schema';
import { Club, ClubDocument } from '../../schemas/club.schema';
import {
  ClubUserReview,
  ClubUserReviewDocument,
} from '../../schemas/club-user-review.schema';
import {
  Achievement,
  AchievementDocument,
} from '../../schemas/achievement.schema';
import { RefItem, RefItemDocument } from '../../schemas/ref-item.schema';
import { Sport, SportDocument } from '../../schemas/sport.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';
import {
  collectLocationRelatedIds,
  toLocationPublic,
  toLocationRef,
  type LocationLike,
} from '../../basics/location/location-public';
import {
  collectSportRelatedIds,
  toSportPublic,
  type SportLike,
} from '../../basics/sport/sport-public';
import { ListClubReviewsQueryDto } from '../../admin/dto/admin-review.dto';
import {
  AdminCreateClubDto,
  AssignClassDto,
  AssignCoachDto,
  CreateBranchDto,
  CreateClubDto,
  CreateUserReviewDto,
  DiscoveryClubsQueryDto,
  GrantAchievementDto,
  ListClubsQueryDto,
  ListUserReviewsQueryDto,
  ModerateUserReviewDto,
  ReplyUserReviewDto,
  SubmitClubReviewDto,
  UpdateClubDto,
} from './dto/club.dto';
import {
  DISCOVERY_VISIBLE_CLUB_MATCH,
  mapDiscoveryCategoryFacetRows,
} from './discovery-club-facets';
import { ClubsListQuery } from './application/queries/clubs-list.query';

type ClubWriteDto = CreateClubDto | UpdateClubDto;

const CLUB_REVIEW_QUEUE_SORT_FIELDS = {
  submittedAt: 'review.submittedAt',
  reviewedAt: 'review.reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'identity.name',
  status: 'review.status',
} as const;

const CLUB_USER_REVIEW_SORT_FIELDS = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  rating: 'rating',
  status: 'status',
} as const;

@Injectable()
export class ClubsService {
  constructor(
    @InjectModel(Club.name) private readonly clubModel: Model<ClubDocument>,
    @InjectModel(ClubClass.name)
    private readonly classModel: Model<ClubClassDocument>,
    @InjectModel(ClubUserReview.name)
    private readonly reviewModel: Model<ClubUserReviewDocument>,
    @InjectModel(Achievement.name)
    private readonly achievementModel: Model<AchievementDocument>,
    @InjectModel(Location.name)
    private readonly locationModel: Model<LocationDocument>,
    @InjectModel(Sport.name)
    private readonly sportModel: Model<SportDocument>,
    @InjectModel(RefItem.name)
    private readonly refModel: Model<RefItemDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly users: UsersService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
    private readonly gamification: GamificationService,
    private readonly clubsListQuery: ClubsListQuery,
  ) {}

  // ── Owner ──────────────────────────────────────

  async listMine(jwt: JwtUser, query: ListClubsQueryDto = {}) {
    assertCanMutateAsRole(jwt, Role.CLUB_OWNER);
    return this.listInternal({
      ...query,
      ownerId: jwt.sub,
    });
  }

  async getMine(jwt: JwtUser, clubId: string) {
    const club = await this.requireOwned(jwt, clubId);
    return this.toPublic(club);
  }

  async create(jwt: JwtUser, dto: CreateClubDto, request: Request) {
    assertCanMutateAsRole(jwt, Role.CLUB_OWNER);
    return this.createInternal(jwt.sub, dto, request, jwt);
  }

  async update(
    jwt: JwtUser,
    clubId: string,
    dto: UpdateClubDto,
    request: Request,
  ) {
    const club = await this.requireOwned(jwt, clubId);
    this.assertEditable(club);
    await this.applyWrite(club, dto);
    await club.save();

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId: jwt.sub,
      metadata: { clubId },
      request,
    });

    return this.toPublic(club);
  }

  async remove(jwt: JwtUser, clubId: string, request: Request) {
    const club = await this.requireOwned(jwt, clubId);
    this.assertEditable(club);
    const branchCount = await this.clubModel.countDocuments({
      parentClubId: club._id,
    });
    if (branchCount > 0) {
      throw new BadRequestException(
        'Cannot delete a club that still has branches',
      );
    }
    await club.deleteOne();
    this.audit.log({
      action: AuditAction.CLUB_DELETED,
      actorId: jwt.sub,
      metadata: { clubId },
      request,
    });
    return { success: true };
  }

  async activate(jwt: JwtUser, clubId: string, request: Request) {
    const club = await this.requireOwned(jwt, clubId);
    club.operationalStatus = ClubOperationalStatus.ACTIVE;
    await club.save();
    this.audit.log({
      action: AuditAction.CLUB_ACTIVATED,
      actorId: jwt.sub,
      metadata: { clubId },
      request,
    });
    return this.toPublic(club);
  }

  async deactivate(jwt: JwtUser, clubId: string, request: Request) {
    const club = await this.requireOwned(jwt, clubId);
    club.operationalStatus = ClubOperationalStatus.INACTIVE;
    await club.save();
    this.audit.log({
      action: AuditAction.CLUB_DEACTIVATED,
      actorId: jwt.sub,
      metadata: { clubId },
      request,
    });
    return this.toPublic(club);
  }

  async submitForReview(
    jwt: JwtUser,
    clubId: string,
    dto: SubmitClubReviewDto,
    request: Request,
  ) {
    const club = await this.requireOwned(jwt, clubId);
    const status = club.review.status;
    if (
      status !== ClubLifecycleStatus.DRAFT &&
      status !== ClubLifecycleStatus.REJECTED
    ) {
      throw new ConflictException(`Cannot submit club in status "${status}"`);
    }
    if (!dto.documentMediaIds.length) {
      throw new BadRequestException('At least one document is required');
    }

    club.review = {
      ...club.review,
      status: ClubLifecycleStatus.PENDING_REVIEW,
      submittedAt: new Date(),
      documentMediaIds: dto.documentMediaIds.map(
        (id) => new Types.ObjectId(id),
      ),
      reviewNote: dto.note,
      reviewedAt: undefined,
      reviewedBy: undefined,
    };
    club.markModified('review');
    await club.save();

    this.audit.log({
      action: AuditAction.CLUB_SUBMITTED,
      actorId: jwt.sub,
      metadata: { clubId },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.CLUB_SUBMITTED_FOR_REVIEW,
      actor: { userId: jwt.sub, activeRole: jwt.activeRole },
      context: { clubId },
    });

    return this.toPublic(club);
  }

  // ── Admin ──────────────────────────────────────

  async adminList(query: ListClubsQueryDto) {
    return this.listInternal(query);
  }

  async adminGet(clubId: string) {
    const club = await this.findClubOrFail(clubId);
    return this.toPublic(club);
  }

  async adminCreate(
    dto: AdminCreateClubDto,
    adminId: string,
    request: Request,
  ) {
    return this.createInternal(dto.ownerId, dto, request, {
      sub: adminId,
      activeRole: Role.ADMIN,
    } as JwtUser);
  }

  async adminUpdate(
    clubId: string,
    dto: UpdateClubDto,
    adminId: string,
    request: Request,
  ) {
    const club = await this.findClubOrFail(clubId);
    await this.applyWrite(club, dto);
    await club.save();
    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId: adminId,
      metadata: { clubId, via: 'admin' },
      request,
    });
    return this.toPublic(club);
  }

  async adminRemove(clubId: string, adminId: string, request: Request) {
    const club = await this.findClubOrFail(clubId);
    await club.deleteOne();
    this.audit.log({
      action: AuditAction.CLUB_DELETED,
      actorId: adminId,
      metadata: { clubId, via: 'admin' },
      request,
    });
    return { success: true };
  }

  async adminActivate(clubId: string, adminId: string, request: Request) {
    const club = await this.findClubOrFail(clubId);
    club.operationalStatus = ClubOperationalStatus.ACTIVE;
    await club.save();
    this.audit.log({
      action: AuditAction.CLUB_ACTIVATED,
      actorId: adminId,
      metadata: { clubId, via: 'admin' },
      request,
    });
    return this.toPublic(club);
  }

  async adminDeactivate(clubId: string, adminId: string, request: Request) {
    const club = await this.findClubOrFail(clubId);
    club.operationalStatus = ClubOperationalStatus.INACTIVE;
    await club.save();
    this.audit.log({
      action: AuditAction.CLUB_DEACTIVATED,
      actorId: adminId,
      metadata: { clubId, via: 'admin' },
      request,
    });
    return this.toPublic(club);
  }

  async listLifecycleQueue(query: ListClubReviewsQueryDto) {
    const filter: QueryFilter<ClubDocument> = {
      ...createSearchFilter(query.search, [
        'identity.name',
        'identity.description',
        'contact.email',
        'location.address',
        'review.reviewNote',
      ]),
    };
    if (query.status && query.status.length > 0) {
      filter['review.status'] = { $in: query.status };
    } else if (query.status === undefined) {
      filter['review.status'] = ClubLifecycleStatus.PENDING_REVIEW;
    }

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(query, CLUB_REVIEW_QUEUE_SORT_FIELDS, {
      'review.submittedAt': -1,
    });
    const [items, total] = await Promise.all([
      this.clubModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.clubModel.countDocuments(filter),
    ]);

    return paginatedResult(
      await Promise.all(items.map((c) => this.toPublic(c))),
      total,
      page,
      pageSize,
    );
  }

  async reviewLifecycle(
    clubId: string,
    action: 'approve' | 'reject',
    reviewNote: string | undefined,
    adminId: string,
    request: Request,
  ) {
    const club = await this.findClubOrFail(clubId);
    if (club.review.status !== ClubLifecycleStatus.PENDING_REVIEW) {
      throw new ConflictException('Club is not pending review');
    }

    club.review.status =
      action === 'approve'
        ? ClubLifecycleStatus.APPROVED
        : ClubLifecycleStatus.REJECTED;
    club.review.reviewedAt = new Date();
    club.review.reviewedBy = new Types.ObjectId(adminId);
    club.review.reviewNote =
      action === 'reject' ? (reviewNote ?? 'Rejected') : reviewNote;
    club.markModified('review');
    await club.save();

    this.audit.log({
      action: AuditAction.CLUB_REVIEWED,
      actorId: adminId,
      targetUserId: club.ownerId,
      metadata: { clubId, action, reviewNote: club.review.reviewNote },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.CLUB_REVIEWED,
      actor: { userId: adminId },
      context: { clubId },
      properties: { action, ownerId: club.ownerId.toString() },
    });

    return this.toPublic(club);
  }

  // ── Discovery ──────────────────────────────────

  async discoveryList(query: DiscoveryClubsQueryDto) {
    const { items, total, page, pageSize } =
      await this.clubsListQuery.discovery(query);
    return paginatedResult(
      await Promise.all(items.map((c) => this.toPublic(c))),
      total,
      page,
      pageSize,
    );
  }

  async discoveryCategoryFacets() {
    const rows = await this.clubModel.aggregate<{
      _id: Types.ObjectId | null;
      count: number;
    }>([
      { $match: DISCOVERY_VISIBLE_CLUB_MATCH },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories.categoryId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { categories: mapDiscoveryCategoryFacetRows(rows) };
  }

  async discoveryGet(clubId: string) {
    const club = await this.findClubOrFail(clubId);
    if (
      club.review.status !== ClubLifecycleStatus.APPROVED ||
      club.operationalStatus !== ClubOperationalStatus.ACTIVE
    ) {
      throw new NotFoundException('Club not found');
    }
    return this.toPublic(club);
  }

  // ── Branches / classes / coaches ───────────────

  async listBranches(clubId: string) {
    await this.findClubOrFail(clubId);
    const items = await this.clubModel
      .find({ parentClubId: new Types.ObjectId(clubId) })
      .sort({ createdAt: -1 })
      .lean();
    return asSinglePageResult(
      await Promise.all(items.map((c) => this.toPublic(c))),
    );
  }

  async createBranch(
    parentClubId: string,
    dto: CreateBranchDto,
    ownerId: string,
    actorId: string,
    request: Request,
    asOwner = false,
  ) {
    const parent = await this.findClubOrFail(parentClubId);
    if (asOwner && parent.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Not your club');
    }
    if (parent.parentClubId) {
      throw new BadRequestException('Cannot create a branch of a branch');
    }
    return this.createInternal(ownerId, { ...dto, parentClubId }, request, {
      sub: actorId,
    } as JwtUser);
  }

  async listClasses(clubId: string) {
    await this.findClubOrFail(clubId);
    const items = await this.classModel
      .find({
        clubId: new Types.ObjectId(clubId),
        status: { $ne: EntityStatus.ARCHIVED },
      })
      .sort({ createdAt: -1 });
    return asSinglePageResult(
      items.map((c) => ({
        id: c._id.toString(),
        classId: c._id.toString(),
        title: c.title,
        description: c.description ?? null,
        sportId: c.sportId?.toString() ?? null,
        coachId: c.coachId?.toString() ?? null,
        media: {
          coverMediaId: c.media?.coverMediaId?.toString() ?? null,
        },
        status: c.status,
      })),
    );
  }

  async assignClass(
    clubId: string,
    dto: AssignClassDto,
    actorId: string,
    request: Request,
  ) {
    const club = await this.findClubOrFail(clubId);
    const exists = club.classes.some(
      (c) => c.classId.toString() === dto.classId,
    );
    if (!exists) {
      club.classes.push({ classId: new Types.ObjectId(dto.classId) });
      club.markModified('classes');
      await club.save();
    }
    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, assignClassId: dto.classId },
      request,
    });
    return this.listClasses(clubId);
  }

  async unassignClass(
    clubId: string,
    classId: string,
    actorId: string,
    request: Request,
  ) {
    const club = await this.findClubOrFail(clubId);
    club.classes = club.classes.filter((c) => c.classId.toString() !== classId);
    club.markModified('classes');
    await club.save();
    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, unassignClassId: classId },
      request,
    });
    return this.listClasses(clubId);
  }

  async listCoaches(clubId: string, opts?: { discovery?: boolean }) {
    const club = await this.findClubOrFail(clubId);
    const coachIds = (club.coaches ?? []).map((c) => c.coachId);
    const users = await this.userModel.find({ _id: { $in: coachIds } });
    const byId = new Map(users.map((u) => [u._id.toString(), u]));
    const discovery = opts?.discovery === true;
    return asSinglePageResult(
      coachIds.map((id) => {
        const user = byId.get(id.toString());
        if (!user) return { coachId: id.toString() };
        return {
          coachId: id.toString(),
          ...(discovery
            ? this.users.toDiscoveryPublic(user)
            : this.users.toPublic(user)),
        };
      }),
    );
  }

  async assignCoach(
    clubId: string,
    dto: AssignCoachDto,
    actorId: string,
    request: Request,
  ) {
    const club = await this.findClubOrFail(clubId);
    if (!Types.ObjectId.isValid(dto.coachId)) {
      throw new BadRequestException('Invalid coachId');
    }
    const coachUser = await this.userModel.findById(dto.coachId);
    if (!coachUser || coachUser.status !== UserStatus.ACTIVE) {
      throw new NotFoundException('Coach user not found');
    }
    if (!coachUser.roles.includes(Role.COACH)) {
      throw new BadRequestException('User does not have the coach role');
    }
    const exists = club.coaches.some(
      (c) => c.coachId.toString() === dto.coachId,
    );
    if (!exists) {
      club.coaches.push({ coachId: new Types.ObjectId(dto.coachId) });
      club.markModified('coaches');
      await club.save();
    }
    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, assignCoachId: dto.coachId },
      request,
    });
    return this.listCoaches(clubId);
  }

  async unassignCoach(
    clubId: string,
    coachId: string,
    actorId: string,
    request: Request,
  ) {
    const club = await this.findClubOrFail(clubId);
    club.coaches = club.coaches.filter((c) => c.coachId.toString() !== coachId);
    club.markModified('coaches');
    await club.save();
    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId,
      metadata: { clubId, unassignCoachId: coachId },
      request,
    });
    return this.listCoaches(clubId);
  }

  // ── User reviews ───────────────────────────────

  async listUserReviews(
    clubId: string,
    query: ListUserReviewsQueryDto,
    opts: { publicOnly?: boolean } = {},
  ) {
    await this.findClubOrFail(clubId);
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<ClubUserReviewDocument> = {
      clubId: new Types.ObjectId(clubId),
      ...createSearchFilter(query.search, ['comment', 'reply.text']),
    };
    if (opts.publicOnly) {
      filter.status = ClubUserReviewStatus.APPROVED;
    } else if (query.status) {
      filter.status = { $in: query.status };
    }
    const sort = resolveListSort(query, CLUB_USER_REVIEW_SORT_FIELDS, {
      createdAt: -1,
    });

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.reviewModel.countDocuments(filter),
    ]);

    return {
      ...paginatedResult(
        items.map((r) => this.toReviewPublic(r)),
        total,
        page,
        pageSize,
      ),
      summary: (await this.findClubOrFail(clubId)).reviewsSummary,
    };
  }

  async createUserReview(
    clubId: string,
    jwt: JwtUser,
    dto: CreateUserReviewDto,
    request: Request,
  ) {
    await this.discoveryGet(clubId);

    try {
      const review = await this.reviewModel.create({
        clubId: new Types.ObjectId(clubId),
        authorId: new Types.ObjectId(jwt.sub),
        bookingId: dto.bookingId
          ? new Types.ObjectId(dto.bookingId)
          : undefined,
        rating: dto.rating,
        criteria: (dto.criteria ?? []).map((c) => ({
          criterionId: new Types.ObjectId(c.criterionId),
          rating: c.rating,
        })),
        comment: dto.comment,
        status: ClubUserReviewStatus.PENDING,
      });

      this.audit.log({
        action: AuditAction.CLUB_USER_REVIEW_CREATED,
        actorId: jwt.sub,
        metadata: { clubId, reviewId: review._id.toString() },
        request,
      });

      return this.toReviewPublic(review);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException('You already reviewed this booking');
      }
      throw err;
    }
  }

  async replyUserReview(
    clubId: string,
    reviewId: string,
    jwt: JwtUser,
    dto: ReplyUserReviewDto,
    request: Request,
  ) {
    await this.requireOwned(jwt, clubId);
    const review = await this.reviewModel.findOne({
      _id: reviewId,
      clubId: new Types.ObjectId(clubId),
    });
    if (!review) throw new NotFoundException('Review not found');

    review.reply = {
      text: dto.text.trim(),
      repliedAt: new Date(),
      repliedBy: new Types.ObjectId(jwt.sub),
    };
    review.markModified('reply');
    await review.save();

    this.audit.log({
      action: AuditAction.CLUB_UPDATED,
      actorId: jwt.sub,
      metadata: { clubId, reviewId, reply: true },
      request,
    });

    return this.toReviewPublic(review);
  }

  async moderateUserReview(
    clubId: string,
    reviewId: string,
    dto: ModerateUserReviewDto,
    adminId: string,
    request: Request,
  ) {
    await this.findClubOrFail(clubId);
    const review = await this.reviewModel.findOne({
      _id: reviewId,
      clubId: new Types.ObjectId(clubId),
    });
    if (!review) throw new NotFoundException('Review not found');

    review.status = dto.status;
    await review.save();
    await this.recomputeReviewsSummary(clubId);

    this.audit.log({
      action: AuditAction.CLUB_USER_REVIEW_MODERATED,
      actorId: adminId,
      metadata: { clubId, reviewId, status: dto.status },
      request,
    });

    if (dto.status === ClubUserReviewStatus.APPROVED) {
      void this.gamification.handleEvent({
        event: PointRuleEvent.CLUB_REVIEW_APPROVED,
        eventKey: reviewId,
        subjects: [
          {
            type: GamificationSubjectType.ATHLETE,
            id: review.authorId,
          },
          {
            type: GamificationSubjectType.CLUB,
            id: review.clubId,
          },
        ],
        target: { type: 'club_review', id: reviewId },
      });
    }

    return this.toReviewPublic(review);
  }

  async grantAchievement(
    clubId: string,
    dto: GrantAchievementDto,
    adminId: string,
    request: Request,
  ) {
    const club = await this.findClubOrFail(clubId);
    const achievement = await this.achievementModel.findById(dto.achievementId);
    if (!achievement || achievement.status !== EntityStatus.ACTIVE) {
      throw new NotFoundException('Achievement not found');
    }
    const already = club.achievements.some(
      (a) => a.achievementId.toString() === dto.achievementId,
    );
    if (!already) {
      club.achievements.push({
        achievementId: new Types.ObjectId(dto.achievementId),
        grantedAt: new Date(),
        grantedBy: adminId,
      });
      club.markModified('achievements');
      await club.save();
    }
    this.audit.log({
      action: AuditAction.ACHIEVEMENT_GRANTED,
      actorId: adminId,
      metadata: { clubId, achievementId: dto.achievementId },
      request,
    });
    return this.toPublic(club);
  }

  // ── Helpers ────────────────────────────────────

  async requireOwned(jwt: JwtUser, clubId: string): Promise<ClubDocument> {
    assertCanMutateAsRole(jwt, Role.CLUB_OWNER);
    const club = await this.findClubOrFail(clubId);
    if (club.ownerId.toString() !== jwt.sub) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  async findClubOrFail(clubId: string): Promise<ClubDocument> {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(clubId);
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  private assertEditable(club: ClubDocument) {
    const status = club.review.status;
    if (
      status !== ClubLifecycleStatus.DRAFT &&
      status !== ClubLifecycleStatus.REJECTED
    ) {
      throw new ConflictException(
        `Club in status "${status}" cannot be edited until reviewed`,
      );
    }
  }

  private async createInternal(
    ownerId: string,
    dto: CreateClubDto,
    request: Request,
    actor: JwtUser,
  ) {
    if (!dto.identity?.name?.trim()) {
      throw new BadRequestException('identity.name is required');
    }
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new BadRequestException('Invalid ownerId');
    }

    const club = new this.clubModel({
      ownerId: new Types.ObjectId(ownerId),
      identity: {
        name: dto.identity.name.trim(),
        description: dto.identity.description,
        coverMediaId: dto.identity.coverMediaId
          ? new Types.ObjectId(dto.identity.coverMediaId)
          : undefined,
      },
      contact: { phones: [] },
      gallery: [],
      cancellation: { rules: [], peakRules: [] },
      equipments: [],
      amenities: [],
      categories: [],
      sports: [],
      classes: [],
      coaches: [],
      operatingHours: [],
      socials: [],
      achievements: [],
      rules: [],
      faq: [],
      reviewsSummary: {
        count: 0,
        average: 0,
        distribution: [],
        criteria: [],
      },
      review: {
        status: ClubLifecycleStatus.DRAFT,
        documentMediaIds: [],
      },
      operationalStatus: ClubOperationalStatus.ACTIVE,
    });

    await this.applyWrite(club, dto);
    await club.save();

    this.audit.log({
      action: AuditAction.CLUB_CREATED,
      actorId: actor.sub,
      metadata: { clubId: club._id.toString(), ownerId },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.CLUB_DRAFT_CREATED,
      actor: { userId: actor.sub, activeRole: actor.activeRole },
      context: { clubId: club._id },
    });

    return this.toPublic(club);
  }

  private async applyWrite(club: ClubDocument, dto: ClubWriteDto) {
    if ('identity' in dto && dto.identity) {
      if (dto.identity.name !== undefined) {
        club.identity.name = dto.identity.name.trim();
      }
      if (
        'description' in dto.identity &&
        dto.identity.description !== undefined
      ) {
        club.identity.description = dto.identity.description;
      }
      if (
        'coverMediaId' in dto.identity &&
        dto.identity.coverMediaId !== undefined
      ) {
        club.identity.coverMediaId = dto.identity.coverMediaId
          ? new Types.ObjectId(dto.identity.coverMediaId)
          : undefined;
      }
      club.markModified('identity');
    }

    if (dto.contact) {
      if (dto.contact.phones !== undefined) {
        club.contact.phones = dto.contact.phones.map((p) => ({
          number: p.number.trim(),
          label: p.label,
        }));
      }
      club.markModified('contact');
    }

    if (dto.gallery !== undefined) {
      const previousByMediaId = new Map(
        (club.gallery ?? []).map((item) => [item.mediaId.toString(), item]),
      );
      const now = new Date();
      club.gallery = dto.gallery.map((g) => {
        const previous = previousByMediaId.get(g.mediaId);
        return {
          mediaId: new Types.ObjectId(g.mediaId),
          title: g.title,
          description: g.description,
          views: previous?.views ?? 0,
          createdAt: previous?.createdAt ?? now,
        };
      });
      club.markModified('gallery');
    }

    if (dto.cancellation) {
      if (dto.cancellation.rules !== undefined) {
        club.cancellation.rules = dto.cancellation.rules;
      }
      if (dto.cancellation.peakRules !== undefined) {
        club.cancellation.peakRules = dto.cancellation.peakRules;
      }
      club.markModified('cancellation');
    }

    if (dto.equipmentIds !== undefined) {
      club.equipments = dto.equipmentIds.map((equipmentId) => ({
        equipmentId: new Types.ObjectId(equipmentId),
      }));
      club.markModified('equipments');
    }

    if (dto.amenityIds !== undefined) {
      club.amenities = dto.amenityIds.map((amenityId) => ({
        amenityId: new Types.ObjectId(amenityId),
      }));
      club.markModified('amenities');
    }

    if (dto.categoryIds !== undefined) {
      club.categories = dto.categoryIds.map((categoryId) => ({
        categoryId: new Types.ObjectId(categoryId),
      }));
      club.markModified('categories');
    }

    if (dto.sportIds !== undefined) {
      club.sports = dto.sportIds.map((sportId) => ({
        sportId: new Types.ObjectId(sportId),
      }));
      club.markModified('sports');
    }

    if (dto.classIds !== undefined) {
      club.classes = dto.classIds.map((classId) => ({
        classId: new Types.ObjectId(classId),
      }));
      club.markModified('classes');
    }

    if (dto.coachIds !== undefined) {
      club.coaches = dto.coachIds.map((coachId) => ({
        coachId: new Types.ObjectId(coachId),
      }));
      club.markModified('coaches');
    }

    if ('location' in dto && dto.location !== undefined) {
      if (dto.location === null) {
        club.location = undefined;
      } else {
        const ancestors = await this.resolveLocationAncestors(
          dto.location.locationId,
        );
        club.location = {
          address: dto.location.address.trim(),
          point: dto.location.point
            ? {
                type: 'Point',
                coordinates: [dto.location.point.lng, dto.location.point.lat],
              }
            : undefined,
          direction: dto.location.direction,
          locationId: dto.location.locationId
            ? new Types.ObjectId(dto.location.locationId)
            : undefined,
          ancestors,
        };
      }
      club.markModified('location');
    }

    if (dto.audience !== undefined) {
      if (!club.audience) {
        club.audience = {
          ageGroupKeys: [],
          levelKeys: [],
          accessibility: 'standard',
        };
      }
      if (dto.audience.genderPolicy !== undefined) {
        club.audience.genderPolicy =
          dto.audience.genderPolicy?.trim() || undefined;
      }
      if (dto.audience.ageGroupKeys !== undefined) {
        club.audience.ageGroupKeys = dto.audience.ageGroupKeys;
      }
      if (dto.audience.levelKeys !== undefined) {
        club.audience.levelKeys = dto.audience.levelKeys;
      }
      if (dto.audience.accessibility !== undefined) {
        club.audience.accessibility =
          dto.audience.accessibility.trim() || 'standard';
      }
      club.markModified('audience');
    }

    if ('parentClubId' in dto && dto.parentClubId) {
      club.parentClubId = new Types.ObjectId(dto.parentClubId);
    }

    if (dto.operatingHours !== undefined) {
      club.operatingHours = normalizeOperatingHours(dto.operatingHours);
      club.markModified('operatingHours');
    }

    if (dto.socials !== undefined) {
      club.socials = dto.socials;
      club.markModified('socials');
    }

    migrateLegacyWebsite(club, dto.socials !== undefined);

    if (dto.rules !== undefined) {
      club.rules = dto.rules;
      club.markModified('rules');
    }

    if (dto.faq !== undefined) {
      club.faq = dto.faq;
      club.markModified('faq');
    }
  }

  private async resolveLocationAncestors(
    locationId?: string,
  ): Promise<Types.ObjectId[]> {
    if (!locationId) return [];
    if (!Types.ObjectId.isValid(locationId)) {
      throw new BadRequestException('Invalid locationId');
    }
    const loc = await this.locationModel.findById(locationId);
    if (!loc) throw new BadRequestException('locationId not found');
    return [...(loc.ancestors ?? []), loc._id];
  }

  private async listInternal(query: ListClubsQueryDto) {
    const { items, total, page, pageSize } =
      await this.clubsListQuery.internal(query);
    return paginatedResult(
      await Promise.all(items.map((c) => this.toPublic(c))),
      total,
      page,
      pageSize,
    );
  }

  async recomputeReviewsSummary(clubId: string) {
    const clubOid = new Types.ObjectId(clubId);
    const approved = await this.reviewModel
      .find({ clubId: clubOid, status: ClubUserReviewStatus.APPROVED })
      .lean();

    const count = approved.length;
    const average =
      count === 0
        ? 0
        : Math.round(
            (approved.reduce((s, r) => s + r.rating, 0) / count) * 10,
          ) / 10;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: approved.filter((r) => r.rating === star).length,
    }));

    const criterionTotals = new Map<string, { sum: number; n: number }>();
    for (const r of approved) {
      for (const c of r.criteria ?? []) {
        const key = c.criterionId.toString();
        const cur = criterionTotals.get(key) ?? { sum: 0, n: 0 };
        cur.sum += c.rating;
        cur.n += 1;
        criterionTotals.set(key, cur);
      }
    }
    const criteria = [...criterionTotals.entries()].map(
      ([criterionId, { sum, n }]) => ({
        criterionId: new Types.ObjectId(criterionId),
        average: Math.round((sum / n) * 10) / 10,
      }),
    );

    await this.clubModel.updateOne(
      { _id: clubOid },
      { $set: { reviewsSummary: { count, average, distribution, criteria } } },
    );
  }

  toReviewPublic(
    review: ClubUserReview | ClubUserReviewDocument | Record<string, unknown>,
  ) {
    const r = review as ClubUserReviewDocument;
    return {
      id: r._id.toString(),
      clubId: r.clubId.toString(),
      authorId: r.authorId.toString(),
      bookingId: r.bookingId?.toString() ?? null,
      rating: r.rating,
      criteria: (r.criteria ?? []).map((c) => ({
        criterionId: c.criterionId.toString(),
        rating: c.rating,
      })),
      comment: r.comment ?? null,
      status: r.status,
      reply: r.reply
        ? {
            text: r.reply.text,
            repliedAt: r.reply.repliedAt,
            repliedBy: r.reply.repliedBy.toString(),
          }
        : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async toPublic(club: Club | ClubDocument | Record<string, unknown>) {
    const c = club as ClubDocument;
    const coachIds = (c.coaches ?? []).map((x) => x.coachId);
    const sportIds = (c.sports ?? []).map((x) => x.sportId);
    const equipmentIds = (c.equipments ?? []).map((x) => x.equipmentId);
    const amenityIds = (c.amenities ?? []).map((x) => x.amenityId);
    const categoryIds = (c.categories ?? []).map((x) => x.categoryId);
    const locationId = c.location?.locationId;
    const locationAncestorIds = c.location?.ancestors ?? [];
    const ownerId = c.ownerId;

    const refIds = [...equipmentIds, ...amenityIds, ...categoryIds];
    const locationLookupIds = [
      ...(locationId ? [locationId] : []),
      ...locationAncestorIds,
    ];

    const [coaches, sports, refs, locationDocs, owner] = await Promise.all([
      coachIds.length
        ? this.userModel.find({ _id: { $in: coachIds } })
        : Promise.resolve([] as UserDocument[]),
      sportIds.length
        ? this.sportModel.find({ _id: { $in: sportIds } }).lean()
        : Promise.resolve([]),
      refIds.length
        ? this.refModel.find({ _id: { $in: refIds } }).lean()
        : Promise.resolve([]),
      locationLookupIds.length
        ? this.locationModel.find({ _id: { $in: locationLookupIds } }).lean()
        : Promise.resolve([] as LocationLike[]),
      ownerId ? this.userModel.findById(ownerId) : Promise.resolve(null),
    ]);

    const coachById = new Map(coaches.map((u) => [u._id.toString(), u]));
    const sportById = new Map(
      sports.map((s) => [s._id.toString(), s] as const),
    );
    const refById = new Map(refs.map((r) => [r._id.toString(), r] as const));

    const toRefPublic = (id: Types.ObjectId) => {
      const item = refById.get(id.toString());
      if (!item) return { id: id.toString() };
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
    };

    const sportRelatedIds = collectSportRelatedIds(sports as SportLike[]);
    const missingSportIds = sportRelatedIds.filter(
      (id) => !sportById.has(id.toString()),
    );
    const extraSports = missingSportIds.length
      ? await this.sportModel.find({ _id: { $in: missingSportIds } }).lean()
      : [];
    const sportRelated = new Map<string, SportLike>([
      ...sports.map((s) => [s._id.toString(), s as SportLike] as const),
      ...extraSports.map((s) => [s._id.toString(), s as SportLike] as const),
    ]);

    const toClubSportPublic = (id: Types.ObjectId) => {
      const sport = sportById.get(id.toString());
      if (!sport) return { id: id.toString() };
      return toSportPublic(sport as SportLike, sportRelated);
    };

    const extraLocationIds = collectLocationRelatedIds(locationDocs).filter(
      (id) => !locationDocs.some((doc) => doc._id.toString() === id.toString()),
    );
    const extraLocations = extraLocationIds.length
      ? await this.locationModel.find({ _id: { $in: extraLocationIds } }).lean()
      : [];
    const locationRelated = new Map<string, LocationLike>([
      ...locationDocs.map((doc) => [doc._id.toString(), doc] as const),
      ...extraLocations.map(
        (doc) => [doc._id.toString(), doc as LocationLike] as const,
      ),
    ]);
    const location = locationId
      ? (locationRelated.get(locationId.toString()) ?? null)
      : null;

    return {
      id: c._id.toString(),
      ownerId: c.ownerId.toString(),
      owner: owner ? this.users.toDiscoveryPublic(owner) : null,
      parentClubId: c.parentClubId?.toString() ?? null,
      identity: {
        name: c.identity?.name,
        description: c.identity?.description ?? null,
        coverMediaId: c.identity?.coverMediaId?.toString() ?? null,
      },
      contact: {
        phones: (c.contact?.phones ?? []).map((p) => ({
          number: p.number,
          label: p.label ?? null,
        })),
      },
      gallery: (c.gallery ?? []).map((g) => ({
        mediaId: g.mediaId.toString(),
        title: g.title ?? null,
        description: g.description ?? null,
        views: g.views ?? 0,
        createdAt: (g.createdAt ?? c.createdAt ?? new Date()).toISOString(),
      })),
      cancellation: {
        rules: c.cancellation?.rules ?? [],
        peakRules: c.cancellation?.peakRules ?? [],
      },
      equipments: equipmentIds.map((id) => toRefPublic(id)),
      amenities: amenityIds.map((id) => toRefPublic(id)),
      categories: categoryIds.map((id) => toRefPublic(id)),
      sports: sportIds.map((id) => toClubSportPublic(id)),
      classes: (c.classes ?? []).map((x) => ({
        classId: x.classId.toString(),
      })),
      coaches: coachIds.map((id) => {
        const user = coachById.get(id.toString());
        return user
          ? { coachId: id.toString(), ...this.users.toDiscoveryPublic(user) }
          : { coachId: id.toString() };
      }),
      location: c.location
        ? {
            address: c.location.address,
            point: c.location.point?.coordinates
              ? {
                  lng: c.location.point.coordinates[0],
                  lat: c.location.point.coordinates[1],
                }
              : null,
            direction: c.location.direction ?? null,
            locationId: c.location.locationId?.toString() ?? null,
            ancestors: (c.location.ancestors ?? []).map((id) => {
              const doc = locationRelated.get(id.toString());
              return doc ? toLocationRef(doc) : { id: id.toString() };
            }),
            node: location ? toLocationPublic(location, locationRelated) : null,
          }
        : null,
      reviewsSummary: {
        count: c.reviewsSummary?.count ?? 0,
        average: c.reviewsSummary?.average ?? 0,
        distribution: c.reviewsSummary?.distribution ?? [],
        criteria: (c.reviewsSummary?.criteria ?? []).map((x) => ({
          criterionId: x.criterionId.toString(),
          average: x.average,
        })),
      },
      operatingHours: normalizeOperatingHours(c.operatingHours ?? []),
      socials: socialsWithLegacyWebsite(c.socials, c.contact?.website),
      achievements: (c.achievements ?? []).map((a) => ({
        achievementId: a.achievementId.toString(),
        grantedAt: a.grantedAt,
        grantedBy: a.grantedBy ?? null,
      })),
      rules: c.rules ?? [],
      faq: c.faq ?? [],
      audience: {
        genderPolicy: c.audience?.genderPolicy ?? null,
        ageGroupKeys: c.audience?.ageGroupKeys ?? [],
        levelKeys: c.audience?.levelKeys ?? [],
        accessibility: c.audience?.accessibility ?? 'standard',
      },
      review: {
        status: c.review?.status,
        submittedAt: c.review?.submittedAt ?? null,
        reviewedAt: c.review?.reviewedAt ?? null,
        reviewNote: c.review?.reviewNote ?? null,
        documentMediaIds: (c.review?.documentMediaIds ?? []).map((id) =>
          id.toString(),
        ),
      },
      operationalStatus: c.operationalStatus,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}

const SOCIAL_PLATFORM_WEBSITE = 'website';

function socialsWithLegacyWebsite(
  socials: Array<{ platform: string; url: string }> | undefined,
  legacyWebsite?: string,
) {
  const rows = [...(socials ?? [])];
  const url = legacyWebsite?.trim();
  if (!url) return rows;
  if (rows.some((row) => row.platform === SOCIAL_PLATFORM_WEBSITE)) {
    return rows;
  }
  return [...rows, { platform: SOCIAL_PLATFORM_WEBSITE, url }];
}

function migrateLegacyWebsite(club: ClubDocument, socialsReplaced: boolean) {
  const url = club.contact?.website?.trim();
  if (url && !socialsReplaced) {
    club.socials = socialsWithLegacyWebsite(club.socials, url);
    club.markModified('socials');
  }
  if (club.contact?.website !== undefined) {
    club.contact.website = undefined;
    club.markModified('contact');
  }
}

function normalizeOperatingHours(
  rows: Array<{
    weekday: number;
    status: WeekdayStatus | string;
    audience?: OperatingHourAudience | string;
    open?: string;
    close?: string;
    description?: string;
  }>,
) {
  return rows.map((row) => ({
    weekday: row.weekday,
    status:
      row.status === WeekdayStatus.CLOSED
        ? WeekdayStatus.CLOSED
        : WeekdayStatus.OPEN,
    audience:
      row.audience === OperatingHourAudience.MALE ||
      row.audience === OperatingHourAudience.FEMALE ||
      row.audience === OperatingHourAudience.SHARED
        ? row.audience
        : OperatingHourAudience.SHARED,
    open: row.open,
    close: row.close,
    description: row.description,
  }));
}
