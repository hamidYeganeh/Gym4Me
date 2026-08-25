import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { VerificationStatus } from '../common/enums';
import { AdminVerificationService } from './admin-verification.service';

describe('AdminVerificationService coach credentials', () => {
  function setup() {
    const profile = {
      userId: new Types.ObjectId(),
      verification: {
        status: VerificationStatus.PENDING,
        documentMediaIds: [new Types.ObjectId()],
      },
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const profiles = {
      getCoachProfileByUserId: jest.fn().mockResolvedValue(profile),
    };
    const roles = {
      syncFromCoachVerificationReview: jest.fn().mockResolvedValue(false),
    };
    const audit = { log: jest.fn() };
    const events = { track: jest.fn().mockResolvedValue(undefined) };
    const service = new AdminVerificationService(
      {} as never,
      {} as never,
      profiles as never,
      {} as never,
      roles as never,
      audit as never,
      events as never,
    );
    return { service, profile, profiles, roles, audit, events };
  }

  it('requires reviewed credential metadata for approval', async () => {
    const { service, profiles } = setup();

    await expect(
      service.reviewCoach(
        new Types.ObjectId().toString(),
        { action: 'approve' },
        new Types.ObjectId().toString(),
        {} as Request,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(profiles.getCoachProfileByUserId).not.toHaveBeenCalled();
  });

  it('persists a Tehran-bound public credential without exposing documents', async () => {
    const { service, profile, audit, events } = setup();

    const result = await service.reviewCoach(
      profile.userId.toString(),
      {
        action: 'approve',
        credential: {
          typeKey: 'federation_coaching_card',
          issuer: 'فدراسیون آمادگی جسمانی',
          issuedAt: '2098-01-01',
          expiresAt: '2099-12-31',
        },
      },
      new Types.ObjectId().toString(),
      {} as Request,
    );

    expect(profile.verification).toMatchObject({
      status: VerificationStatus.APPROVED,
      credential: {
        typeKey: 'federation_coaching_card',
        issuer: 'فدراسیون آمادگی جسمانی',
        issuedAt: new Date('2097-12-31T20:30:00.000Z'),
        expiresAt: new Date('2099-12-31T20:29:59.999Z'),
      },
    });
    expect(profile.save).toHaveBeenCalledTimes(1);
    expect(result.verification).not.toHaveProperty('documentMediaIds');
    expect(audit.log).toHaveBeenCalledTimes(1);
    expect(events.track).toHaveBeenCalledTimes(1);
  });

  it('rejects an already expired credential', async () => {
    const { service } = setup();

    await expect(
      service.reviewCoach(
        new Types.ObjectId().toString(),
        {
          action: 'approve',
          credential: {
            typeKey: 'legacy_card',
            issuer: 'مرجع تست',
            expiresAt: '2020-01-01',
          },
        },
        new Types.ObjectId().toString(),
        {} as Request,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
