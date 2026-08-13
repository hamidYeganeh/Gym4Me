import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  Privacy,
  Role,
  SocialFolloweeKind,
  SocialPostStatus,
  SocialReportStatus,
  SocialReportTargetKind,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../common/utils/list-query.util';
import {
  SocialComment,
  SocialCommentDocument,
} from '../schemas/social-comment.schema';
import {
  SocialFollow,
  SocialFollowDocument,
} from '../schemas/social-follow.schema';
import { SocialLike, SocialLikeDocument } from '../schemas/social-like.schema';
import { SocialPost, SocialPostDocument } from '../schemas/social-post.schema';
import {
  SocialReport,
  SocialReportDocument,
} from '../schemas/social-report.schema';
import {
  SocialSave,
  SocialSaveDocument,
} from '../schemas/social-save.schema';
import {
  CreateSocialCommentDto,
  CreateSocialPostDto,
  CreateSocialReportDto,
  FollowInputDto,
  ListSocialCommentsQueryDto,
  ListSocialFollowsQueryDto,
  ListSocialPostsQueryDto,
  ListSocialReportsQueryDto,
  ResolveSocialReportDto,
  UpdateSocialPostDto,
} from './dto/social.dto';

@Injectable()
export class SocialService {
  constructor(
    @InjectModel(SocialPost.name)
    private readonly postModel: Model<SocialPostDocument>,
    @InjectModel(SocialComment.name)
    private readonly commentModel: Model<SocialCommentDocument>,
    @InjectModel(SocialLike.name)
    private readonly likeModel: Model<SocialLikeDocument>,
    @InjectModel(SocialFollow.name)
    private readonly followModel: Model<SocialFollowDocument>,
    @InjectModel(SocialSave.name)
    private readonly saveModel: Model<SocialSaveDocument>,
    @InjectModel(SocialReport.name)
    private readonly reportModel: Model<SocialReportDocument>,
    private readonly audit: AuditService,
  ) {}

  /** Public feed: PUBLISHED + PUBLIC only. */
  async listPublicFeed(query: ListSocialPostsQueryDto) {
    const filter: QueryFilter<SocialPostDocument> = {
      status: SocialPostStatus.PUBLISHED,
      visibility: Privacy.PUBLIC,
    };
    if (query.authorUserId) {
      filter.authorUserId = new Types.ObjectId(query.authorUserId);
    }
    return this.paginatePosts(filter, query);
  }

  /**
   * Authenticated feed: PUBLIC published posts, FOLLOWERS posts from people
   * the viewer follows, plus the caller's own posts.
   */
  async listFeed(
    userId: string,
    _activeRole: Role,
    query: ListSocialPostsQueryDto,
  ) {
    const following = await this.followModel
      .find({
        followerId: new Types.ObjectId(userId),
        followeeKind: SocialFolloweeKind.USER,
      })
      .select('followeeId')
      .lean();
    const followeeIds = following.map((f) => f.followeeId);

    const filter: QueryFilter<SocialPostDocument> = {
      $or: [
        {
          status: SocialPostStatus.PUBLISHED,
          visibility: Privacy.PUBLIC,
        },
        {
          status: SocialPostStatus.PUBLISHED,
          visibility: Privacy.FOLLOWERS,
          authorUserId: { $in: followeeIds },
        },
        {
          authorUserId: new Types.ObjectId(userId),
          status: { $ne: SocialPostStatus.DELETED },
        },
      ],
    };
    if (query.authorUserId) {
      const authorId = new Types.ObjectId(query.authorUserId);
      filter.$and = [{ authorUserId: authorId }];
    }
    return this.paginatePosts(filter, query, userId);
  }

