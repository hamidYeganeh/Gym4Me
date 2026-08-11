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
  RefType,
  Role,
  UserStatus,
  WeekdayStatus,
} from '../../common/enums';
import { GamificationService } from '../../gamification/gamification.service';
import type { JwtUser } from '../../common/types';
import {
  asSinglePageResult,
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { escapeRegex } from '../../common/utils/escape-regex.util';
import { assertCanMutateAsRole } from '../../common/utils/role-assert.util';
import { Location, LocationDocument } from '../../schemas/location.schema';
import {
  ClubClass,
  ClubClassDocument,
} from '../../schemas/club-class.schema';
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

type ClubWriteDto = CreateClubDto | UpdateClubDto;

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
      throw new ConflictException(
        `Cannot submit club in status "${status}"`,
      );
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

  async adminCreate(dto: AdminCreateClubDto, adminId: string, request: Request) {
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

  async listLifecycleQueue(query: {
    status?: ClubLifecycleStatus | 'all';
    page?: number;
    limit?: number;
  }) {
    const filter: QueryFilter<ClubDocument> = {};
    if (query.status && query.status !== 'all') {
      filter['review.status'] = query.status;
    } else if (!query.status) {
      filter['review.status'] = ClubLifecycleStatus.PENDING_REVIEW;
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.clubModel
        .find(filter)
        .sort({ 'review.submittedAt': -1 })
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
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<ClubDocument> = {
      'review.status': ClubLifecycleStatus.APPROVED,
      operationalStatus: ClubOperationalStatus.ACTIVE,
      parentClubId: { $exists: false },
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
      const locOid = new Types.ObjectId(query.locationId);
      filter.$or = [
        { 'location.locationId': locOid },
        { 'location.ancestors': locOid },
      ];
    }
    if (query.direction) {
      filter['location.direction'] = query.direction;
    }
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
      if (!amenity) {
        return paginatedResult([], 0, page, pageSize);
      }
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

    const [items, total] = await Promise.all([
      this.clubModel
        .find(filter)
        .sort(useGeo ? undefined : { 'reviewsSummary.average': -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.clubModel.countDocuments(filter),
    ]);

    return paginatedResult(
      await Promise.all(items.map((c) => this.toPublic(c))),
      total,
      page,
      pageSize,
    );
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
    return this.createInternal(
      ownerId,
      { ...dto, parentClubId },
      request,
      { sub: actorId } as JwtUser,
    );
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

  async assignClass(clubId: string, dto: AssignClassDto, actorId: string, request: Request) {
    const club = await this.findClubOrFail(clubId);
    const exists = club.classes.some((c) => c.classId.toString() === dto.classId);
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

  async unassignClass(clubId: string, classId: string, actorId: string, request: Request) {
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

  async assignCoach(clubId: string, dto: AssignCoachDto, actorId: string, request: Request) {
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
    const exists = club.coaches.some((c) => c.coachId.toString() === dto.coachId);
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

  async unassignCoach(clubId: string, coachId: string, actorId: string, request: Request) {
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
    };
    if (opts.publicOnly) {
      filter.status = ClubUserReviewStatus.APPROVED;
    } else if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
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
      contact: { phones: [], website: undefined },
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
      if (dto.contact.website !== undefined) {
        club.contact.website = dto.contact.website;
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
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<ClubDocument> = {};

    if (query.ownerId) filter.ownerId = new Types.ObjectId(query.ownerId);
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
      const locOid = new Types.ObjectId(query.locationId);
      filter.$or = [
        { 'location.locationId': locOid },
        { 'location.ancestors': locOid },
      ];
    }
    if (query.direction) filter['location.direction'] = query.direction;
    if (query.lifecycleStatus) {
      filter['review.status'] = query.lifecycleStatus as ClubLifecycleStatus;
    }
    if (query.operationalStatus) {
      filter.operationalStatus =
        query.operationalStatus as ClubOperationalStatus;
    }

    const [items, total] = await Promise.all([
      this.clubModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.clubModel.countDocuments(filter),
    ]);

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

  toReviewPublic(review: ClubUserReview | ClubUserReviewDocument | Record<string, unknown>) {
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
    const ownerId = c.ownerId;

    const refIds = [...equipmentIds, ...amenityIds, ...categoryIds];

    const [coaches, sports, refs, location, owner] = await Promise.all([
      coachIds.length
        ? this.userModel.find({ _id: { $in: coachIds } })
        : Promise.resolve([] as UserDocument[]),
      sportIds.length
        ? this.sportModel.find({ _id: { $in: sportIds } }).lean()
        : Promise.resolve([]),
      refIds.length
        ? this.refModel.find({ _id: { $in: refIds } }).lean()
        : Promise.resolve([]),
      locationId
        ? this.locationModel.findById(locationId).lean()
        : Promise.resolve(null),
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

    const toSportPublic = (id: Types.ObjectId) => {
      const sport = sportById.get(id.toString());
      if (!sport) return { id: id.toString() };
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
    };

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
        website: c.contact?.website ?? null,
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
      sports: sportIds.map((id) => toSportPublic(id)),
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
            ancestors: (c.location.ancestors ?? []).map((a) => a.toString()),
            node: location
              ? {
                  id: location._id.toString(),
                  kind: location.kind,
                  name: location.name,
                  slug: location.slug,
                  flagSvg: location.flagSvg ?? null,
                  parentId: location.parentId?.toString() ?? null,
                }
              : null,
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
      socials: c.socials ?? [],
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
