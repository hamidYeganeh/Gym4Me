import { Types } from 'mongoose';
import { MediaVisibility, Privacy, Role } from '../common/enums';
import { MediaPurpose } from '../schemas/media.schema';
import { ProgressService } from './progress.service';

describe('ProgressService progress-photo media policy', () => {
  it('verifies private image ownership before persisting the photo', async () => {
    const userId = new Types.ObjectId().toString();
    const mediaId = new Types.ObjectId().toString();
    const created = {
      _id: new Types.ObjectId(),
      athleteUserId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
      privacy: Privacy.PRIVATE,
      capturedAt: new Date('2026-08-26T00:00:00.000Z'),
      createdAt: new Date('2026-08-26T00:00:00.000Z'),
      updatedAt: new Date('2026-08-26T00:00:00.000Z'),
      toObject() {
        return this;
      },
    };
    const photos = { create: jest.fn().mockResolvedValue([created]) };
    const session = {};
    const transactions = {
      run: jest.fn((work: (value: unknown) => unknown) => work(session)),
    };
    const media = {
      assertOwnedImage: jest.fn().mockResolvedValue({}),
      claimProgressPhoto: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ProgressService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      photos as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { log: jest.fn() } as never,
      {} as never,
      {} as never,
      transactions as never,
      {} as never,
      media as never,
    );

    await service.createPhoto(
      {
        mediaId,
        capturedAt: '2026-08-26T00:00:00.000Z',
        privacy: Privacy.PRIVATE,
      },
      userId,
      Role.ATHLETE,
      {} as never,
    );

    expect(media.assertOwnedImage).toHaveBeenCalledWith(
      mediaId,
      userId,
      MediaVisibility.PRIVATE,
      MediaPurpose.PROGRESS_PHOTO,
    );
    expect(photos.create).toHaveBeenCalledTimes(1);
    expect(media.claimProgressPhoto).toHaveBeenCalledWith(
      mediaId,
      userId,
      created._id,
      session,
    );
  });
});
