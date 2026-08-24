import { ForbiddenException } from '@nestjs/common';
import { OtpPurpose, Role, UserStatus } from '../../common/enums';
import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  const createService = (user: unknown) => {
    const users = { findByPhone: jest.fn().mockResolvedValue(user) };
    const otp = {
      request: jest.fn().mockResolvedValue({ expiresInSeconds: 120 }),
    };
    const service = new AdminAuthService(
      users as never,
      otp as never,
      {} as never,
      {} as never,
      { get: jest.fn() } as never,
    );

    return { service, otp };
  };

  it.each([
    ['an unknown phone', null],
    [
      'a non-admin account',
      { roles: [Role.ATHLETE], status: UserStatus.ACTIVE },
    ],
  ])('rejects %s before requesting an OTP', async (_label, user) => {
    const { service, otp } = createService(user);

    await expect(service.requestOtp('+989121234567')).rejects.toThrow(
      ForbiddenException,
    );
    expect(otp.request).not.toHaveBeenCalled();
  });

  it('requests an OTP for an active admin', async () => {
    const { service, otp } = createService({
      roles: [Role.ADMIN],
      status: UserStatus.ACTIVE,
    });

    await expect(service.requestOtp('+989121234567')).resolves.toEqual({
      expiresInSeconds: 120,
    });
    expect(otp.request).toHaveBeenCalledWith(
      '+989121234567',
      OtpPurpose.ADMIN_AUTH,
    );
  });
});
