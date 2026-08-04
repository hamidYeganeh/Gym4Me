import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Request } from 'express';
import { OtpService } from '../../account/auth/otp.service';
import { TokenService } from '../../account/auth/token.service';
import {
  LoginDto,
  LogoutDto,
  ResetPasswordDto,
} from '../../account/auth/dto/auth.dto';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, OtpPurpose, Role, UserStatus } from '../../common/enums';
import type { UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly users: UsersService,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  async requestOtp(phone: string) {
    // Identical response either way — no account enumeration.
    const user = await this.users.findByPhone(phone);
    if (user && this.isAdmin(user) && user.status === UserStatus.ACTIVE) {
      return this.otp.request(phone, OtpPurpose.AUTH);
    }
    return { expiresInSeconds: 120 };
  }

  async confirmOtp(phone: string, code: string, request: Request) {
    await this.otp.verify(phone, OtpPurpose.AUTH, code);

    const user = await this.requireAdminByPhone(phone);
    if (!user.phoneVerifiedAt) {
      user.phoneVerifiedAt = new Date();
      await user.save();
    }

    this.audit.log({
      action: AuditAction.USER_LOGIN,
      actorId: user._id,
      targetUserId: user._id,
      metadata: { method: 'otp', scope: 'admin' },
      request,
    });

    const pair = await this.tokens.issuePair(user, Role.ADMIN);
    return {
      ...pair,
      isNewUser: false,
      activeRole: Role.ADMIN,
      user: this.users.toPublic(user),
    };
  }

  async login(dto: LoginDto, request: Request) {
    const user = await this.users.findByPhone(dto.phone);
    if (!user?.passwordHash || !this.isAdmin(user)) {
      throw new UnauthorizedException('Invalid phone or password');
    }
    this.assertActive(user);

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    this.audit.log({
      action: AuditAction.USER_LOGIN,
      actorId: user._id,
      targetUserId: user._id,
      metadata: { method: 'password', scope: 'admin' },
      request,
    });

    const pair = await this.tokens.issuePair(user, Role.ADMIN);
    return {
      ...pair,
      isNewUser: false,
      activeRole: Role.ADMIN,
      user: this.users.toPublic(user),
    };
  }

  async refresh(refreshToken: string) {
    const userId = await this.tokens.resolveUserId(refreshToken);
    const user = await this.users.findById(userId.toString());
    this.assertActive(user);
    this.assertAdmin(user);
    // Admin panel sessions must always carry activeRole=admin.
    return this.tokens.rotate(user, refreshToken, Role.ADMIN);
  }

  async logout(userId: string, dto: LogoutDto, request: Request) {
    const user = await this.users.findById(userId);
    this.assertAdmin(user);

    if (dto.all) {
      await this.tokens.revokeAll(userId);
    } else if (dto.refreshToken) {
      await this.tokens.revoke(dto.refreshToken);
    } else {
      throw new BadRequestException('Provide refreshToken or all=true');
    }

    this.audit.log({
      action: AuditAction.USER_LOGOUT,
      actorId: userId,
      targetUserId: userId,
      metadata: { all: dto.all ?? false, scope: 'admin' },
      request,
    });

    return { success: true };
  }

  async forgotPassword(phone: string) {
    const user = await this.users.findByPhone(phone);
    if (
      user &&
      this.isAdmin(user) &&
      user.status === UserStatus.ACTIVE
    ) {
      return this.otp.request(phone, OtpPurpose.PASSWORD_RESET);
    }
    return { expiresInSeconds: 120 };
  }

  async forgotPasswordConfirm(phone: string, code: string) {
    await this.otp.verify(phone, OtpPurpose.PASSWORD_RESET, code);
    const user = await this.requireAdminByPhone(phone);

    const resetToken = await this.tokens.signPasswordResetToken(
      user._id.toString(),
    );
    return { resetToken, expiresInSeconds: 600 };
  }

  async resetPassword(dto: ResetPasswordDto, request: Request) {
    const userId = await this.tokens.verifyPasswordResetToken(dto.resetToken);
    const user = await this.users.findById(userId);
    this.assertActive(user);
    this.assertAdmin(user);

    user.passwordHash = await argon2.hash(dto.password);
    await user.save();
    await this.tokens.revokeAll(user._id);

    this.audit.log({
      action: AuditAction.PASSWORD_RESET,
      actorId: user._id,
      targetUserId: user._id,
      metadata: { scope: 'admin' },
      request,
    });

    return { success: true };
  }

  private async requireAdminByPhone(phone: string): Promise<UserDocument> {
    const user = await this.users.findByPhone(phone);
    if (!user || !this.isAdmin(user)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    this.assertActive(user);
    return user;
  }

  private isAdmin(user: UserDocument): boolean {
    return user.roles?.includes(Role.ADMIN) ?? false;
  }

  private assertAdmin(user: UserDocument): void {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Admin access required');
    }
  }

  private assertActive(user: UserDocument): void {
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }
  }
}
