import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  MediaVisibility,
  Privacy,
  Role,
  SocialPostStatus,
} from '../common/enums';
import { MediaPurpose } from '../schemas/media.schema';
import { SocialService } from './social.service';

describe('SocialService media policy', () => {
  const userId = new Types.ObjectId().toString();
  const mediaId = new Types.ObjectId().toString();
  const replacementMediaId = new Types.ObjectId().toString();

  function setup(claimError?: Error) {
    const created = {
      _id: new Types.ObjectId(),
      authorUserId: new Types.ObjectId(userId),
      body: 'تمرین امروز',
      mediaIds: [new Types.ObjectId(mediaId)],
      status: SocialPostStatus.PUBLISHED,
      visibility: Privacy.PUBLIC,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date('2026-08-26T00:00:00.000Z'),
      updatedAt: new Date('2026-08-26T00:00:00.000Z'),
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return this;
      },
    };
    const posts = {
      create: jest.fn().mockResolvedValue([created]),
      findOne: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(created),
    };
    const session = {};
    const transactions = {
      run: jest.fn((work: (value: unknown) => unknown) => work(session)),
    };
    const media = {
      assertOwnedImage: jest.fn().mockResolvedValue({}),
      claimSocialPost: claimError
        ? jest.fn().mockRejectedValue(claimError)
        : jest.fn().mockResolvedValue(undefined),
      setSocialPostMediaVisibility: jest.fn().mockResolvedValue(undefined),
      releaseSocialPost: jest.fn().mockResolvedValue(undefined),
    };
    const audit = { log: jest.fn() };
    const service = new SocialService(
      posts as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      audit as never,
      media as never,
      transactions as never,
    );
    return { audit, created, media, posts, service, session };
  }

  it('claims owned public social media inside the post transaction', async () => {
    const { audit, created, media, service, session } = setup();

    await service.createPost(
      {
        idempotencyKey: 'social-create-public',
        body: 'تمرین امروز',
        mediaIds: [mediaId],
        status: SocialPostStatus.PUBLISHED,
        visibility: Privacy.PUBLIC,
      },
      userId,
      {} as never,
    );

    expect(media.assertOwnedImage).toHaveBeenCalledWith(
      mediaId,
      userId,
      MediaVisibility.PRIVATE,
      MediaPurpose.SOCIAL_POST,
    );
    expect(media.claimSocialPost).toHaveBeenCalledWith(
      mediaId,
      userId,
      created._id,
      session,
    );
    expect(media.setSocialPostMediaVisibility).toHaveBeenCalledWith(
      [mediaId],
      userId,
      created._id,
      MediaVisibility.PUBLIC,
      session,
    );
    expect(audit.log).toHaveBeenCalledTimes(1);
  });

  it('keeps follower-scoped post media private', async () => {
    const { created, media, service, session } = setup();
    await service.createPost(
      {
        idempotencyKey: 'social-create-followers',
        body: 'تمرین امروز',
        mediaIds: [mediaId],
        status: SocialPostStatus.PUBLISHED,
        visibility: Privacy.FOLLOWERS,
      },
      userId,
      {} as never,
    );
    expect(media.setSocialPostMediaVisibility).toHaveBeenCalledWith(
      [mediaId],
      userId,
      created._id,
      MediaVisibility.PRIVATE,
      session,
    );
  });

  it('makes draft attachment bytes private in the same transaction', async () => {
    const { created, media, service, session } = setup();
    await service.createPost(
      {
        idempotencyKey: 'social-create-draft',
        body: 'پیش‌نویس تمرین',
        mediaIds: [mediaId],
        status: SocialPostStatus.DRAFT,
        visibility: Privacy.PUBLIC,
      },
      userId,
      {} as never,
    );
    expect(media.setSocialPostMediaVisibility).toHaveBeenCalledWith(
      [mediaId],
      userId,
      created._id,
      MediaVisibility.PRIVATE,
      session,
    );
  });

  it('does not audit or return a post when media claim fails', async () => {
    const { audit, service } = setup(new ForbiddenException());
    await expect(
      service.createPost(
        {
          idempotencyKey: 'social-create-failure',
          body: 'تمرین امروز',
          mediaIds: [mediaId],
          visibility: Privacy.PUBLIC,
        },
        userId,
        {} as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('replaces attachments atomically and schedules removed media cleanup', async () => {
    const { created, media, service, session } = setup();
    await service.updatePost(
      created._id.toString(),
      { mediaIds: [replacementMediaId] },
      userId,
      Role.ATHLETE,
      {} as never,
    );
    expect(media.claimSocialPost).toHaveBeenCalledWith(
      replacementMediaId,
      userId,
      created._id,
      session,
    );
    expect(media.releaseSocialPost).toHaveBeenCalledWith(
      [mediaId],
      userId,
      created._id,
      session,
    );
  });

  it('returns the original post on a safe retry without a second mutation', async () => {
    const { audit, created, posts, service } = setup();
    const dto = {
      idempotencyKey: 'social-post-safe-retry',
      body: 'تمرین امروز',
      mediaIds: [mediaId],
      status: SocialPostStatus.PUBLISHED,
      visibility: Privacy.PUBLIC,
    };
    await service.createPost(dto, userId, {} as never);
    const payload = posts.create.mock.calls[0]?.[0]?.[0] as {
      idempotencyFingerprint: string;
    };
    Object.assign(created, {
      idempotencyFingerprint: payload.idempotencyFingerprint,
    });
    posts.findOne.mockResolvedValue(created);

    await service.createPost(dto, userId, {} as never);
    expect(posts.create).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledTimes(1);
  });
});
