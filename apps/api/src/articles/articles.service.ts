import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { EventWriterService } from '../analytics/event-writer.service';
import {
  AnalyticsEventName,
  ArticleAudience,
  ArticleKind,
  AuditAction,
  PointRuleEvent,
  PublishStatus,
  Role,
} from '../common/enums';
import { GamificationService } from '../gamification/gamification.service';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { slugify } from '../common/utils/slug.util';
import { sanitizeArticleHtml } from '../common/utils/html-sanitize.util';
import { MediaService } from '../media/media.service';
import {
  ArticleComment,
  ArticleCommentDocument,
} from '../schemas/article-comment.schema';
import {
  ArticleUserState,
  ArticleUserStateDocument,
} from '../schemas/article-user-state.schema';
import { Article, ArticleDocument } from '../schemas/article.schema';
import { User, UserDocument } from '../schemas/user.schema';
import {
  AdminListArticlesQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/admin-article.dto';
import {
  CreateArticleCommentDto,
  ListArticleCommentsQueryDto,
  ListArticlesQueryDto,
} from './dto/article.dto';
import { estimateReadingTimeMinutes } from './utils/reading-time.util';

type LeanArticle = {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  taxonomy: {
    category: string;
    kind: string;
    audience: string;
  };
  coverMediaId?: Types.ObjectId;
  publishStatus: string;
  publishedAt?: Date;
  readingTimeMinutes: number;
  tags: string[];
  seo?: { title?: string; description?: string };
  engagement?: {
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    savesCount: number;
  };
  authorId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<ArticleDocument>,
    @InjectModel(ArticleComment.name)
    private readonly commentModel: Model<ArticleCommentDocument>,
    @InjectModel(ArticleUserState.name)
    private readonly stateModel: Model<ArticleUserStateDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
    private readonly gamification: GamificationService,
  ) {}

  async listPublished(query: ListArticlesQueryDto) {
    const filter = this.buildPublishedFilter(query);
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.articleModel.countDocuments(filter),
    ]);

    const authors = await this.loadAuthors(items.map((i) => i.authorId));
    return paginatedResult(
      items.map((item) => this.toPublicSummary(item, authors)),
      total,
      page,
      pageSize,
    );
  }

  async listFacets() {
    const published = { publishStatus: PublishStatus.PUBLISHED };
    const [categories, kinds, audiences] = await Promise.all([
      this.articleModel.aggregate<{ _id: string; count: number }>([
        { $match: published },
        { $group: { _id: '$taxonomy.category', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      this.articleModel.aggregate<{ _id: string; count: number }>([
        { $match: published },
        { $group: { _id: '$taxonomy.kind', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      this.articleModel.aggregate<{ _id: string; count: number }>([
        { $match: published },
        { $group: { _id: '$taxonomy.audience', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
    ]);

    return {
      categories: categories.map((row) => ({
        key: row._id,
        count: row.count,
      })),
      kinds: kinds.map((row) => ({ key: row._id, count: row.count })),
      audiences: audiences.map((row) => ({ key: row._id, count: row.count })),
    };
  }

  /** Read-only published lookup — does not increment views. */
  async findPublishedBySlug(slug: string) {
    const item = await this.articleModel
      .findOne({
        slug: slug.toLowerCase().trim(),
        publishStatus: PublishStatus.PUBLISHED,
      })
      .lean();
    if (!item) throw new NotFoundException('Article not found');
    const authors = await this.loadAuthors([item.authorId]);
    return this.toPublicDetail(item, authors);
  }

  async getPublishedBySlug(slug: string) {
    const item = await this.articleModel
      .findOneAndUpdate(
        {
          slug: slug.toLowerCase().trim(),
          publishStatus: PublishStatus.PUBLISHED,
        },
        { $inc: { 'engagement.viewsCount': 1 } },
        { new: true },
      )
      .lean();
    if (!item) throw new NotFoundException('Article not found');
    const authors = await this.loadAuthors([item.authorId]);
    return this.toPublicDetail(item, authors);
  }

  async listRelated(slug: string, limit = 6) {
    const current = await this.articleModel
      .findOne({
        slug: slug.toLowerCase().trim(),
        publishStatus: PublishStatus.PUBLISHED,
      })
      .select('_id taxonomy')
      .lean();
    if (!current) throw new NotFoundException('Article not found');

    const items = await this.articleModel
      .find({
        _id: { $ne: current._id },
        publishStatus: PublishStatus.PUBLISHED,
        'taxonomy.category': current.taxonomy.category,
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    const authors = await this.loadAuthors(items.map((i) => i.authorId));
    return items.map((item) => this.toPublicSummary(item, authors));
  }

  async adminList(query: AdminListArticlesQueryDto) {
    const filter: QueryFilter<ArticleDocument> = {};
    if (query.publishStatus) filter.publishStatus = query.publishStatus;
    if (query.category) {
      filter['taxonomy.category'] = query.category.toLowerCase().trim();
    }
    if (query.kind) filter['taxonomy.kind'] = query.kind;
    if (query.audience) filter['taxonomy.audience'] = query.audience;
    if (query.tag) filter.tags = query.tag;
    if (query.search) {
      const pattern = new RegExp(
        query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ title: pattern }, { slug: pattern }, { excerpt: pattern }];
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.articleModel.countDocuments(filter),
    ]);

    const authors = await this.loadAuthors(items.map((i) => i.authorId));
    return paginatedResult(
      items.map((item) => this.toAdmin(item, authors)),
      total,
      page,
      pageSize,
    );
  }

  async adminGet(id: string) {
    const item = await this.findArticle(id);
    const authors = await this.loadAuthors([item.authorId]);
    return this.toAdmin(item.toObject(), authors);
  }

  async create(dto: CreateArticleDto, adminId: string, request: Request) {
    await this.media.assertExists(dto.coverMediaId);
    const publishStatus = dto.publishStatus ?? PublishStatus.DRAFT;
    const slug = await this.uniqueSlug(dto.slug || slugify(dto.title));

    const body = sanitizeArticleHtml(dto.body);
    const item = await this.articleModel.create({
      title: dto.title,
      slug,
      excerpt: dto.excerpt,
      body,
      taxonomy: this.normalizeTaxonomy(dto.taxonomy),
      coverMediaId: dto.coverMediaId
        ? new Types.ObjectId(dto.coverMediaId)
        : undefined,
      publishStatus,
      publishedAt:
        publishStatus === PublishStatus.PUBLISHED ? new Date() : undefined,
      readingTimeMinutes: estimateReadingTimeMinutes(body),
      tags: this.normalizeTags(dto.tags),
      seo: {
        title: dto.seo?.title,
        description: dto.seo?.description,
      },
      engagement: {
        viewsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
      },
      authorId: new Types.ObjectId(adminId),
      updatedBy: new Types.ObjectId(adminId),
    });

    this.audit.log({
      action: AuditAction.ARTICLE_CREATED,
      actorId: adminId,
      metadata: { articleId: item._id.toString(), slug: item.slug },
      request,
    });

    const authors = await this.loadAuthors([item.authorId]);
    return this.toAdmin(item.toObject(), authors);
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findArticle(id);

    if (dto.coverMediaId !== undefined && dto.coverMediaId !== null) {
      await this.media.assertExists(dto.coverMediaId);
    }

    if (dto.title !== undefined) item.title = dto.title;
    if (dto.excerpt !== undefined) item.excerpt = dto.excerpt ?? undefined;
    if (dto.body !== undefined) {
      item.body = sanitizeArticleHtml(dto.body);
      item.readingTimeMinutes = estimateReadingTimeMinutes(item.body);
    }
    if (dto.taxonomy !== undefined) {
      item.taxonomy = {
        ...item.taxonomy,
        ...this.normalizeTaxonomy({
          category: dto.taxonomy.category ?? item.taxonomy.category,
          kind: dto.taxonomy.kind ?? item.taxonomy.kind,
          audience: dto.taxonomy.audience ?? item.taxonomy.audience,
        }),
      };
    }
    if (dto.tags !== undefined) item.tags = this.normalizeTags(dto.tags);

    if (dto.slug !== undefined && dto.slug !== item.slug) {
      item.slug = await this.uniqueSlug(dto.slug, id);
    }

    if (dto.coverMediaId === null) {
      item.coverMediaId = undefined;
    } else if (dto.coverMediaId) {
      item.coverMediaId = new Types.ObjectId(dto.coverMediaId);
    }

    if (dto.seo !== undefined) {
      item.seo = {
        title: dto.seo.title ?? item.seo?.title,
        description: dto.seo.description ?? item.seo?.description,
      };
    }

    if (dto.publishStatus !== undefined) {
      const wasPublished = item.publishStatus === PublishStatus.PUBLISHED;
      item.publishStatus = dto.publishStatus;
      if (
        dto.publishStatus === PublishStatus.PUBLISHED &&
        !wasPublished &&
        !item.publishedAt
      ) {
        item.publishedAt = new Date();
      }
    }

    item.updatedBy = new Types.ObjectId(adminId);
    await item.save();

    this.audit.log({
      action: AuditAction.ARTICLE_UPDATED,
      actorId: adminId,
      metadata: { articleId: item._id.toString(), slug: item.slug },
      request,
    });

    const authors = await this.loadAuthors([item.authorId]);
    return this.toAdmin(item.toObject(), authors);
  }

  async remove(id: string, adminId: string, request: Request) {
    const item = await this.findArticle(id);
    await item.deleteOne();
    await Promise.all([
      this.commentModel.deleteMany({ articleId: item._id }),
      this.stateModel.deleteMany({ articleId: item._id }),
    ]);

    this.audit.log({
      action: AuditAction.ARTICLE_DELETED,
      actorId: adminId,
      metadata: { articleId: item._id.toString(), slug: item.slug },
      request,
    });

    return { deleted: true };
  }

  async getViewerState(articleId: string, userId: string) {
    await this.assertPublishedArticle(articleId);
    const state = await this.stateModel
      .findOne({
        articleId: new Types.ObjectId(articleId),
        userId: new Types.ObjectId(userId),
      })
      .lean();
    return {
      liked: Boolean(state?.likedAt),
      saved: Boolean(state?.savedAt),
    };
  }

  async like(
    articleId: string,
    userId: string,
    request: Request,
    activeRole?: Role,
  ) {
    const article = await this.assertPublishedArticle(articleId);
    const state = await this.getOrCreateState(articleId, userId);
    if (state.likedAt) {
      return this.engagementResponse(article, state);
    }
    state.likedAt = new Date();
    await state.save();
    await this.articleModel.updateOne(
      { _id: article._id },
      { $inc: { 'engagement.likesCount': 1 } },
    );
    this.audit.log({
      action: AuditAction.ARTICLE_LIKED,
      actorId: userId,
      metadata: { articleId },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.ARTICLE_LIKED,
      eventId: `article_liked:${articleId}:${userId}`,
      actor: { userId, activeRole },
      properties: { articleId },
    });
    if (activeRole) {
      void this.gamification.handleUserEvent(userId, activeRole, {
        event: PointRuleEvent.ARTICLE_LIKED,
        eventKey: `${articleId}:${userId}`,
        target: { type: 'article', id: articleId },
      });
    }
    const refreshed = await this.assertPublishedArticle(articleId);
    return this.engagementResponse(refreshed, state);
  }

  /**
   * Idempotently mark an article as read by the viewer.
   * Only the first read per article emits analytics/points events.
   */
  async markRead(
    articleId: string,
    userId: string,
    request: Request,
    activeRole?: Role,
  ) {
    const article = await this.assertPublishedArticle(articleId);
    const state = await this.getOrCreateState(articleId, userId);
    if (state.readAt) {
      return this.engagementResponse(article, state);
    }
    state.readAt = new Date();
    await state.save();
    void this.events.track({
      eventName: AnalyticsEventName.ARTICLE_READ,
      eventId: `article_read:${articleId}:${userId}`,
      actor: { userId, activeRole },
      properties: { articleId },
    });
    if (activeRole) {
      void this.gamification.handleUserEvent(userId, activeRole, {
        event: PointRuleEvent.ARTICLE_READ,
        eventKey: `${articleId}:${userId}`,
        target: { type: 'article', id: articleId },
      });
    }
    return this.engagementResponse(article, state);
  }

  async unlike(articleId: string, userId: string, request: Request) {
    const article = await this.assertPublishedArticle(articleId);
    const state = await this.getOrCreateState(articleId, userId);
    if (!state.likedAt) {
      return this.engagementResponse(article, state);
    }
    state.likedAt = undefined;
    await state.save();
    await this.articleModel.updateOne(
      { _id: article._id, 'engagement.likesCount': { $gt: 0 } },
      { $inc: { 'engagement.likesCount': -1 } },
    );
    this.audit.log({
      action: AuditAction.ARTICLE_UNLIKED,
      actorId: userId,
      metadata: { articleId },
      request,
    });
    const refreshed = await this.assertPublishedArticle(articleId);
    return this.engagementResponse(refreshed, state);
  }

  async save(articleId: string, userId: string, request: Request) {
    const article = await this.assertPublishedArticle(articleId);
    const state = await this.getOrCreateState(articleId, userId);
    if (state.savedAt) {
      return this.engagementResponse(article, state);
    }
    state.savedAt = new Date();
    await state.save();
    await this.articleModel.updateOne(
      { _id: article._id },
      { $inc: { 'engagement.savesCount': 1 } },
    );
    this.audit.log({
      action: AuditAction.ARTICLE_SAVED,
      actorId: userId,
      metadata: { articleId },
      request,
    });
    const refreshed = await this.assertPublishedArticle(articleId);
    return this.engagementResponse(refreshed, state);
  }

  async unsave(articleId: string, userId: string, request: Request) {
    const article = await this.assertPublishedArticle(articleId);
    const state = await this.getOrCreateState(articleId, userId);
    if (!state.savedAt) {
      return this.engagementResponse(article, state);
    }
    state.savedAt = undefined;
    await state.save();
    await this.articleModel.updateOne(
      { _id: article._id, 'engagement.savesCount': { $gt: 0 } },
      { $inc: { 'engagement.savesCount': -1 } },
    );
    this.audit.log({
      action: AuditAction.ARTICLE_UNSAVED,
      actorId: userId,
      metadata: { articleId },
      request,
    });
    const refreshed = await this.assertPublishedArticle(articleId);
    return this.engagementResponse(refreshed, state);
  }

  async listComments(articleId: string, query: ListArticleCommentsQueryDto) {
    await this.assertPublishedArticle(articleId);
    const { page, pageSize } = resolvePageSize(query);
    const filter = { articleId: new Types.ObjectId(articleId) };
    const [items, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.commentModel.countDocuments(filter),
    ]);
    const authors = await this.loadAuthors(items.map((i) => i.userId));
    return paginatedResult(
      items.map((item) => ({
        id: item._id.toString(),
        articleId: item.articleId.toString(),
        body: item.body,
        author: this.authorSummary(item.userId, authors),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    );
  }

  async createComment(
    articleId: string,
    dto: CreateArticleCommentDto,
    userId: string,
    request: Request,
  ) {
    const article = await this.assertPublishedArticle(articleId);
    const comment = await this.commentModel.create({
      articleId: article._id,
      userId: new Types.ObjectId(userId),
      body: dto.body.trim(),
    });
    await this.articleModel.updateOne(
      { _id: article._id },
      { $inc: { 'engagement.commentsCount': 1 } },
    );
    this.audit.log({
      action: AuditAction.ARTICLE_COMMENT_CREATED,
      actorId: userId,
      metadata: { articleId, commentId: comment._id.toString() },
      request,
    });
    const authors = await this.loadAuthors([comment.userId]);
    return {
      id: comment._id.toString(),
      articleId,
      body: comment.body,
      author: this.authorSummary(comment.userId, authors),
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  private async assertPublishedArticle(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Article not found');
    }
    const item = await this.articleModel.findOne({
      _id: id,
      publishStatus: PublishStatus.PUBLISHED,
    });
    if (!item) throw new NotFoundException('Article not found');
    return item;
  }

  private async getOrCreateState(articleId: string, userId: string) {
    let state = await this.stateModel.findOne({
      articleId: new Types.ObjectId(articleId),
      userId: new Types.ObjectId(userId),
    });
    if (!state) {
      state = await this.stateModel.create({
        articleId: new Types.ObjectId(articleId),
        userId: new Types.ObjectId(userId),
      });
    }
    return state;
  }

  private engagementResponse(
    article: ArticleDocument,
    state: ArticleUserStateDocument,
  ) {
    return {
      engagement: {
        viewsCount: article.engagement?.viewsCount ?? 0,
        likesCount: article.engagement?.likesCount ?? 0,
        commentsCount: article.engagement?.commentsCount ?? 0,
        savesCount: article.engagement?.savesCount ?? 0,
      },
      viewer: {
        liked: Boolean(state.likedAt),
        saved: Boolean(state.savedAt),
        read: Boolean(state.readAt),
      },
    };
  }

  private buildPublishedFilter(query: ListArticlesQueryDto) {
    const filter: QueryFilter<ArticleDocument> = {
      publishStatus: PublishStatus.PUBLISHED,
    };
    if (query.category) {
      filter['taxonomy.category'] = query.category.toLowerCase().trim();
    }
    if (query.kind) filter['taxonomy.kind'] = query.kind;
    if (query.audience) filter['taxonomy.audience'] = query.audience;
    if (query.tag) filter.tags = query.tag;
    return filter;
  }

  private normalizeTaxonomy(input: {
    category: string;
    kind?: ArticleKind | string;
    audience?: ArticleAudience | string;
  }) {
    return {
      category: slugify(input.category) || 'general',
      kind: (input.kind as ArticleKind) || ArticleKind.GUIDE,
      audience: (input.audience as ArticleAudience) || ArticleAudience.ALL,
    };
  }

  private async findArticle(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Article not found');
    }
    const item = await this.articleModel.findById(id);
    if (!item) throw new NotFoundException('Article not found');
    return item;
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    const slug = slugify(base) || 'article';
    let candidate = slug;
    let i = 0;
    while (true) {
      const existing = await this.articleModel
        .findOne({
          slug: candidate,
          ...(excludeId ? { _id: { $ne: new Types.ObjectId(excludeId) } } : {}),
        })
        .select('_id')
        .lean();
      if (!existing) return candidate;
      candidate = `${slug}-${++i}`;
      if (i > 50) throw new ConflictException('Could not allocate unique slug');
    }
  }

  private normalizeTags(tags?: string[]) {
    if (!tags?.length) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of tags) {
      const tag = raw.trim().toLowerCase();
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);
      out.push(tag);
    }
    return out;
  }

  private async loadAuthors(ids: Array<Types.ObjectId | undefined | null>) {
    const unique = [
      ...new Set(
        ids
          .filter((id): id is Types.ObjectId => Boolean(id))
          .map((id) => id.toString()),
      ),
    ];
    if (unique.length === 0) return new Map<string, LeanAuthor>();
    const users = await this.userModel
      .find({ _id: { $in: unique } })
      .select('name avatar')
      .lean();
    const map = new Map<string, LeanAuthor>();
    for (const user of users) {
      map.set(user._id.toString(), {
        id: user._id.toString(),
        name: [user.name?.first, user.name?.last].filter(Boolean).join(' ') ||
          'Gym4Me',
        avatarMediaId: user.avatar?.mediaId?.toString() ?? null,
      });
    }
    return map;
  }

  private authorSummary(
    authorId: Types.ObjectId | undefined,
    authors: Map<string, LeanAuthor>,
  ) {
    if (!authorId) {
      return { id: null, name: 'Gym4Me', avatarMediaId: null };
    }
    return (
      authors.get(authorId.toString()) ?? {
        id: authorId.toString(),
        name: 'Gym4Me',
        avatarMediaId: null,
      }
    );
  }

  private toPublicSummary(
    doc: LeanArticle,
    authors: Map<string, LeanAuthor>,
  ) {
    return {
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt ?? null,
      taxonomy: {
        category: doc.taxonomy?.category ?? 'general',
        kind: doc.taxonomy?.kind ?? ArticleKind.GUIDE,
        audience: doc.taxonomy?.audience ?? ArticleAudience.ALL,
      },
      coverMediaId: doc.coverMediaId?.toString() ?? null,
      publishedAt: doc.publishedAt?.toISOString() ?? null,
      readingTimeMinutes: doc.readingTimeMinutes ?? 1,
      tags: doc.tags ?? [],
      engagement: {
        viewsCount: doc.engagement?.viewsCount ?? 0,
        likesCount: doc.engagement?.likesCount ?? 0,
        commentsCount: doc.engagement?.commentsCount ?? 0,
        savesCount: doc.engagement?.savesCount ?? 0,
      },
      author: this.authorSummary(doc.authorId, authors),
      seo: {
        title: doc.seo?.title ?? null,
        description: doc.seo?.description ?? null,
      },
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toPublicDetail(
    doc: LeanArticle,
    authors: Map<string, LeanAuthor>,
  ) {
    return {
      ...this.toPublicSummary(doc, authors),
      body: doc.body,
    };
  }

  private toAdmin(doc: LeanArticle, authors: Map<string, LeanAuthor>) {
    return {
      ...this.toPublicDetail(doc, authors),
      publishStatus: doc.publishStatus,
    };
  }
}

type LeanAuthor = {
  id: string;
  name: string;
  avatarMediaId: string | null;
};