  async getPost(id: string, userId?: string) {
    const item = await this.findPost(id);
    if (item.status === SocialPostStatus.DELETED) {
      throw new NotFoundException('Post not found');
    }
    const isAuthor = userId && item.authorUserId.toString() === userId;
    if (!isAuthor) {
      if (item.status !== SocialPostStatus.PUBLISHED) {
        throw new ForbiddenException('Not allowed to view this post');
      }
      if (item.visibility === Privacy.FOLLOWERS) {
        if (!userId) {
          throw new ForbiddenException('Not allowed to view this post');
        }
        const follows = await this.followModel.exists({
          followerId: new Types.ObjectId(userId),
          followeeId: item.authorUserId,
          followeeKind: SocialFolloweeKind.USER,
        });
        if (!follows) {
          throw new ForbiddenException('Not allowed to view this post');
        }
      } else if (item.visibility !== Privacy.PUBLIC) {
        throw new ForbiddenException('Not allowed to view this post');
      }
    }
    return this.toPost(item.toObject(), userId);
  }

  async createPost(
    dto: CreateSocialPostDto,
    userId: string,
    request: Request,
  ) {
    const visibility = dto.visibility ?? Privacy.FOLLOWERS;
    if (visibility !== Privacy.PUBLIC && visibility !== Privacy.FOLLOWERS) {
      throw new BadRequestException(
        'Social post visibility must be public or followers',
      );
    }

    const item = await this.postModel.create({
      authorUserId: new Types.ObjectId(userId),
      body: dto.body.trim(),
      mediaIds: (dto.mediaIds ?? []).map((id) => new Types.ObjectId(id)),
      status: dto.status ?? SocialPostStatus.DRAFT,
      visibility,
      likeCount: 0,
      commentCount: 0,
    });

    this.audit.log({
      action: AuditAction.SOCIAL_POST_UPSERTED,
      actorId: userId,
      metadata: { postId: item._id.toString() },
      request,
    });
    return this.toPost(item.toObject(), userId);
  }

  async updatePost(
    id: string,
    dto: UpdateSocialPostDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findPost(id);
    this.assertAuthorOrAdmin(item.authorUserId, userId, activeRole);

    if (dto.body !== undefined) item.body = dto.body.trim();
    if (dto.mediaIds !== undefined) {
      item.mediaIds = dto.mediaIds.map((mid) => new Types.ObjectId(mid));
    }
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.visibility !== undefined) {
      if (
        dto.visibility !== Privacy.PUBLIC &&
        dto.visibility !== Privacy.FOLLOWERS
      ) {
        throw new BadRequestException(
          'Social post visibility must be public or followers',
        );
      }
      item.visibility = dto.visibility;
    }
    await item.save();

