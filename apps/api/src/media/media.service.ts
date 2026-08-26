import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import { ClientSession, Model, Types } from 'mongoose';
import type { Request } from 'express';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { AuditService } from '../audit/audit.service';
import { AuditAction, MediaVisibility, Role } from '../common/enums';
import { StorageService } from '../common/storage/storage.service';
import type { JwtUser } from '../common/types';
import { Media, MediaDocument, MediaPurpose } from '../schemas/media.schema';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
  ) {}

  async create(
    file: Express.Multer.File,
    uploaderId: string,
    request?: Request,
    opts?: {
      mimeType?: string;
      visibility?: MediaVisibility;
      originalName?: string;
      purpose?: MediaPurpose;
    },
  ) {
    const staged = join(process.env.UPLOAD_DIR || './uploads', file.filename);
    const hash = existsSync(staged)
      ? createHash('sha256').update(readFileSync(staged)).digest('hex')
      : undefined;

    let stored = false;
    let media: MediaDocument;
    try {
      // Persist to the configured backend (no-op move for local provider).
      await this.storage.put(
        staged,
        file.filename,
        opts?.mimeType ?? file.mimetype,
      );
      stored = true;
      media = await this.mediaModel.create({
        path: file.filename,
        mimeType: opts?.mimeType ?? file.mimetype,
        size: file.size,
        hash,
        originalName: opts?.originalName ?? file.originalname,
        visibility: opts?.visibility ?? MediaVisibility.PUBLIC,
        uploaderId: new Types.ObjectId(uploaderId),
        purpose: opts?.purpose ?? MediaPurpose.GENERAL,
      });
    } catch (error) {
      if (stored)
        await this.storage.delete(file.filename).catch(() => undefined);
      if (existsSync(staged)) unlinkSync(staged);
      throw error;
    }

    this.audit.log({
      action: AuditAction.MEDIA_UPLOADED,
      actorId: uploaderId,
      metadata: {
        mediaId: media._id.toString(),
        mimeType: media.mimeType,
        size: media.size,
        hash: media.hash,
        visibility: media.visibility,
      },
      request,
    });

    return this.toPublic(media);
  }

  async findById(id: string): Promise<MediaDocument> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Media not found');
    const media = await this.mediaModel.findById(id);
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  private assertCanRead(media: MediaDocument, user?: JwtUser | null): void {
    const visibility = media.visibility ?? MediaVisibility.PUBLIC;
    if (visibility === MediaVisibility.PUBLIC) return;
    if (!user) {
      throw new ForbiddenException('Media is private');
    }
    if (user.activeRole === Role.ADMIN) return;
    if (media.uploaderId?.toString() === user.sub) return;
    throw new ForbiddenException('Media is private');
  }

  async getMeta(id: string, user?: JwtUser | null) {
    const media = await this.findById(id);
    this.assertCanRead(media, user);
    return this.toPublic(media);
  }

  async openFile(id: string, user?: JwtUser | null) {
    const media = await this.findById(id);
    this.assertCanRead(media, user);
    if (!(await this.storage.exists(media.path))) {
      throw new NotFoundException('File missing in storage');
    }
    const opened = await this.storage.open(media.path);
    return {
      stream: opened.stream,
      mimeType: media.mimeType,
      originalName: media.originalName,
      size: opened.size ?? media.size,
      visibility: media.visibility ?? MediaVisibility.PUBLIC,
    };
  }

  async openAttachedFile(
    id: string,
    purpose: MediaPurpose,
    kind: 'social_post',
    refId: Types.ObjectId,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Media not found');
    }
    const media = await this.mediaModel.findOne({
      _id: new Types.ObjectId(id),
      purpose,
      'attachment.kind': kind,
      'attachment.refId': refId,
      deletingAt: { $exists: false },
    });
    if (!media || !(await this.storage.exists(media.path))) {
      throw new NotFoundException('Media not found');
    }
    const opened = await this.storage.open(media.path);
    return {
      stream: opened.stream,
      mimeType: media.mimeType,
      originalName: media.originalName,
      size: opened.size ?? media.size,
    };
  }

  async assertExists(id?: string | null): Promise<void> {
    if (!id) return;
    await this.findById(id);
  }

  async assertOwnedImage(
    id: string,
    userId: string,
    requiredVisibility?: MediaVisibility,
    requiredPurpose?: MediaPurpose,
  ): Promise<MediaDocument> {
    const media = await this.findById(id);
    if (media.uploaderId?.toString() !== userId) {
      throw new ForbiddenException('Media is not owned by this user');
    }
    if (!media.mimeType.startsWith('image/')) {
      throw new ForbiddenException('Media must be an image');
    }
    if (
      requiredVisibility !== undefined &&
      media.visibility !== requiredVisibility
    ) {
      throw new ForbiddenException('Media visibility is not allowed');
    }
    if (requiredPurpose !== undefined && media.purpose !== requiredPurpose) {
      throw new ForbiddenException('Media purpose is not allowed');
    }
    return media;
  }

  async claimProgressPhoto(
    id: string,
    userId: string,
    photoId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    const media = await this.mediaModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        uploaderId: new Types.ObjectId(userId),
        mimeType: /^image\//,
        visibility: MediaVisibility.PRIVATE,
        purpose: MediaPurpose.PROGRESS_PHOTO,
        deletingAt: { $exists: false },
        $or: [
          { attachment: { $exists: false } },
          {
            'attachment.kind': 'progress_photo',
            'attachment.refId': photoId,
          },
        ],
      },
      {
        $set: {
          attachment: {
            kind: 'progress_photo',
            refId: photoId,
            attachedAt: new Date(),
          },
        },
      },
      { new: true, session },
    );
    if (!media) {
      throw new ForbiddenException('Media cannot be attached to this photo');
    }
  }

  async claimSocialPost(
    id: string,
    userId: string,
    postId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    const media = await this.mediaModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        uploaderId: new Types.ObjectId(userId),
        mimeType: /^image\//,
        visibility: MediaVisibility.PRIVATE,
        purpose: MediaPurpose.SOCIAL_POST,
        deletingAt: { $exists: false },
        $or: [
          { attachment: { $exists: false } },
          { 'attachment.kind': 'social_post', 'attachment.refId': postId },
        ],
      },
      {
        $set: {
          attachment: {
            kind: 'social_post',
            refId: postId,
            attachedAt: new Date(),
          },
        },
      },
      { new: true, session },
    );
    if (!media) {
      throw new ForbiddenException('Media cannot be attached to this post');
    }
  }

  async setSocialPostMediaVisibility(
    ids: string[],
    userId: string,
    postId: Types.ObjectId,
    visibility: MediaVisibility,
    session: ClientSession,
  ): Promise<void> {
    if (ids.length === 0) return;
    const result = await this.mediaModel.updateMany(
      {
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
        uploaderId: new Types.ObjectId(userId),
        purpose: MediaPurpose.SOCIAL_POST,
        'attachment.kind': 'social_post',
        'attachment.refId': postId,
      },
      { $set: { visibility } },
      { session },
    );
    if (result.matchedCount !== ids.length) {
      throw new ForbiddenException('Social post media attachment mismatch');
    }
  }

  async claimMealAdherence(
    id: string,
    userId: string,
    adherenceId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    const media = await this.mediaModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        uploaderId: new Types.ObjectId(userId),
        mimeType: /^image\//,
        visibility: MediaVisibility.PRIVATE,
        purpose: MediaPurpose.MEAL_ADHERENCE,
        deletingAt: { $exists: false },
        attachment: { $exists: false },
      },
      {
        $set: {
          attachment: {
            kind: 'meal_adherence',
            refId: adherenceId,
            attachedAt: new Date(),
          },
        },
      },
      { new: true, session },
    );
    if (!media) {
      throw new ForbiddenException('Media cannot be attached to this meal log');
    }
  }

  async releaseSocialPost(
    ids: string[],
    userId: string,
    postId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    if (ids.length === 0) return;
    const result = await this.mediaModel.updateMany(
      {
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
        uploaderId: new Types.ObjectId(userId),
        purpose: MediaPurpose.SOCIAL_POST,
        'attachment.kind': 'social_post',
        'attachment.refId': postId,
      },
      {
        $unset: { attachment: 1 },
        $set: {
          visibility: MediaVisibility.PRIVATE,
          deletingAt: new Date(),
        },
      },
      { session },
    );
    if (result.matchedCount !== ids.length) {
      throw new ForbiddenException('Social post media attachment mismatch');
    }
  }

  async releaseProgressPhoto(
    id: string,
    userId: string,
    photoId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    await this.mediaModel.updateOne(
      {
        _id: new Types.ObjectId(id),
        uploaderId: new Types.ObjectId(userId),
        purpose: MediaPurpose.PROGRESS_PHOTO,
        'attachment.kind': 'progress_photo',
        'attachment.refId': photoId,
      },
      {
        $unset: { attachment: 1 },
        $set: { deletingAt: new Date() },
      },
      { session },
    );
  }

  async finalizeManagedMediaDeletion(id: string): Promise<boolean> {
    const media = await this.mediaModel.findOne({
      _id: new Types.ObjectId(id),
      purpose: {
        $in: [
          MediaPurpose.PROGRESS_PHOTO,
          MediaPurpose.SOCIAL_POST,
          MediaPurpose.MEAL_ADHERENCE,
        ],
      },
      deletingAt: { $exists: true },
      attachment: { $exists: false },
    });
    if (!media) return false;
    await this.storage.delete(media.path);
    await this.mediaModel.deleteOne({
      _id: media._id,
      deletingAt: media.deletingAt,
      attachment: { $exists: false },
    });
    return true;
  }

  async cleanupManagedMediaOrphans(
    now = new Date(),
    limit = 50,
  ): Promise<{ scanned: number; deleted: number; failed: number }> {
    const staleBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const candidates = await this.mediaModel
      .find({
        purpose: {
          $in: [
            MediaPurpose.PROGRESS_PHOTO,
            MediaPurpose.SOCIAL_POST,
            MediaPurpose.MEAL_ADHERENCE,
          ],
        },
        attachment: { $exists: false },
        $or: [
          { deletingAt: { $exists: true } },
          { deletingAt: { $exists: false }, createdAt: { $lte: staleBefore } },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(Math.max(1, Math.min(limit, 200)));
    let deleted = 0;
    let failed = 0;
    for (const candidate of candidates) {
      try {
        const claimed = await this.mediaModel.findOneAndUpdate(
          {
            _id: candidate._id,
            attachment: { $exists: false },
          },
          { $set: { deletingAt: candidate.deletingAt ?? now } },
          { new: true },
        );
        if (!claimed) continue;
        if (await this.finalizeManagedMediaDeletion(claimed._id.toString())) {
          deleted += 1;
        }
      } catch {
        failed += 1;
      }
    }
    return { scanned: candidates.length, deleted, failed };
  }

  toPublic(media: MediaDocument | (Media & { _id: Types.ObjectId })) {
    return {
      id: media._id.toString(),
      mimeType: media.mimeType,
      size: media.size,
      hash: media.hash ?? null,
      originalName: media.originalName ?? null,
      visibility: media.visibility ?? MediaVisibility.PUBLIC,
      purpose: media.purpose ?? MediaPurpose.GENERAL,
      url: `/api/v1/media/${media._id.toString()}/file`,
      createdAt: media.createdAt,
    };
  }
}
