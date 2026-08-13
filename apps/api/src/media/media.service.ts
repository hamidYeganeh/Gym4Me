import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { AuditService } from '../audit/audit.service';
import { AuditAction, MediaVisibility, Role } from '../common/enums';
import { StorageService } from '../common/storage/storage.service';
import type { JwtUser } from '../common/types';
import { Media, MediaDocument } from '../schemas/media.schema';

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
    },
  ) {
    const staged = join(process.env.UPLOAD_DIR || './uploads', file.filename);
    const hash = existsSync(staged)
      ? createHash('sha256').update(readFileSync(staged)).digest('hex')
      : undefined;

    // Persist to the configured backend (no-op move for local provider).
    await this.storage.put(
      staged,
      file.filename,
      opts?.mimeType ?? file.mimetype,
    );

    const media = await this.mediaModel.create({
      path: file.filename,
      mimeType: opts?.mimeType ?? file.mimetype,
      size: file.size,
      hash,
      originalName: opts?.originalName ?? file.originalname,
      visibility: opts?.visibility ?? MediaVisibility.PUBLIC,
      uploaderId: new Types.ObjectId(uploaderId),
    });

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
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Media not found');
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

  async assertExists(id?: string | null): Promise<void> {
    if (!id) return;
    await this.findById(id);
  }

  toPublic(media: MediaDocument | (Media & { _id: Types.ObjectId })) {
    return {
      id: media._id.toString(),
      mimeType: media.mimeType,
      size: media.size,
      hash: media.hash ?? null,
      originalName: media.originalName ?? null,
      visibility: media.visibility ?? MediaVisibility.PUBLIC,
      url: `/api/v1/media/${media._id.toString()}/file`,
      createdAt: media.createdAt,
    };
  }
}