    this.audit.log({
      action: AuditAction.SOCIAL_POST_UPSERTED,
      actorId: userId,
      metadata: { postId: id },
      request,
    });
    return this.toPost(item.toObject(), userId);
  }

  async deletePost(
    id: string,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findPost(id);
    this.assertAuthorOrAdmin(item.authorUserId, userId, activeRole);
    item.status = SocialPostStatus.DELETED;
    await item.save();
    this.audit.log({
      action: AuditAction.SOCIAL_POST_UPSERTED,
      actorId: userId,
      metadata: { kind: 'delete', postId: id },
      request,
    });
    return this.toPost(item.toObject(), userId);
  }

  async listComments(
    postId: string,
    query: ListSocialCommentsQueryDto,
    userId?: string,
  ) {
    await this.getPost(postId, userId);
    const filter: QueryFilter<SocialCommentDocument> = {
      postId: new Types.ObjectId(postId),
      status: SocialPostStatus.PUBLISHED,
    };
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.commentModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toComment(item)),
      total,
      page,
      pageSize,
    );
  }

  async createComment(
    postId: string,
    dto: CreateSocialCommentDto,
    userId: string,
    request: Request,
  ) {
    const post = await this.findPost(postId);
    if (
      post.status !== SocialPostStatus.PUBLISHED &&
      post.authorUserId.toString() !== userId
    ) {
      throw new ForbiddenException('Cannot comment on this post');
    }

    const comment = await this.commentModel.create({
      postId: post._id,
      authorUserId: new Types.ObjectId(userId),
      body: dto.body.trim(),
      status: SocialPostStatus.PUBLISHED,
    });
    await this.postModel.updateOne(
      { _id: post._id },
      { $inc: { commentCount: 1 } },
    );

    this.audit.log({
      action: AuditAction.SOCIAL_POST_UPSERTED,
      actorId: userId,
      metadata: {
        kind: 'comment',
        postId,
        commentId: comment._id.toString(),
      },
      request,
    });
    return this.toComment(comment.toObject());
  }

  async deleteComment(
    postId: string,
    commentId: string,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new NotFoundException('Comment not found');
    }
    const comment = await this.commentModel.findOne({
      _id: commentId,
      postId: new Types.ObjectId(postId),
    });
    if (!comment) throw new NotFoundException('Comment not found');

    this.assertAuthorOrAdmin(comment.authorUserId, userId, activeRole);
    if (comment.status === SocialPostStatus.DELETED) {
      return this.toComment(comment.toObject());
    }
    comment.status = SocialPostStatus.DELETED;
    await comment.save();
    await this.postModel.updateOne(
      { _id: comment.postId, commentCount: { $gt: 0 } },
      { $inc: { commentCount: -1 } },
    );

    this.audit.log({
      action: AuditAction.SOCIAL_POST_UPSERTED,
      actorId: userId,
      metadata: {
        kind: 'comment_delete',
        postId,
        commentId,
      },
      request,
    });
    return this.toComment(comment.toObject());
  }

  async toggleLike(postId: string, userId: string, request: Request) {
    const post = await this.findPost(postId);
    if (
      post.status !== SocialPostStatus.PUBLISHED &&
      post.authorUserId.toString() !== userId
    ) {
      throw new ForbiddenException('Cannot like this post');
    }

    const existing = await this.likeModel.findOne({
      postId: post._id,
      userId: new Types.ObjectId(userId),
    });

    if (existing) {
      await existing.deleteOne();
      await this.postModel.updateOne(
        { _id: post._id, likeCount: { $gt: 0 } },
        { $inc: { likeCount: -1 } },
      );
      this.audit.log({
        action: AuditAction.SOCIAL_POST_UPSERTED,
        actorId: userId,
        metadata: { kind: 'unlike', postId },
        request,
      });
      const refreshed = await this.findPost(postId);
      return this.toPost(refreshed.toObject(), userId, false);
    }

    await this.likeModel.create({
      postId: post._id,
      userId: new Types.ObjectId(userId),
    });
    await this.postModel.updateOne(
      { _id: post._id },
      { $inc: { likeCount: 1 } },
    );
    this.audit.log({
      action: AuditAction.SOCIAL_POST_UPSERTED,
      actorId: userId,
      metadata: { kind: 'like', postId },
      request,
    });
    const refreshed = await this.findPost(postId);
    return this.toPost(refreshed.toObject(), userId, true);
  }

  private async paginatePosts(
    filter: QueryFilter<SocialPostDocument>,
    query: ListSocialPostsQueryDto,
    viewerId?: string,
  ) {
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.postModel.countDocuments(filter),
    ]);

    let likedSet = new Set<string>();
    if (viewerId && items.length) {
      const likes = await this.likeModel
        .find({
          userId: new Types.ObjectId(viewerId),
          postId: { $in: items.map((i) => i._id) },
        })
        .select('postId')
        .lean();
      likedSet = new Set(likes.map((l) => l.postId.toString()));
    }

    return paginatedResult(
      items.map((item) =>
        this.toPost(item, viewerId, likedSet.has(item._id.toString())),
      ),
      total,
      page,
      pageSize,
    );
  }

  private assertAuthorOrAdmin(
    authorUserId: Types.ObjectId,
    userId: string,
    activeRole: Role,
  ) {
    if (activeRole === Role.ADMIN) return;
    if (authorUserId.toString() === userId) return;
    throw new ForbiddenException('Not allowed to modify this resource');
  }

  private async findPost(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Post not found');
    }
    const item = await this.postModel.findById(id);
    if (!item) throw new NotFoundException('Post not found');
    return item;
  }

  private toPost(
    doc: {
      _id: Types.ObjectId;
      authorUserId: Types.ObjectId;
      body: string;
      mediaIds?: Types.ObjectId[];
      status: SocialPostStatus;
      visibility: Privacy;
      likeCount: number;
      commentCount: number;
      createdAt: Date;
      updatedAt: Date;
    },
    viewerId?: string,
    liked?: boolean,
  ) {
    return {
      id: doc._id.toString(),
      authorUserId: doc.authorUserId.toString(),
      body: doc.body,
      mediaIds: (doc.mediaIds ?? []).map((id) => id.toString()),
      status: doc.status,
      visibility: doc.visibility,
      likeCount: doc.likeCount ?? 0,
      commentCount: doc.commentCount ?? 0,
      liked: liked ?? false,
      mine: viewerId ? doc.authorUserId.toString() === viewerId : false,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toComment(doc: {
    _id: Types.ObjectId;
    postId: Types.ObjectId;
    authorUserId: Types.ObjectId;
    body: string;
    status: SocialPostStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      postId: doc.postId.toString(),
      authorUserId: doc.authorUserId.toString(),
      body: doc.body,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  // ── Follow graph ────────────────────────────────────────────────────────

  async follow(userId: string, dto: FollowInputDto, request: Request) {
    if (
      dto.followeeKind === SocialFolloweeKind.USER &&
      dto.followeeId === userId
    ) {
      throw new BadRequestException('Cannot follow yourself');
    }
    try {
      const row = await this.followModel.create({
        followerId: new Types.ObjectId(userId),
        followeeId: new Types.ObjectId(dto.followeeId),
        followeeKind: dto.followeeKind,
      });
      this.audit.log({
        action: AuditAction.SOCIAL_FOLLOW_CHANGED,
        actorId: userId,
        metadata: {
          kind: 'follow',
          followeeId: dto.followeeId,
          followeeKind: dto.followeeKind,
        },
        request,
      });
      return this.toFollow(row.toObject());
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        const existing = await this.followModel
          .findOne({
            followerId: new Types.ObjectId(userId),
            followeeId: new Types.ObjectId(dto.followeeId),
            followeeKind: dto.followeeKind,
          })
          .lean();
        return existing ? this.toFollow(existing) : null;
      }
      throw err;
    }
  }

  async unfollow(userId: string, dto: FollowInputDto, request: Request) {
    await this.followModel.deleteOne({
      followerId: new Types.ObjectId(userId),
      followeeId: new Types.ObjectId(dto.followeeId),
      followeeKind: dto.followeeKind,
    });
    this.audit.log({
      action: AuditAction.SOCIAL_FOLLOW_CHANGED,
      actorId: userId,
      metadata: {
        kind: 'unfollow',
        followeeId: dto.followeeId,
        followeeKind: dto.followeeKind,
      },
      request,
    });
    return { unfollowed: true as const };
  }

  async listFollowing(userId: string, query: ListSocialFollowsQueryDto) {
    const filter: QueryFilter<SocialFollowDocument> = {
      followerId: new Types.ObjectId(userId),
    };
    if (query.followeeKind) filter.followeeKind = query.followeeKind;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.followModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.followModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((i) => this.toFollow(i)),
      total,
      page,
      pageSize,
    );
  }

  async listFollowers(userId: string, query: ListSocialFollowsQueryDto) {
    const filter: QueryFilter<SocialFollowDocument> = {
      followeeId: new Types.ObjectId(userId),
      followeeKind: SocialFolloweeKind.USER,
    };
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.followModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.followModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((i) => this.toFollow(i)),
      total,
      page,
      pageSize,
    );
  }

  // ── Saves ───────────────────────────────────────────────────────────────

  async toggleSave(postId: string, userId: string, request: Request) {
    await this.findPost(postId);
    const existing = await this.saveModel.findOne({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });
    if (existing) {
      await existing.deleteOne();
      this.audit.log({
        action: AuditAction.SOCIAL_SAVE_TOGGLED,
        actorId: userId,
        metadata: { kind: 'unsave', postId },
        request,
      });
      return { saved: false as const };
    }
    await this.saveModel.create({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });
    this.audit.log({
      action: AuditAction.SOCIAL_SAVE_TOGGLED,
      actorId: userId,
      metadata: { kind: 'save', postId },
      request,
    });
    return { saved: true as const };
  }

  async listSaves(userId: string, query: ListSocialPostsQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const [saves, total] = await Promise.all([
      this.saveModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.saveModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);
    const posts = await this.postModel
      .find({ _id: { $in: saves.map((s) => s.postId) } })
      .lean();
    const byId = new Map(posts.map((p) => [p._id.toString(), p]));
    return paginatedResult(
      saves
        .map((s) => byId.get(s.postId.toString()))
        .filter(Boolean)
        .map((p) => this.toPost(p!, userId)),
      total,
      page,
      pageSize,
    );
  }

  // ── Reports ─────────────────────────────────────────────────────────────

  async createReport(
    userId: string,
    dto: CreateSocialReportDto,
    request: Request,
  ) {
    const report = await this.reportModel.create({
      reporterId: new Types.ObjectId(userId),
      target: {
        kind: dto.targetKind,
        id: new Types.ObjectId(dto.targetId),
      },
      reason: dto.reason.trim(),
      status: SocialReportStatus.OPEN,
    });
    this.audit.log({
      action: AuditAction.SOCIAL_REPORT_CREATED,
      actorId: userId,
      metadata: {
        reportId: report._id.toString(),
        targetKind: dto.targetKind,
        targetId: dto.targetId,
      },
      request,
    });
    return this.toReport(report.toObject());
  }

  async adminListReports(query: ListSocialReportsQueryDto) {
    const filter: QueryFilter<SocialReportDocument> = {
      ...createSearchFilter(query.search, ['reason', 'resolution.note']),
    };
    if (query.status) filter.status = { $in: query.status };
    if (query.targetKind) {
      filter['target.kind'] = { $in: query.targetKind };
    }
    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(
      query,
      {
        reason: 'reason',
        status: 'status',
        targetKind: 'target.kind',
        resolvedAt: 'resolution.resolvedAt',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
      { createdAt: -1 },
    );
    const [items, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.reportModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((i) => this.toReport(i)),
      total,
      page,
      pageSize,
    );
  }

  async adminResolveReport(
    id: string,
    adminId: string,
    dto: ResolveSocialReportDto,
    request: Request,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Report not found');
    }
    const report = await this.reportModel.findById(id);
    if (!report) throw new NotFoundException('Report not found');
    report.status = dto.status;
    report.resolution = {
      resolvedBy: new Types.ObjectId(adminId),
      resolvedAt: new Date(),
      note: dto.note?.trim(),
    };
    await report.save();
    this.audit.log({
      action: AuditAction.SOCIAL_REPORT_RESOLVED,
      actorId: adminId,
      metadata: { reportId: id, status: dto.status },
      request,
    });
    return this.toReport(report.toObject());
  }

  private toFollow(doc: {
    _id: Types.ObjectId;
    followerId: Types.ObjectId;
    followeeId: Types.ObjectId;
    followeeKind: SocialFolloweeKind;
    createdAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      followerId: doc.followerId.toString(),
      followeeId: doc.followeeId.toString(),
      followeeKind: doc.followeeKind,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  private toReport(doc: {
    _id: Types.ObjectId;
    reporterId: Types.ObjectId;
    target: { kind: SocialReportTargetKind; id: Types.ObjectId };
    reason: string;
    status: SocialReportStatus;
    resolution?: {
      resolvedBy: Types.ObjectId;
      resolvedAt: Date;
      note?: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      reporterId: doc.reporterId.toString(),
      target: {
        kind: doc.target.kind,
        id: doc.target.id.toString(),
      },
      reason: doc.reason,
      status: doc.status,
      resolution: doc.resolution
        ? {
            resolvedBy: doc.resolution.resolvedBy.toString(),
            resolvedAt: doc.resolution.resolvedAt.toISOString(),
            note: doc.resolution.note ?? null,
          }
        : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
