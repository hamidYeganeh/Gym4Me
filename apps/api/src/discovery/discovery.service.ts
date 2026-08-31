import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type Redis from 'ioredis';
import { createHash, randomUUID } from 'node:crypto';
import { Model, Types, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { ClubSlotsService } from '../account/club-slots/club-slots.service';
import { DiscoveryCoachesService } from '../account/coaches/discovery-coaches.service';
import { REDIS } from '../common/redis/redis.module';
import {
  AuditAction,
  BannerPlacement,
  CoachSlotStatus,
  EntityStatus,
  MembershipPlanKind,
  PublishStatus,
  RefType,
  Role,
  SportKind,
} from '../common/enums';
import type { JwtUser } from '../common/types';
import { DISCOVERY_VISIBLE_CLUB_MATCH } from '../account/clubs/discovery-club-facets';
import {
  AthleteProfile,
  type AthleteProfileDocument,
} from '../schemas/athlete-profile.schema';
import { Banner, type BannerDocument } from '../schemas/banner.schema';
import { Club, type ClubDocument } from '../schemas/club.schema';
import {
  ClubClass,
  type ClubClassDocument,
} from '../schemas/club-class.schema';
import {
  ClubMembershipPlan,
  type ClubMembershipPlanDocument,
} from '../schemas/club-membership-plan.schema';
import {
  ClubSpace,
  type ClubSpaceDocument,
} from '../schemas/club-space.schema';
import {
  CoachSlot,
  type CoachSlotDocument,
} from '../schemas/coach-slot.schema';
import { RefItem, type RefItemDocument } from '../schemas/ref-item.schema';
import { Sport, type SportDocument } from '../schemas/sport.schema';
import { Article, type ArticleDocument } from '../schemas/article.schema';
import { User, type UserDocument } from '../schemas/user.schema';
import {
  DiscoveryPage,
  type DiscoveryPageDocument,
  DiscoveryPageRevision,
  type DiscoveryPageRevisionDocument,
} from '../schemas/discovery-page.schema';
import {
  DISCOVERY_DEFAULT_PAGE_SIZE,
  DISCOVERY_FEED_TTL_SECONDS,
  DISCOVERY_MAX_PAGE_SIZE,
  DISCOVERY_SCHEMA_VERSION,
  DiscoveryEmptyBehavior,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from './discovery.constants';
import { isDiscoverySectionEligible } from './discovery-targeting.policy';
import { INITIAL_DISCOVERY_HOME_SECTIONS } from './discovery.initial-sections';
import type {
  DiscoveryFeedContext,
  DiscoveryFeedSession,
  DiscoveryPersonalizationContext,
  DiscoverySectionDefinition,
} from './discovery.types';
import type {
  DiscoveryFeedQueryDto,
  DiscoveryPreviewContextDto,
  DiscoverySectionDto,
  PreviewDiscoveryDraftDto,
  UpdateDiscoveryDraftDto,
} from './dto/discovery.dto';

type ResolvedDiscoverySection = DiscoverySectionDefinition & {
  items: unknown[];
  totalCount?: number;
};

type ResolvedSource = {
  items: unknown[];
  totalCount?: number;
};

type DiscoveryCalendarResult = {
  days: Array<{
    date: string;
    items: Array<{
      slotId: string;
      kind: 'class' | 'session' | 'space';
      class: {
        id: string;
        title: string;
        media: { coverMediaId: string | null };
      } | null;
      space: {
        id: string;
        title: string;
        media: { coverMediaId: string | null };
      } | null;
      coach: {
        id: string;
        name: { first: string | null; last: string | null };
      } | null;
      startTime: string;
      endTime: string;
      capacity: number;
      remaining: number;
      price: number;
    }>;
  }>;
};

const FEED_KEY_PREFIX = 'discovery:feed:';
const SECTION_CACHE_PREFIX = 'discovery:section:';
const SECTION_CACHE_TTL_SECONDS = 60;
const DEFAULT_PAGE_KEY = 'discovery_home';

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);
  constructor(
    @InjectModel(DiscoveryPage.name)
    private readonly pageModel: Model<DiscoveryPageDocument>,
    @InjectModel(DiscoveryPageRevision.name)
    private readonly revisionModel: Model<DiscoveryPageRevisionDocument>,
    @InjectModel(AthleteProfile.name)
    private readonly athleteModel: Model<AthleteProfileDocument>,
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(ClubClass.name)
    private readonly classModel: Model<ClubClassDocument>,
    @InjectModel(ClubSpace.name)
    private readonly spaceModel: Model<ClubSpaceDocument>,
    @InjectModel(CoachSlot.name)
    private readonly coachSlotModel: Model<CoachSlotDocument>,
    @InjectModel(ClubMembershipPlan.name)
    private readonly membershipPlanModel: Model<ClubMembershipPlanDocument>,
    @InjectModel(RefItem.name)
    private readonly refModel: Model<RefItemDocument>,
    @InjectModel(Sport.name)
    private readonly sportModel: Model<SportDocument>,
    @InjectModel(Article.name)
    private readonly articleModel: Model<ArticleDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly audit: AuditService,
    private readonly coaches: DiscoveryCoachesService,
    private readonly clubSlots: ClubSlotsService,
  ) {}

  async getFeed(query: DiscoveryFeedQueryDto, user?: JwtUser | null) {
    const page = query.page ?? 1;
    const pageSize = Math.min(
      query.page_size ?? DISCOVERY_DEFAULT_PAGE_SIZE,
      DISCOVERY_MAX_PAGE_SIZE,
    );
    const pageKey = query.page_key ?? DEFAULT_PAGE_KEY;
    const subject = user?.sub ?? 'guest';

    let token = query.feed_token;
    let session: DiscoveryFeedSession;
    if (token) {
      session = await this.readFeedSession(token);
      if (session.subject !== subject || session.pageKey !== pageKey) {
        throw new BadRequestException('feed_token does not match this feed');
      }
    } else {
      if (page > 1) {
        throw new BadRequestException('feed_token is required after page 1');
      }
      session = await this.createFeedSession(pageKey, user, {
        lat: query.lat,
        lng: query.lng,
        locationId: query.locationId,
      });
      token = randomUUID();
      await this.redis.set(
        `${FEED_KEY_PREFIX}${token}`,
        JSON.stringify(session),
        'EX',
        DISCOVERY_FEED_TTL_SECONDS,
      );
    }

    return this.resolveSessionPage(session, token, page, pageSize);
  }

  async adminList() {
    const pages = await this.pageModel.find().sort({ updatedAt: -1 }).lean();
    if (pages.length === 0) return [];
    return pages.map((page) => this.toAdminPage(page));
  }

  async adminGet(pageKey: string) {
    const page = await this.pageModel.findOne({ pageKey }).lean();
    if (!page) return this.defaultAdminPage(pageKey);
    const result = this.toAdminPage(page);
    if (
      pageKey !== DEFAULT_PAGE_KEY ||
      Number(page.schemaVersion) >= DISCOVERY_SCHEMA_VERSION
    ) {
      return result;
    }
    const base = result.draftSections.length
      ? result.draftSections
      : result.publishedSections;
    const installedKinds = new Set(base.map((section) => section.kind));
    const addedKinds = new Set<DiscoverySectionKind>([
      DiscoverySectionKind.COACHES,
      DiscoverySectionKind.CLASSES,
      DiscoverySectionKind.SPACES,
      DiscoverySectionKind.SLOTS,
      DiscoverySectionKind.EQUIPMENT,
      DiscoverySectionKind.MEMBERSHIP_PLANS,
      DiscoverySectionKind.BOOKABLE_OFFERS,
      DiscoverySectionKind.AMENITIES,
    ]);
    const additions = INITIAL_DISCOVERY_HOME_SECTIONS.filter(
      (section) =>
        addedKinds.has(section.kind) && !installedKinds.has(section.kind),
    );
    return {
      ...result,
      schemaVersion: DISCOVERY_SCHEMA_VERSION,
      draftSections: [...base, ...this.asDefinitions(additions)],
    };
  }

  async updateDraft(
    pageKey: string,
    dto: UpdateDiscoveryDraftDto,
    adminId: string,
    request: Request,
  ) {
    const sections = this.normalizeSections(dto.sections);
    const page = await this.pageModel.findOneAndUpdate(
      { pageKey },
      {
        $set: {
          schemaVersion: DISCOVERY_SCHEMA_VERSION,
          draftSections: sections,
          updatedBy: new Types.ObjectId(adminId),
        },
        $setOnInsert: { publishedSections: [], publishedRevision: 0 },
      },
      { returnDocument: 'after', upsert: true },
    );
    this.audit.log({
      action: AuditAction.DISCOVERY_PAGE_DRAFT_UPDATED,
      actorId: adminId,
      metadata: { pageKey, sectionCount: sections.length },
      request,
    });
    return this.toAdminPage(page.toObject());
  }

  async previewDraft(pageKey: string, dto: PreviewDiscoveryDraftDto) {
    const page = await this.pageModel.findOne({ pageKey }).lean();
    const sections = this.asDefinitions(
      page?.draftSections?.length ? page.draftSections : [],
    );
    const personalization = this.previewPersonalization(dto.context);
    const eligible = sections.filter((section) =>
      isDiscoverySectionEligible(section, personalization),
    );
    const session: DiscoveryFeedSession = {
      pageKey,
      subject: 'admin-preview',
      revision: page?.publishedRevision ?? 0,
      schemaVersion: page?.schemaVersion ?? DISCOVERY_SCHEMA_VERSION,
      sections: eligible,
      personalization,
      context: {
        lat: dto.context?.lat,
        lng: dto.context?.lng,
        locationId: dto.context?.locationId,
      },
      createdAt: new Date().toISOString(),
    };
    return this.resolveSessionPage(
      session,
      'admin-preview',
      dto.page ?? 1,
      Math.min(
        dto.page_size ?? DISCOVERY_DEFAULT_PAGE_SIZE,
        DISCOVERY_MAX_PAGE_SIZE,
      ),
    );
  }

  async publish(pageKey: string, adminId: string, request: Request) {
    const page = await this.requirePage(pageKey);
    const sections = this.normalizeSections(
      page.draftSections as unknown as DiscoverySectionDto[],
    );
    const revision = page.publishedRevision + 1;
    const publishedAt = new Date();

    await this.revisionModel.create({
      pageKey,
      revision,
      schemaVersion: DISCOVERY_SCHEMA_VERSION,
      sections,
      publishedBy: new Types.ObjectId(adminId),
      publishedAt,
    });
    page.publishedSections = sections as never;
    page.publishedRevision = revision;
    page.publishedAt = publishedAt;
    page.updatedBy = new Types.ObjectId(adminId);
    await page.save();

    this.audit.log({
      action: AuditAction.DISCOVERY_PAGE_PUBLISHED,
      actorId: adminId,
      metadata: { pageKey, revision, sectionCount: sections.length },
      request,
    });
    return this.toAdminPage(page.toObject());
  }

  async rollback(
    pageKey: string,
    targetRevision: number,
    adminId: string,
    request: Request,
  ) {
    const target = await this.revisionModel
      .findOne({ pageKey, revision: targetRevision })
      .lean();
    if (!target) throw new NotFoundException('Discovery revision not found');
    const page = await this.requirePage(pageKey);
    page.draftSections = target.sections;
    await page.save();
    const published = await this.publish(pageKey, adminId, request);
    this.audit.log({
      action: AuditAction.DISCOVERY_PAGE_ROLLED_BACK,
      actorId: adminId,
      metadata: {
        pageKey,
        sourceRevision: targetRevision,
        newRevision: published.publishedRevision,
      },
      request,
    });
    return published;
  }

  private async createFeedSession(
    pageKey: string,
    user: JwtUser | null | undefined,
    context: DiscoveryFeedContext,
  ): Promise<DiscoveryFeedSession> {
    const page = await this.pageModel.findOne({ pageKey }).lean();
    const sections = this.asDefinitions(
      page?.publishedSections?.length ? page.publishedSections : [],
    );
    const personalization = await this.personalizationFor(user);
    return {
      pageKey,
      subject: user?.sub ?? 'guest',
      revision: page?.publishedRevision ?? 0,
      schemaVersion: page?.schemaVersion ?? DISCOVERY_SCHEMA_VERSION,
      sections: sections.filter((section) =>
        isDiscoverySectionEligible(section, personalization),
      ),
      personalization,
      context,
      createdAt: new Date().toISOString(),
    };
  }

  private async readFeedSession(token: string): Promise<DiscoveryFeedSession> {
    const raw = await this.redis.get(`${FEED_KEY_PREFIX}${token}`);
    if (!raw) throw new BadRequestException('feed_token expired or invalid');
    await this.redis.expire(
      `${FEED_KEY_PREFIX}${token}`,
      DISCOVERY_FEED_TTL_SECONDS,
    );
    return JSON.parse(raw) as DiscoveryFeedSession;
  }

  private async resolveSessionPage(
    session: DiscoveryFeedSession,
    token: string,
    page: number,
    pageSize: number,
  ) {
    const start = (page - 1) * pageSize;
    const definitions = session.sections.slice(start, start + pageSize);
    const resolved = await Promise.all(
      definitions.map((section) =>
        this.resolveSection(section, session).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Discovery section failed: page=${session.pageKey} revision=${session.revision} id=${section.id} kind=${section.kind} strategy=${section.source.strategy}: ${message}`,
            error instanceof Error ? error.stack : undefined,
          );
          return null;
        }),
      ),
    );
    const result = resolved.filter(
      (section): section is ResolvedDiscoverySection => section !== null,
    );
    const hasMore = start + pageSize < session.sections.length;

    return {
      meta: {
        page_key: session.pageKey,
        schema_version: session.schemaVersion,
        revision: session.revision,
        feed_token: token,
        personalized:
          session.personalization.authenticated &&
          session.personalization.activeRole === Role.ATHLETE,
        generated_at: session.createdAt,
        cache_ttl_seconds: DISCOVERY_FEED_TTL_SECONDS,
      },
      pagination: {
        page,
        page_size: pageSize,
        next: hasMore ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
        has_more: hasMore,
        count: session.sections.length,
      },
      result,
    };
  }

  private async resolveSection(
    section: DiscoverySectionDefinition,
    session: DiscoveryFeedSession,
  ): Promise<ResolvedDiscoverySection | null> {
    const cacheKey = this.sectionCacheKey(section, session);
    let source: ResolvedSource | null = null;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) source = JSON.parse(cached) as ResolvedSource;
    } catch {
      source = null;
    }
    source ??= await this.resolveSource(section, session);
    if (
      source.items.length === 0 &&
      section.emptyBehavior === DiscoveryEmptyBehavior.FALLBACK &&
      section.fallback
    ) {
      source = await this.resolveSource(
        {
          ...section,
          source: {
            ...section.source,
            strategy: section.fallback.strategy,
            filters: section.fallback.filters,
            sort: section.fallback.sort,
          },
        },
        session,
      );
    }
    try {
      await this.redis.set(
        cacheKey,
        JSON.stringify(source),
        'EX',
        SECTION_CACHE_TTL_SECONDS,
      );
    } catch {
      // Discovery data remains available when the shared cache is degraded.
    }
    if (
      source.items.length === 0 &&
      section.emptyBehavior !== DiscoveryEmptyBehavior.SHOW_EMPTY
    ) {
      return null;
    }
    return { ...section, items: source.items, totalCount: source.totalCount };
  }

  private resolveSource(
    section: DiscoverySectionDefinition,
    session: DiscoveryFeedSession,
  ): Promise<ResolvedSource> {
    switch (section.kind) {
      case DiscoverySectionKind.BANNERS:
        return this.resolveBanners(section);
      case DiscoverySectionKind.CLUB_CATEGORIES:
        return this.resolveClubCategories(section);
      case DiscoverySectionKind.SPORT_CATEGORIES:
        return this.resolveSports(section, SportKind.CATEGORY);
      case DiscoverySectionKind.SPORTS:
        return this.resolveSports(section, SportKind.SPORT);
      case DiscoverySectionKind.CLUBS:
        return this.resolveClubs(section, session);
      case DiscoverySectionKind.COACHES:
        return this.resolveCoaches(section, session);
      case DiscoverySectionKind.CLASSES:
        return this.resolveClasses(section, session);
      case DiscoverySectionKind.SPACES:
        return this.resolveSpaces(section, session);
      case DiscoverySectionKind.SLOTS:
        return this.resolveSlotCards(section, session, true);
      case DiscoverySectionKind.EQUIPMENT:
        return this.resolveRefFacet(section, RefType.EQUIPMENT, 'equipment');
      case DiscoverySectionKind.MEMBERSHIP_PLANS:
        return this.resolveMembershipPlans(section);
      case DiscoverySectionKind.BOOKABLE_OFFERS:
        return this.resolveSlotCards(section, session, true);
      case DiscoverySectionKind.AMENITIES:
        return this.resolveRefFacet(section, RefType.AMENITY, 'amenities');
      case DiscoverySectionKind.ARTICLES:
        return this.resolveArticles(section);
      default:
        return Promise.resolve({ items: [] });
    }
  }

  private async resolveBanners(
    section: DiscoverySectionDefinition,
  ): Promise<ResolvedSource> {
    const now = new Date();
    const placement = (this.stringFilter(section, 'placement') ??
      BannerPlacement.DISCOVERY_HOME) as BannerPlacement;
    const banners = await this.bannerModel
      .find({
        placement,
        publishStatus: PublishStatus.PUBLISHED,
        $and: [
          {
            $or: [
              { 'schedule.startsAt': { $exists: false } },
              { 'schedule.startsAt': null },
              { 'schedule.startsAt': { $lte: now } },
            ],
          },
          {
            $or: [
              { 'schedule.endsAt': { $exists: false } },
              { 'schedule.endsAt': null },
              { 'schedule.endsAt': { $gte: now } },
            ],
          },
        ],
      })
      .sort({ order: 1, updatedAt: -1 })
      .limit(section.source.limit)
      .lean();
    return {
      items: banners.map((banner) => ({
        id: banner._id.toString(),
        placement: banner.placement,
        slides: banner.slides.map((slide) => ({
          mediaId: slide.mediaId.toString(),
          linkKind: slide.linkKind,
          linkUrl: slide.linkUrl ?? null,
          alt: slide.alt ?? null,
          ratio: slide.ratio,
          radius: slide.radius,
          gradient: slide.gradient,
          title: slide.title ?? null,
          action: slide.action ?? null,
        })),
      })),
    };
  }

  private async resolveClubCategories(
    section: DiscoverySectionDefinition,
  ): Promise<ResolvedSource> {
    const refs = await this.refModel
      .find({ type: RefType.CLUB_CATEGORY, isActive: true })
      .sort({ order: 1, name: 1 })
      .limit(section.source.limit)
      .lean();
    const counts = await this.clubModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: DISCOVERY_VISIBLE_CLUB_MATCH },
      { $unwind: '$categories' },
      { $group: { _id: '$categories.categoryId', count: { $sum: 1 } } },
    ]);
    const byId = new Map(counts.map((row) => [row._id.toString(), row.count]));
    return {
      items: refs.map((item) => ({
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
        count: byId.get(item._id.toString()) ?? 0,
      })),
    };
  }

  private async resolveSports(
    section: DiscoverySectionDefinition,
    kind: SportKind,
  ): Promise<ResolvedSource> {
    const items = await this.sportModel
      .find({ kind, isActive: true })
      .sort({ order: 1, name: 1 })
      .limit(section.source.limit)
      .lean();
    return {
      items: items.map((item) => ({
        id: item._id.toString(),
        kind: item.kind,
        name: item.name,
        slug: item.slug,
        description: item.description ?? null,
        icon: item.icon ?? null,
        coverMediaId: item.coverMediaId?.toString() ?? null,
        parentId: item.parentId?.toString() ?? null,
        ancestors: item.ancestors.map((id) => id.toString()),
        order: item.order,
        isActive: item.isActive,
      })),
    };
  }

  private async resolveClubs(
    section: DiscoverySectionDefinition,
    session: DiscoveryFeedSession,
  ): Promise<ResolvedSource> {
    const filter: QueryFilter<ClubDocument> = {
      ...DISCOVERY_VISIBLE_CLUB_MATCH,
    };
    const strategy = section.source.strategy;
    const sourceSport = this.stringFilter(section, 'sportId');
    const recommendedSport =
      strategy === DiscoverySourceStrategy.RECOMMENDED_FOR_USER
        ? session.personalization.sportIds[0]
        : undefined;
    const sportId = await this.resolveSportId(sourceSport ?? recommendedSport);
    if (sportId) filter['sports.sportId'] = sportId;

    const categoryId = this.stringFilter(section, 'categoryId');
    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      filter['categories.categoryId'] = new Types.ObjectId(categoryId);
    }
    const locationId =
      this.stringFilter(section, 'locationId') ?? session.context.locationId;
    if (locationId && Types.ObjectId.isValid(locationId)) {
      const oid = new Types.ObjectId(locationId);
      filter.$or = [
        { 'location.locationId': oid },
        { 'location.ancestors': oid },
      ];
    }
    const minRating = this.numberFilter(section, 'minRating');
    if (minRating !== undefined) {
      filter['reviewsSummary.average'] = { $gte: minRating };
    }
    const genderPolicy = this.stringFilter(section, 'genderPolicy');
    if (genderPolicy) filter['audience.genderPolicy'] = genderPolicy;

    const useGeo =
      strategy === DiscoverySourceStrategy.NEARBY &&
      session.context.lng !== undefined &&
      session.context.lat !== undefined;
    if (strategy === DiscoverySourceStrategy.NEARBY && !useGeo) {
      return { items: [] };
    }
    if (useGeo) {
      filter['location.point'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [session.context.lng!, session.context.lat!],
          },
          $maxDistance: this.numberFilter(section, 'radiusMeters') ?? 10_000,
        },
      };
    }

    const query = this.clubModel
      .find(filter)
      .select({
        identity: 1,
        gallery: { $slice: 1 },
        location: 1,
        reviewsSummary: 1,
        operationalStatus: 1,
        sports: 1,
        amenities: 1,
      })
      .limit(section.source.limit)
      .lean();
    if (!useGeo) query.sort({ 'reviewsSummary.average': -1, createdAt: -1 });
    const clubs = await query;
    const amenityIds = clubs.flatMap((club) =>
      (club.amenities ?? []).map((entry) => entry.amenityId),
    );
    const amenities = amenityIds.length
      ? await this.refModel
          .find({ _id: { $in: amenityIds } })
          .select({ name: 1 })
          .lean()
      : [];
    const amenityNames = new Map(
      amenities.map((item) => [item._id.toString(), item.name]),
    );
    const clubIds = clubs.map((club) => club._id);
    const plans = clubIds.length
      ? await this.membershipPlanModel
          .find({
            clubId: { $in: clubIds },
            status: EntityStatus.ACTIVE,
            publishStatus: PublishStatus.PUBLISHED,
          })
          .select({ clubId: 1, 'pricing.amount': 1 })
          .lean()
      : [];
    const startingPriceByClub = new Map<string, number>();
    for (const plan of plans) {
      const clubId = plan.clubId.toString();
      const current = startingPriceByClub.get(clubId);
      if (current === undefined || plan.pricing.amount < current) {
        startingPriceByClub.set(clubId, plan.pricing.amount);
      }
    }

    return {
      items: clubs.map((club) => ({
        id: club._id.toString(),
        name: club.identity.name,
        coverMediaId: club.identity.coverMediaId?.toString() ?? null,
        galleryMediaId: club.gallery?.[0]?.mediaId?.toString() ?? null,
        address: club.location?.address ?? null,
        rating: club.reviewsSummary?.average ?? 0,
        reviewCount: club.reviewsSummary?.count ?? 0,
        operationalStatus: club.operationalStatus,
        sportIds: (club.sports ?? []).map((entry) => entry.sportId.toString()),
        amenityNames: (club.amenities ?? [])
          .map((entry) => amenityNames.get(entry.amenityId.toString()))
          .filter((name): name is string => Boolean(name))
          .slice(0, 3),
        startingPriceAmount: startingPriceByClub.get(club._id.toString()) ?? null,
      })),
    };
  }

  private async resolveCoaches(
    section: DiscoverySectionDefinition,
    session: DiscoveryFeedSession,
  ): Promise<ResolvedSource> {
    const strategy = section.source.strategy;
    const sourceSport = this.stringFilter(section, 'sportId');
    const sportId =
      sourceSport ??
      (strategy === DiscoverySourceStrategy.RECOMMENDED_FOR_USER
        ? session.personalization.sportIds[0]
        : undefined);
    const cityId =
      this.stringFilter(section, 'locationId') ?? session.context.locationId;
    if (
      strategy === DiscoverySourceStrategy.NEARBY &&
      (!cityId || !Types.ObjectId.isValid(cityId))
    ) {
      return { items: [], totalCount: 0 };
    }
    const page = await this.coaches.list({
      page: 1,
      page_size: Math.max(section.source.limit, 12),
      sportId: sportId && Types.ObjectId.isValid(sportId) ? sportId : undefined,
      cityId:
        strategy === DiscoverySourceStrategy.NEARBY &&
        cityId &&
        Types.ObjectId.isValid(cityId)
          ? cityId
          : undefined,
    });
    let items = page.result;
    if (strategy === DiscoverySourceStrategy.AVAILABLE && items.length) {
      const coachIds = items.map((item) => new Types.ObjectId(item.userId));
      const available = await this.coachSlotModel
        .distinct('coachUserId', {
          coachUserId: { $in: coachIds },
          status: CoachSlotStatus.OPEN,
          startsAt: { $gt: new Date() },
        })
        .then((ids) => new Set(ids.map((id) => id.toString())));
      items = items.filter((item) => available.has(item.userId));
    }
    return {
      items: items.slice(0, section.source.limit),
      totalCount: page.pagination.total,
    };
  }

  private async resolveClasses(
    section: DiscoverySectionDefinition,
    session: DiscoveryFeedSession,
  ): Promise<ResolvedSource> {
    const strategy = section.source.strategy;
    let occurrenceClassIds: string[] | undefined;
    if (
      strategy === DiscoverySourceStrategy.TODAY ||
      strategy === DiscoverySourceStrategy.STARTING_SOON ||
      strategy === DiscoverySourceStrategy.CAPACITY_AVAILABLE
    ) {
      const occurrenceSource = await this.resolveSlotCards(
        {
          ...section,
          source: {
            ...section.source,
            filters: { ...section.source.filters, kind: 'class' },
            strategy:
              strategy === DiscoverySourceStrategy.TODAY
                ? DiscoverySourceStrategy.TODAY
                : DiscoverySourceStrategy.AVAILABLE,
            limit: 12,
          },
        },
        session,
        true,
      );
      occurrenceClassIds = occurrenceSource.items
        .filter((item) => (item as { kind?: string }).kind === 'class')
        .map((item) => (item as { resourceId: string }).resourceId)
        .filter(Boolean);
      if (occurrenceClassIds.length === 0) return { items: [], totalCount: 0 };
    }

    const clubs = await this.visibleClubs(section.source.limit * 4);
    const clubById = new Map(
      clubs.map((club) => [club._id.toString(), club.identity?.name ?? '']),
    );
    const filter: QueryFilter<ClubClassDocument> = {
      clubId: { $in: clubs.map((club) => club._id) },
      status: EntityStatus.ACTIVE,
    };
    if (occurrenceClassIds) {
      filter._id = {
        $in: occurrenceClassIds.map((id) => new Types.ObjectId(id)),
      };
    }
    const sportId = await this.resolveSportId(
      this.stringFilter(section, 'sportId') ??
        (strategy === DiscoverySourceStrategy.RECOMMENDED_FOR_USER
          ? session.personalization.sportIds[0]
          : undefined),
    );
    if (sportId) filter.sportId = sportId;
    if (strategy === DiscoverySourceStrategy.BEGINNER_FRIENDLY) {
      filter.$or = [
        { title: { $regex: /مبتدی|beginner/i } },
        { description: { $regex: /مبتدی|beginner/i } },
      ];
    }
    const docs = await this.classModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(section.source.limit)
      .lean();
    const order = new Map(
      (occurrenceClassIds ?? []).map((id, index) => [id, index]),
    );
    if (occurrenceClassIds) {
      docs.sort(
        (a, b) =>
          (order.get(a._id.toString()) ?? Number.MAX_SAFE_INTEGER) -
          (order.get(b._id.toString()) ?? Number.MAX_SAFE_INTEGER),
      );
    }
    return {
      items: docs.map((doc) => ({
        id: doc._id.toString(),
        clubId: doc.clubId.toString(),
        title: doc.title,
        description: doc.description ?? null,
        sportId: doc.sportId?.toString() ?? null,
        coachId: doc.coachId?.toString() ?? null,
        coach: null,
        media: { coverMediaId: doc.media?.coverMediaId?.toString() ?? null },
        status: doc.status,
        club: {
          id: doc.clubId.toString(),
          name: clubById.get(doc.clubId.toString()) ?? '',
          coverMediaId: null,
        },
      })),
    };
  }

  private async resolveSpaces(
    section: DiscoverySectionDefinition,
    session: DiscoveryFeedSession,
  ): Promise<ResolvedSource> {
    const clubs = await this.visibleClubs(section.source.limit * 4);
    const clubById = new Map(
      clubs.map((club) => [club._id.toString(), club.identity?.name ?? '']),
    );
    const filter: QueryFilter<ClubSpaceDocument> = {
      clubId: { $in: clubs.map((club) => club._id) },
      status: EntityStatus.ACTIVE,
    };
    const sportId = await this.resolveSportId(
      this.stringFilter(section, 'sportId') ??
        (section.source.strategy ===
        DiscoverySourceStrategy.RECOMMENDED_FOR_USER
          ? session.personalization.sportIds[0]
          : undefined),
    );
    if (sportId) filter.sportId = sportId;
    const docs = await this.spaceModel
      .find(filter)
      .sort({
        createdAt:
          section.source.strategy === DiscoverySourceStrategy.LATEST ? -1 : 1,
      })
      .limit(section.source.limit)
      .lean();
    return {
      items: docs.map((doc) => ({
        id: doc._id.toString(),
        clubId: doc.clubId.toString(),
        clubName: clubById.get(doc.clubId.toString()) ?? '',
        title: doc.title,
        description: doc.description ?? null,
        sportId: doc.sportId?.toString() ?? null,
        coverMediaId: doc.media?.coverMediaId?.toString() ?? null,
      })),
    };
  }

  private async resolveSlotCards(
    section: DiscoverySectionDefinition,
    _session: DiscoveryFeedSession,
    bookableOnly: boolean,
  ): Promise<ResolvedSource> {
    const today = this.tehranDate();
    const strategy = section.source.strategy;
    const from =
      strategy === DiscoverySourceStrategy.TOMORROW
        ? this.addIsoDays(today, 1)
        : today;
    const to =
      strategy === DiscoverySourceStrategy.TODAY
        ? today
        : strategy === DiscoverySourceStrategy.TOMORROW
          ? from
          : this.addIsoDays(today, 7);
    const clubs = await this.visibleClubs(
      Math.max(12, section.source.limit * 3),
    );
    const calendars: Array<{
      club: (typeof clubs)[number];
      calendar: DiscoveryCalendarResult;
    } | null> = [];
    const calendarConcurrency = 6;
    for (let index = 0; index < clubs.length; index += calendarConcurrency) {
      const batch = clubs.slice(index, index + calendarConcurrency);
      calendars.push(
        ...(await Promise.all(
          batch.map(async (club) => {
            try {
              const calendar = (await this.clubSlots.getCalendar(
                club._id.toString(),
                { from, to },
              )) as unknown as DiscoveryCalendarResult;
              return { club, calendar };
            } catch {
              return null;
            }
          }),
        )),
      );
    }
    const now = new Date();
    let items = calendars.flatMap((entry) => {
      if (!entry) return [];
      return entry.calendar.days.flatMap((day) =>
        day.items.map((occurrence) => {
          const resource = occurrence.class ?? occurrence.space;
          const coachName = occurrence.coach
            ? [occurrence.coach.name.first, occurrence.coach.name.last]
                .filter(Boolean)
                .join(' ')
            : '';
          const title = resource?.title ?? (coachName || 'سانس آزاد باشگاه');
          return {
            id: `${occurrence.slotId}:${day.date}`,
            slotId: occurrence.slotId,
            clubId: entry.club._id.toString(),
            clubName: entry.club.identity?.name ?? '',
            kind: occurrence.kind,
            resourceId: resource?.id ?? occurrence.coach?.id ?? null,
            title,
            coverMediaId: resource?.media.coverMediaId ?? null,
            date: day.date,
            startTime: occurrence.startTime,
            endTime: occurrence.endTime,
            capacity: occurrence.capacity,
            remaining: occurrence.remaining,
            price: occurrence.price,
            currency: 'IRT' as const,
          };
        }),
      );
    });
    items = items.filter((item) => {
      const startsAt = new Date(`${item.date}T${item.startTime}:00+03:30`);
      const kind = this.stringFilter(section, 'kind');
      return (
        startsAt > now &&
        (!kind || item.kind === kind) &&
        (!bookableOnly || item.remaining > 0)
      );
    });
    if (
      strategy === DiscoverySourceStrategy.LEAST_CROWDED ||
      strategy === DiscoverySourceStrategy.CAPACITY_AVAILABLE
    ) {
      items.sort((a, b) => b.remaining / b.capacity - a.remaining / a.capacity);
    } else {
      items.sort((a, b) =>
        `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
      );
    }
    return {
      items: items.slice(0, section.source.limit),
      totalCount: items.length,
    };
  }

  private async resolveRefFacet(
    section: DiscoverySectionDefinition,
    type: RefType,
    clubField: 'equipment' | 'amenities',
  ): Promise<ResolvedSource> {
    const refField = clubField === 'equipment' ? 'equipmentId' : 'amenityId';
    const counts = await this.clubModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: DISCOVERY_VISIBLE_CLUB_MATCH },
      { $unwind: `$${clubField}` },
      { $group: { _id: `$${clubField}.${refField}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const countById = new Map(
      counts.map((entry) => [entry._id.toString(), entry.count]),
    );
    const refs = await this.refModel
      .find({ type, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    refs.sort(
      (a, b) =>
        (countById.get(b._id.toString()) ?? 0) -
        (countById.get(a._id.toString()) ?? 0),
    );
    return {
      items: refs.slice(0, section.source.limit).map((item) => ({
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
        count: countById.get(item._id.toString()) ?? 0,
      })),
    };
  }

  private async resolveMembershipPlans(
    section: DiscoverySectionDefinition,
  ): Promise<ResolvedSource> {
    const clubs = await this.visibleClubs(section.source.limit * 4);
    const clubById = new Map(
      clubs.map((club) => [club._id.toString(), club.identity?.name ?? '']),
    );
    const filter: QueryFilter<ClubMembershipPlanDocument> = {
      clubId: { $in: clubs.map((club) => club._id) },
      status: EntityStatus.ACTIVE,
      publishStatus: PublishStatus.PUBLISHED,
    };
    if (section.source.strategy === DiscoverySourceStrategy.UNLIMITED) {
      filter.kind = MembershipPlanKind.DURATION;
    } else if (section.source.strategy === DiscoverySourceStrategy.DURATION) {
      filter.kind = MembershipPlanKind.DURATION;
    } else if (section.source.strategy === DiscoverySourceStrategy.SESSIONS) {
      filter.kind = MembershipPlanKind.SESSIONS;
    } else if (section.source.strategy === DiscoverySourceStrategy.ENTRIES) {
      filter.kind = MembershipPlanKind.ENTRIES;
    }
    const query = this.membershipPlanModel
      .find(filter)
      .limit(section.source.limit);
    if (section.source.strategy === DiscoverySourceStrategy.ECONOMICAL) {
      query.sort({ 'pricing.amount': 1 });
    } else {
      query.sort({ createdAt: -1 });
    }
    const plans = await query.lean();
    return {
      items: plans.map((plan) => ({
        id: plan._id.toString(),
        clubId: plan.clubId.toString(),
        clubName: clubById.get(plan.clubId.toString()) ?? '',
        name: plan.name,
        description: plan.description ?? null,
        kind: plan.kind,
        amount: plan.pricing.amount,
        currency: plan.pricing.currency,
        durationDays: plan.durationDays ?? null,
        sessionsTotal: plan.sessionsTotal ?? null,
        entriesTotal: plan.entriesTotal ?? null,
      })),
    };
  }

  private async resolveArticles(
    section: DiscoverySectionDefinition,
  ): Promise<ResolvedSource> {
    const articles = await this.articleModel
      .find({ publishStatus: PublishStatus.PUBLISHED })
      .select({
        title: 1,
        slug: 1,
        excerpt: 1,
        taxonomy: 1,
        coverMediaId: 1,
        publishedAt: 1,
        readingTimeMinutes: 1,
        authorId: 1,
        createdAt: 1,
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(section.source.limit)
      .lean();
    const authorIds = articles.flatMap((item) =>
      item.authorId ? [item.authorId] : [],
    );
    const authors = authorIds.length
      ? await this.userModel
          .find({ _id: { $in: authorIds } })
          .select({ name: 1 })
          .lean()
      : [];
    const authorNames = new Map(
      authors.map((author) => [
        author._id.toString(),
        [author.name.first, author.name.last].filter(Boolean).join(' ') ||
          'Gym4Me',
      ]),
    );
    return {
      items: articles.map((article) => ({
        id: article._id.toString(),
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt ?? null,
        taxonomy: article.taxonomy,
        coverMediaId: article.coverMediaId?.toString() ?? null,
        publishedAt: article.publishedAt?.toISOString() ?? null,
        createdAt: article.createdAt.toISOString(),
        readingTimeMinutes: article.readingTimeMinutes,
        authorName: article.authorId
          ? (authorNames.get(article.authorId.toString()) ?? 'Gym4Me')
          : 'Gym4Me',
      })),
    };
  }

  private async personalizationFor(
    user?: JwtUser | null,
  ): Promise<DiscoveryPersonalizationContext> {
    if (!user) {
      return { authenticated: false, sportIds: [], goalKeys: [] };
    }
    if (user.activeRole !== Role.ATHLETE) {
      return {
        authenticated: true,
        activeRole: user.activeRole,
        sportIds: [],
        goalKeys: [],
      };
    }
    const profile = await this.athleteModel
      .findOne({ userId: user.sub })
      .lean();
    return {
      authenticated: true,
      activeRole: user.activeRole,
      sportIds: profile?.sportIds ?? [],
      goalKeys: profile?.goalKeys ?? [],
      levelKey: profile?.levelKey,
    };
  }

  private previewPersonalization(
    context?: DiscoveryPreviewContextDto,
  ): DiscoveryPersonalizationContext {
    return {
      authenticated: context?.authenticated ?? false,
      activeRole: context?.activeRole,
      sportIds: context?.sportIds ?? [],
      goalKeys: context?.goalKeys ?? [],
      levelKey: context?.levelKey,
    };
  }

  private normalizeSections(
    sections: DiscoverySectionDto[],
  ): DiscoverySectionDefinition[] {
    const ids = new Set<string>();
    return sections.map((section) => {
      if (ids.has(section.id)) {
        throw new BadRequestException(
          `Duplicate discovery section id: ${section.id}`,
        );
      }
      ids.add(section.id);
      this.assertSupportedSource(section.kind, section.source.strategy);
      if (section.fallback) {
        this.assertSupportedSource(section.kind, section.fallback.strategy);
      }
      const renderers: Record<DiscoverySectionKind, string> = {
        [DiscoverySectionKind.BANNERS]: 'banner_carousel',
        [DiscoverySectionKind.CLUB_CATEGORIES]: 'club_category_grid',
        [DiscoverySectionKind.SPORT_CATEGORIES]: 'sport_category_rail',
        [DiscoverySectionKind.SPORTS]: 'sport_rail',
        [DiscoverySectionKind.CLUBS]: 'club_rail',
        [DiscoverySectionKind.COACHES]: 'coach_rail',
        [DiscoverySectionKind.CLASSES]: 'class_rail',
        [DiscoverySectionKind.SPACES]: 'space_rail',
        [DiscoverySectionKind.SLOTS]: 'slot_rail',
        [DiscoverySectionKind.EQUIPMENT]: 'equipment_grid',
        [DiscoverySectionKind.MEMBERSHIP_PLANS]: 'membership_plan_rail',
        [DiscoverySectionKind.BOOKABLE_OFFERS]: 'bookable_offer_rail',
        [DiscoverySectionKind.AMENITIES]: 'amenity_rail',
        [DiscoverySectionKind.ARTICLES]: 'article_rail',
      };
      if (section.presentation.component !== renderers[section.kind]) {
        throw new BadRequestException(
          `Renderer ${section.presentation.component} is not supported for ${section.kind}`,
        );
      }
      if (
        section.presentation.layout === 'single' &&
        section.source.limit !== 1
      ) {
        throw new BadRequestException('A single section must have limit 1');
      }
      const actionLink = section.content.action?.link;
      if (
        actionLink &&
        !actionLink.startsWith('/') &&
        !actionLink.startsWith('https://')
      ) {
        throw new BadRequestException(
          `Unsupported action link for section ${section.id}`,
        );
      }
      return JSON.parse(JSON.stringify(section)) as DiscoverySectionDefinition;
    });
  }

  private assertSupportedSource(
    kind: DiscoverySectionKind,
    strategy: DiscoverySourceStrategy,
  ) {
    const allowed: Record<DiscoverySectionKind, DiscoverySourceStrategy[]> = {
      [DiscoverySectionKind.BANNERS]: [DiscoverySourceStrategy.ACTIVE],
      [DiscoverySectionKind.CLUB_CATEGORIES]: [
        DiscoverySourceStrategy.FEATURED,
      ],
      [DiscoverySectionKind.SPORT_CATEGORIES]: [
        DiscoverySourceStrategy.FEATURED,
      ],
      [DiscoverySectionKind.SPORTS]: [DiscoverySourceStrategy.FEATURED],
      [DiscoverySectionKind.CLUBS]: [
        DiscoverySourceStrategy.TOP_RATED,
        DiscoverySourceStrategy.NEARBY,
        DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
        DiscoverySourceStrategy.FEATURED,
      ],
      [DiscoverySectionKind.COACHES]: [
        DiscoverySourceStrategy.TOP_RATED,
        DiscoverySourceStrategy.NEARBY,
        DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
        DiscoverySourceStrategy.AVAILABLE,
        DiscoverySourceStrategy.VERIFIED,
      ],
      [DiscoverySectionKind.CLASSES]: [
        DiscoverySourceStrategy.TODAY,
        DiscoverySourceStrategy.STARTING_SOON,
        DiscoverySourceStrategy.CAPACITY_AVAILABLE,
        DiscoverySourceStrategy.BEGINNER_FRIENDLY,
        DiscoverySourceStrategy.LATEST,
      ],
      [DiscoverySectionKind.SPACES]: [
        DiscoverySourceStrategy.FEATURED,
        DiscoverySourceStrategy.RECOMMENDED_FOR_USER,
        DiscoverySourceStrategy.LATEST,
      ],
      [DiscoverySectionKind.SLOTS]: [
        DiscoverySourceStrategy.TODAY,
        DiscoverySourceStrategy.TOMORROW,
        DiscoverySourceStrategy.LEAST_CROWDED,
        DiscoverySourceStrategy.CAPACITY_AVAILABLE,
      ],
      [DiscoverySectionKind.EQUIPMENT]: [DiscoverySourceStrategy.FEATURED],
      [DiscoverySectionKind.MEMBERSHIP_PLANS]: [
        DiscoverySourceStrategy.ECONOMICAL,
        DiscoverySourceStrategy.FEATURED,
        DiscoverySourceStrategy.DURATION,
        DiscoverySourceStrategy.SESSIONS,
        DiscoverySourceStrategy.ENTRIES,
        DiscoverySourceStrategy.UNLIMITED,
        DiscoverySourceStrategy.LATEST,
      ],
      [DiscoverySectionKind.BOOKABLE_OFFERS]: [
        DiscoverySourceStrategy.AVAILABLE,
        DiscoverySourceStrategy.STARTING_SOON,
        DiscoverySourceStrategy.LEAST_CROWDED,
      ],
      [DiscoverySectionKind.AMENITIES]: [DiscoverySourceStrategy.FEATURED],
      [DiscoverySectionKind.ARTICLES]: [DiscoverySourceStrategy.LATEST],
    };
    if (!allowed[kind].includes(strategy)) {
      throw new BadRequestException(
        `Strategy ${strategy} is not supported for ${kind}`,
      );
    }
  }

  private stringFilter(
    section: DiscoverySectionDefinition,
    key: string,
  ): string | undefined {
    const value = section.source.filters?.[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private numberFilter(
    section: DiscoverySectionDefinition,
    key: string,
  ): number | undefined {
    const value = section.source.filters?.[key];
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : undefined;
  }

  private sectionCacheKey(
    section: DiscoverySectionDefinition,
    session: DiscoveryFeedSession,
  ): string {
    const context = {
      revision: session.revision,
      pageKey: session.pageKey,
      section,
      interests:
        section.source.strategy === DiscoverySourceStrategy.RECOMMENDED_FOR_USER
          ? {
              sportIds: [...session.personalization.sportIds].sort(),
              goalKeys: [...session.personalization.goalKeys].sort(),
            }
          : undefined,
      location:
        section.source.strategy === DiscoverySourceStrategy.NEARBY
          ? {
              lat: this.roundGeo(session.context.lat),
              lng: this.roundGeo(session.context.lng),
            }
          : session.context.locationId,
    };
    const digest = createHash('sha256')
      .update(JSON.stringify(context))
      .digest('hex')
      .slice(0, 32);
    return `${SECTION_CACHE_PREFIX}${digest}`;
  }

  private roundGeo(value?: number): number | undefined {
    return value === undefined ? undefined : Math.round(value * 100) / 100;
  }

  private async resolveSportId(
    value?: string,
  ): Promise<Types.ObjectId | undefined> {
    if (!value) return undefined;
    if (Types.ObjectId.isValid(value)) return new Types.ObjectId(value);
    const sport = await this.sportModel
      .findOne({ slug: value.toLowerCase(), isActive: true })
      .select({ _id: 1 })
      .lean();
    return sport?._id;
  }

  private visibleClubs(limit: number) {
    return this.clubModel
      .find(DISCOVERY_VISIBLE_CLUB_MATCH)
      .select({ identity: 1, reviewsSummary: 1 })
      .sort({ 'reviewsSummary.average': -1, createdAt: -1 })
      .limit(Math.max(1, Math.min(limit, 48)))
      .lean();
  }

  private tehranDate(date = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? '';
    return `${value('year')}-${value('month')}-${value('day')}`;
  }

  private addIsoDays(date: string, days: number): string {
    const [year, month, day] = date.split('-').map(Number);
    const next = new Date(Date.UTC(year, month - 1, day + days, 12));
    return next.toISOString().slice(0, 10);
  }

  private asDefinitions(value: unknown): DiscoverySectionDefinition[] {
    return JSON.parse(JSON.stringify(value)) as DiscoverySectionDefinition[];
  }

  private async requirePage(pageKey: string) {
    const page = await this.pageModel.findOne({ pageKey });
    if (!page) throw new NotFoundException('Discovery page not found');
    return page;
  }

  private defaultAdminPage(pageKey = DEFAULT_PAGE_KEY) {
    const draftSections =
      pageKey === DEFAULT_PAGE_KEY
        ? this.asDefinitions(INITIAL_DISCOVERY_HOME_SECTIONS)
        : [];
    return {
      id: null,
      pageKey,
      schemaVersion: DISCOVERY_SCHEMA_VERSION,
      draftSections,
      publishedSections: [],
      publishedRevision: 0,
      publishedAt: null,
      updatedAt: null,
    };
  }

  private toAdminPage(value: unknown) {
    const page = value as Record<string, unknown>;
    const id = page._id as Types.ObjectId | undefined;
    const publishedAt = page.publishedAt as Date | undefined;
    const updatedAt = page.updatedAt as Date | undefined;
    return {
      id: id?.toString() ?? null,
      pageKey: page.pageKey,
      schemaVersion: page.schemaVersion,
      draftSections: this.asDefinitions(page.draftSections ?? []),
      publishedSections: this.asDefinitions(page.publishedSections ?? []),
      publishedRevision: page.publishedRevision,
      publishedAt: publishedAt?.toISOString() ?? null,
      updatedAt: updatedAt?.toISOString() ?? null,
    };
  }
}
