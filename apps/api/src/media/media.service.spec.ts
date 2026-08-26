import { ForbiddenException } from '@nestjs/common';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Types } from 'mongoose';
import { MediaScanStatus, MediaVisibility } from '../common/enums';
import { EICAR_TEST_MARKER } from '../common/malware/mock-malware-scanner.service';
import { MediaPurpose } from '../schemas/media.schema';
import { MediaService } from './media.service';

describe('MediaService ownership policy', () => {
  const ownerId = new Types.ObjectId();

  function serviceWith(
    media: Record<string, unknown>,
    modelOverrides: Record<string, unknown> = {},
  ) {
    const model = {
      findById: jest.fn().mockResolvedValue(media),
      ...modelOverrides,
    };
    return new MediaService(
      model as never,
      {} as never,
      {} as never,
      { scan: jest.fn().mockResolvedValue('clean') } as never,
      { get: jest.fn((_key: string, fallback?: string) => fallback) } as never,
    );
  }

  function fullService(
    model: Record<string, unknown>,
    storage: Record<string, unknown>,
    scanner: Record<string, unknown> = {
      scan: jest.fn().mockResolvedValue('clean'),
    },
    config: Record<string, unknown> = {
      get: jest.fn((_key: string, fallback?: string) => fallback),
    },
    audit: Record<string, unknown> = { log: jest.fn() },
  ) {
    return new MediaService(
      model as never,
      audit as never,
      storage as never,
      scanner as never,
      config as never,
    );
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
    const service = fullService(model, storage);

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
    const service = fullService(model, storage);

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
    const service = fullService(model, storage, {
      scan: jest.fn().mockResolvedValue('clean'),
    });

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
    const service = fullService(model, storage);

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
      'scan.status': MediaScanStatus.CLEAN,
    });
  });

  it('blocks file streaming until scan completes', async () => {
    const media = {
      _id: new Types.ObjectId(),
      uploaderId: ownerId,
      mimeType: 'image/webp',
      visibility: MediaVisibility.PRIVATE,
      purpose: MediaPurpose.PROGRESS_PHOTO,
      scan: { status: MediaScanStatus.PENDING_SCAN },
      path: 'pending.webp',
    };
    const storage = {
      exists: jest.fn().mockResolvedValue(true),
      open: jest.fn(),
    };
    const service = serviceWith(media, {});

    await expect(
      service.openFile(media._id.toString(), {
        sub: ownerId.toString(),
        activeRole: 'athlete',
        roles: ['athlete'],
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.open).not.toHaveBeenCalled();
  });

  it('rejects managed uploads in production when only the mock scanner is configured', async () => {
    const service = fullService(
      { create: jest.fn() },
      { put: jest.fn() },
      { scan: jest.fn() },
      {
        get: jest.fn((key: string, fallback?: string) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'MALWARE_SCANNER_PROVIDER') return 'mock';
          return fallback;
        }),
      },
    );

    await expect(
      service.create(
        {
          filename: 'photo.webp',
          mimetype: 'image/webp',
          size: 10,
          originalname: 'photo.webp',
        } as Express.Multer.File,
        ownerId.toString(),
        undefined,
        { purpose: MediaPurpose.PROGRESS_PHOTO, visibility: MediaVisibility.PRIVATE },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('quarantines infected managed media during scan processing', async () => {
    const candidate = {
      _id: new Types.ObjectId(),
      path: 'infected.webp',
      mimeType: 'image/webp',
      size: 68,
      scan: { status: MediaScanStatus.PENDING_SCAN, attempts: 0 },
    };
    const chain = {
      sort: jest.fn(),
      limit: jest.fn().mockResolvedValue([candidate]),
    };
    chain.sort.mockReturnValue(chain);
    const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    const model = {
      find: jest.fn().mockReturnValue(chain),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        ...candidate,
        scan: { status: MediaScanStatus.PENDING_SCAN, attempts: 1 },
      }),
      updateOne,
    };
    const scanner = {
      scan: jest.fn().mockResolvedValue('infected'),
    };
    const service = fullService(model, {}, scanner);

    await expect(service.processPendingScans()).resolves.toEqual({
      scanned: 1,
      clean: 0,
      quarantined: 1,
      failed: 0,
    });
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: candidate._id }),
      expect.objectContaining({
        $set: expect.objectContaining({
          scan: expect.objectContaining({
            status: MediaScanStatus.QUARANTINED,
            lastErrorCode: 'malware_detected',
          }),
        }),
      }),
    );
  });

  it('marks pending managed media clean after a successful scan', async () => {
    const previousUploadDir = process.env.UPLOAD_DIR;
    const uploadDir = mkdtempSync(join(tmpdir(), 'gym4me-media-scan-'));
    process.env.UPLOAD_DIR = uploadDir;
    const key = 'clean.webp';
    writeFileSync(join(uploadDir, key), Buffer.from('sanitized-image'));

    const candidate = {
      _id: new Types.ObjectId(),
      path: key,
      mimeType: 'image/webp',
      size: 16,
      scan: { status: MediaScanStatus.PENDING_SCAN, attempts: 0 },
    };
    const chain = {
      sort: jest.fn(),
      limit: jest.fn().mockResolvedValue([candidate]),
    };
    chain.sort.mockReturnValue(chain);
    const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    const model = {
      find: jest.fn().mockReturnValue(chain),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        ...candidate,
        scan: { status: MediaScanStatus.PENDING_SCAN, attempts: 1 },
      }),
      updateOne,
    };
    const scanner = { scan: jest.fn().mockResolvedValue('clean') };
    const service = fullService(model, {}, scanner, {
      get: jest.fn((_key: string, fallback?: string) => fallback),
    });

    try {
      await expect(service.processPendingScans()).resolves.toEqual({
        scanned: 1,
        clean: 1,
        quarantined: 0,
        failed: 0,
      });
    } finally {
      rmSync(uploadDir, { recursive: true, force: true });
      if (previousUploadDir === undefined) delete process.env.UPLOAD_DIR;
      else process.env.UPLOAD_DIR = previousUploadDir;
    }
  });
});
