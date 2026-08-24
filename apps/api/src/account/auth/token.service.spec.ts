import { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type Redis from 'ioredis';
import { Types } from 'mongoose';
import { Role } from '../../common/enums';
import type { RefreshTokenDocument } from '../../schemas/refresh-token.schema';
import type { UserDocument } from '../../schemas/user.schema';
import { TokenService } from './token.service';

describe('TokenService multi-session isolation', () => {
  const userId = new Types.ObjectId();

  function createService() {
    const refreshModel = {
      create: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const jwt = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
    };
    const redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
    };
    const service = new TokenService(
      refreshModel as never,
      jwt as unknown as JwtService,
      new ConfigService({
        JWT_ACCESS_TTL: '15m',
        JWT_REFRESH_TTL_DAYS: '30',
      }),
      redis as unknown as Redis,
    );
    return { service, refreshModel, jwt, redis };
  }

  const user = {
    _id: userId,
    phone: '+989121234567',
    roles: [Role.ATHLETE, Role.ADMIN],
  } as UserDocument;

  it('issues a distinct session id for each login', async () => {
    const { service, refreshModel } = createService();

    await service.issuePair(user, Role.ATHLETE);
    await service.issuePair(user, Role.ADMIN);

    const first = refreshModel.create.mock.calls[0][0] as {
      sessionId: string;
    };
    const second = refreshModel.create.mock.calls[1][0] as {
      sessionId: string;
    };
    expect(first.sessionId).toBeTruthy();
    expect(second.sessionId).toBeTruthy();
    expect(first.sessionId).not.toBe(second.sessionId);
  });

  it('keeps the session id when rotating a refresh token', async () => {
    const { service, refreshModel, jwt } = createService();
    const token = {
      userId,
      tokenHash: 'old-hash',
      sessionId: 'mobile-session',
      activeRole: Role.ATHLETE,
      expiresAt: new Date(Date.now() + 60_000),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as RefreshTokenDocument;
    refreshModel.findOne.mockResolvedValue(token);

    await service.rotate(user, 'presented-token');

    expect(refreshModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'mobile-session' }),
    );
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'mobile-session' }),
      expect.any(Object),
    );
  });

  it('revokes only the reused token session, not every user session', async () => {
    const { service, refreshModel, redis } = createService();
    refreshModel.findOne.mockResolvedValue({
      userId,
      tokenHash: 'old-hash',
      sessionId: 'mobile-session',
      activeRole: Role.ATHLETE,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    });

    await expect(service.resolveUserId('reused-token')).rejects.toThrow(
      'Refresh token reuse detected',
    );

    expect(refreshModel.updateMany).toHaveBeenCalledWith(
      {
        userId,
        sessionId: 'mobile-session',
        revokedAt: null,
      },
      { revokedAt: expect.any(Date) },
    );
    expect(redis.set).toHaveBeenCalledWith(
      `auth:session_revoked:${userId.toString()}:mobile-session`,
      expect.any(String),
      'EX',
      900,
    );
    expect(redis.set).not.toHaveBeenCalledWith(
      `auth:sessions_revoked:${userId.toString()}`,
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });
});
