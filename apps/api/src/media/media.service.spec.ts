import { ForbiddenException } from '@nestjs/common';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Types } from 'mongoose';
import { MediaVisibility } from '../common/enums';
import { MediaPurpose } from '../schemas/media.schema';
import { MediaService } from './media.service';

describe('MediaService ownership policy', () => {
  const ownerId = new Types.ObjectId();

  function serviceWith(media: Record<string, unknown>) {
    const model = { findById: jest.fn().mockResolvedValue(media) };
    return new MediaService(model as never, {} as never, {} as never);
  }

  it('accepts only a private image owned by the caller', async () => {
    const media = {
      _id: new Types.ObjectId(),
      uploaderId: ownerId,
      mimeType: 'image/webp',
      visibility: MediaVisibility.PRIVATE,
    };

    await expect(
      serviceWith(media).assertOwnedImage(
        media._id.toString(),
        ownerId.toString(),
        MediaVisibility.PRIVATE,
      ),
    ).resolves.toBe(media);
  });

  it.each([
    [
      'another user',
      new Types.ObjectId(),
      'image/webp',
      MediaVisibility.PRIVATE,
    ],
    ['a PDF', ownerId, 'application/pdf', MediaVisibility.PRIVATE],
    ['public visibility', ownerId, 'image/png', MediaVisibility.PUBLIC],
  ])('rejects %s', async (_case, uploaderId, mimeType, visibility) => {
    const media = {
      _id: new Types.ObjectId(),
      uploaderId,
      mimeType,
      visibility,
    };

    await expect(
      serviceWith(media).assertOwnedImage(
        media._id.toString(),
        ownerId.toString(),
        MediaVisibility.PRIVATE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('cleans stale unattached progress-photo media from storage and Mongo', async () => {
    const candidate = {
      _id: new Types.ObjectId(),
      path: 'media-progress.webp',
      purpose: 'progress_photo',
      deletingAt: new Date('2026-08-25T00:00:00.000Z'),
    };
    const chain = {
      sort: jest.fn(),
      limit: jest.fn().mockResolvedValue([candidate]),
    };
    chain.sort.mockReturnValue(chain);
    const model = {
      find: jest.fn().mockReturnValue(chain),
      findOneAndUpdate: jest.fn().mockResolvedValue(candidate),
      findOne: jest.fn().mockResolvedValue(candidate),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const storage = { delete: jest.fn().mockResolvedValue(undefined) };
    const service = new MediaService(
      model as never,
      {} as never,
      storage as never,
    );

    await expect(
      service.cleanupManagedMediaOrphans(new Date('2026-08-26T12:00:00.000Z')),
    ).resolves.toEqual({ scanned: 1, deleted: 1, failed: 0 });
    expect(storage.delete).toHaveBeenCalledWith(candidate.path);
    expect(model.deleteOne).toHaveBeenCalledTimes(1);
  });

  it('keeps a deletion marker for worker retry when storage fails', async () => {
    const candidate = {
      _id: new Types.ObjectId(),
      path: 'media-progress.webp',
      purpose: 'progress_photo',
      deletingAt: new Date('2026-08-25T00:00:00.000Z'),
    };
    const chain = {
      sort: jest.fn(),
      limit: jest.fn().mockResolvedValue([candidate]),
    };
    chain.sort.mockReturnValue(chain);
    const model = {
      find: jest.fn().mockReturnValue(chain),
      findOneAndUpdate: jest.fn().mockResolvedValue(candidate),
      findOne: jest.fn().mockResolvedValue(candidate),
      deleteOne: jest.fn(),
    };
    const storage = { delete: jest.fn().mockRejectedValue(new Error('down')) };
    const service = new MediaService(
      model as never,
      {} as never,
      storage as never,
    );

    await expect(service.cleanupManagedMediaOrphans()).resolves.toEqual({
      scanned: 1,
      deleted: 0,
      failed: 1,
    });
    expect(model.deleteOne).not.toHaveBeenCalled();
  });

  it('removes the stored object when Mongo persistence fails', async () => {
    const previousUploadDir = process.env.UPLOAD_DIR;
    const uploadDir = mkdtempSync(join(tmpdir(), 'gym4me-media-'));
    process.env.UPLOAD_DIR = uploadDir;
    const filename = `media-rollback-${Date.now()}.webp`;
    const staged = join(uploadDir, filename);
    writeFileSync(staged, Buffer.from('sanitized-image'));
    const model = { create: jest.fn().mockRejectedValue(new Error('mongo')) };
    const storage = {
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const service = new MediaService(
      model as never,
      { log: jest.fn() } as never,
      storage as never,
    );

    try {
      await expect(
        service.create(
          {
            filename,
            mimetype: 'image/webp',
            size: 15,
            originalname: 'photo.webp',
          } as Express.Multer.File,
          ownerId.toString(),
        ),
      ).rejects.toThrow('mongo');
      expect(storage.delete).toHaveBeenCalledWith(filename);
    } finally {
      if (previousUploadDir === undefined) delete process.env.UPLOAD_DIR;
      else process.env.UPLOAD_DIR = previousUploadDir;
      rmSync(uploadDir, { recursive: true, force: true });
    }
  });

  it('opens scoped social media only through its exact attachment', async () => {
    const postId = new Types.ObjectId();
    const mediaId = new Types.ObjectId();
    const model = {
      findOne: jest.fn().mockResolvedValue({
        _id: mediaId,
        path: 'social.webp',
        mimeType: 'image/webp',
        size: 12,
      }),
    };
    const storage = {
      exists: jest.fn().mockResolvedValue(true),
      open: jest.fn().mockResolvedValue({ stream: {}, size: 12 }),
    };
    const service = new MediaService(
      model as never,
      {} as never,
      storage as never,
    );

    await service.openAttachedFile(
      mediaId.toString(),
      MediaPurpose.SOCIAL_POST,
      'social_post',
      postId,
    );
    expect(model.findOne).toHaveBeenCalledWith({
      _id: mediaId,
      purpose: MediaPurpose.SOCIAL_POST,
      'attachment.kind': 'social_post',
      'attachment.refId': postId,
      deletingAt: { $exists: false },
    });
  });
});
