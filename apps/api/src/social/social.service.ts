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
  SocialPostStatus,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  SocialComment,
  SocialCommentDocument,
} from '../schemas/social-comment.schema';
import { SocialLike, SocialLikeDocument } from '../schemas/social-like.schema';
import { SocialPost, SocialPostDocument } from '../schemas/social-post.schema';
import {
  CreateSocialCommentDto,
  CreateSocialPostDto,
  ListSocialCommentsQueryDto,
  ListSocialPostsQueryDto,
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
   * Authenticated feed (v1 simplified): PUBLISHED + PUBLIC,
   * plus the caller's own posts (any visibility/status except deleted).
   */
  async listFeed(
    userId: string,
    _activeRole: Role,
    query: ListSocialPostsQueryDto,
  ) {
    const filter: QueryFilter<SocialPostDocument> = {
      $or: [
        {
          status: SocialPostStatus.PUBLISHED,
          visibility: Privacy.PUBLIC,
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
    if (
      !isAuthor &&
      (item.status !== SocialPostStatus.PUBLISHED ||
        item.visibility !== Privacy.PUBLIC)
    ) {
      throw new ForbiddenException('Not allowed to view this post');
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
}
