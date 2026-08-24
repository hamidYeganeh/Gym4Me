import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type Redis from 'ioredis';
import { createHash, randomUUID } from 'node:crypto';
import { Model, Types, type QueryFilter } from 'mongoose';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { REDIS } from '../common/redis/redis.module';
import {
  AuditAction,
  BannerPlacement,
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
import { DEFAULT_DISCOVERY_HOME_SECTIONS } from './discovery.defaults';
import { isDiscoverySectionEligible } from './discovery-targeting.policy';
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

const FEED_KEY_PREFIX = 'discovery:feed:';
const SECTION_CACHE_PREFIX = 'discovery:section:';
const SECTION_CACHE_TTL_SECONDS = 60;
const DEFAULT_PAGE_KEY = 'discovery_home';

@Injectable()
export class DiscoveryService {
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
    if (pages.length === 0) {
      return [this.defaultAdminPage()];
    }
    return pages.map((page) => this.toAdminPage(page));
  }

  async adminGet(pageKey: string) {
    const page = await this.pageModel.findOne({ pageKey }).lean();
    return page ? this.toAdminPage(page) : this.defaultAdminPage(pageKey);
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
      { new: true, upsert: true },
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
      page?.draftSections?.length
        ? page.draftSections
        : DEFAULT_DISCOVERY_HOME_SECTIONS,
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
      page?.publishedSections?.length
        ? page.publishedSections
        : pageKey === DEFAULT_PAGE_KEY
          ? DEFAULT_DISCOVERY_HOME_SECTIONS
          : [],
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
        this.resolveSection(section, session).catch(() => null),
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

  private asDefinitions(value: unknown): DiscoverySectionDefinition[] {
    return JSON.parse(JSON.stringify(value)) as DiscoverySectionDefinition[];
  }

  private async requirePage(pageKey: string) {
    const page = await this.pageModel.findOne({ pageKey });
    if (!page) throw new NotFoundException('Discovery page not found');
    return page;
  }

  private defaultAdminPage(pageKey = DEFAULT_PAGE_KEY) {
    return {
      id: null,
      pageKey,
      schemaVersion: DISCOVERY_SCHEMA_VERSION,
      draftSections:
        pageKey === DEFAULT_PAGE_KEY ? DEFAULT_DISCOVERY_HOME_SECTIONS : [],
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
