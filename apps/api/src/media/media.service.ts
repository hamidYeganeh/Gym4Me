import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Request } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../common/enums';
import { Media, MediaDocument } from '../schemas/media.schema';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly audit: AuditService,
  ) {}

  async create(
    file: Express.Multer.File,
    uploaderId: string,
    request?: Request,
  ) {
    const media = await this.mediaModel.create({
      path: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
      uploaderId: new Types.ObjectId(uploaderId),
    });

    this.audit.log({
      action: AuditAction.MEDIA_UPLOADED,
      actorId: uploaderId,
      metadata: {
        mediaId: media._id.toString(),
        mimeType: media.mimeType,
        size: media.size,
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

  async getMeta(id: string) {
    return this.toPublic(await this.findById(id));
  }

  async openFile(id: string) {
    const media = await this.findById(id);
    const absolute = join(process.env.UPLOAD_DIR || './uploads', media.path);
    if (!existsSync(absolute)) throw new NotFoundException('File missing on disk');
    return {
      stream: createReadStream(absolute),
      mimeType: media.mimeType,
      originalName: media.originalName,
      size: media.size,
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
      originalName: media.originalName ?? null,
      url: `/api/v1/media/${media._id.toString()}/file`,
      createdAt: media.createdAt,
    };
  }
}
