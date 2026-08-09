import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Request } from 'express';
import { EventWriterService } from '../../analytics/event-writer.service';
import { AuditService } from '../../audit/audit.service';
import {
  AnalyticsEventName,
  AuditAction,
  OtpPurpose,
  Role,
  UserStatus,
} from '../../common/enums';
import type { UserDocument } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';
import {
  ConfirmOtpDto,
  LoginDto,
  LogoutDto,
  ResetPasswordDto,
  SetPasswordDto,
  SwitchRoleDto,
} from './dto/auth.dto';
import { OtpService } from './otp.service';
import { pickDefaultActiveRole, TokenService } from './token.service';

function asAccountRole(role: SwitchRoleDto['role']): Role {
  return role as unknown as Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
  ) {}

  async requestOtp(phone: string) {
    // Same response whether or not the user exists — no enumeration.
    return this.otp.request(phone, OtpPurpose.AUTH);
  }

  async confirmOtp(dto: ConfirmOtpDto, request: Request) {
    await this.otp.verify(dto.phone, OtpPurpose.AUTH, dto.code);

    let user = await this.users.findByPhone(dto.phone);
    const isNewUser = !user;

    if (!user) {
      user = await this.users.create({
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        referralCode: dto.referralCode,
        phoneVerified: true,
      });
      this.audit.log({
        action: AuditAction.USER_REGISTERED,
        actorId: user._id,
        targetUserId: user._id,
        metadata: { method: 'otp', referralCode: dto.referralCode },
        request,
      });
      await this.events.track({
        eventName: AnalyticsEventName.USER_REGISTERED,
        actor: { userId: user._id, activeRole: Role.ATHLETE },
        properties: { method: 'otp', referralCode: dto.referralCode },
      });
    } else {
      this.assertActive(user);
      if (!user.phoneVerifiedAt) {
        user.phoneVerifiedAt = new Date();
        await user.save();
      }
    }

    this.audit.log({
      action: AuditAction.USER_LOGIN,
      actorId: user._id,
      targetUserId: user._id,
      metadata: { method: 'otp' },
      request,
    });

    const activeRole = pickDefaultActiveRole(user.roles);
    await this.events.track({
      eventName: AnalyticsEventName.USER_LOGIN,
      actor: { userId: user._id, activeRole },
      properties: { method: 'otp', isNewUser },
    });

    const pair = await this.tokens.issuePair(user, activeRole);
    return {
      ...pair,
      isNewUser,
      activeRole,
      user: this.users.toPublic(user),
    };
  }

  async login(dto: LoginDto, request: Request) {
    const user = await this.users.findByPhone(dto.phone);
    if (!user?.passwordHash) {
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
      metadata: { method: 'password' },
      request,
    });

    const activeRole = pickDefaultActiveRole(user.roles);
    await this.events.track({
      eventName: AnalyticsEventName.USER_LOGIN,
      actor: { userId: user._id, activeRole },
      properties: { method: 'password' },
    });
    const pair = await this.tokens.issuePair(user, activeRole);
    return {
      ...pair,
      isNewUser: false,
      activeRole,
      user: this.users.toPublic(user),
    };
  }

  async refresh(refreshToken: string) {
    const userId = await this.tokens.resolveUserId(refreshToken);
    const user = await this.users.findById(userId.toString());
    this.assertActive(user);
    return this.tokens.rotate(user, refreshToken);
  }

  async switchRole(
    userId: string,
    dto: SwitchRoleDto,
    request: Request,
  ) {
    const user = await this.users.findById(userId);
    this.assertActive(user);

    const nextRole = asAccountRole(dto.role);
    if (!user.roles.includes(nextRole)) {
      throw new BadRequestException('Role not assigned to user');
    }

    const pair = await this.tokens.switchRole(
      user,
      dto.refreshToken,
      nextRole,
    );

    this.audit.log({
      action: AuditAction.ROLE_SWITCHED,
      actorId: user._id,
      targetUserId: user._id,
      metadata: { activeRole: nextRole },
      request,
    });

    await this.events.track({
      eventName: AnalyticsEventName.ROLE_SWITCHED,
      actor: { userId: user._id, activeRole: nextRole },
      properties: { role: nextRole },
    });

    return {
      ...pair,
      activeRole: nextRole,
      user: this.users.toPublic(user),
    };
  }

  async logout(userId: string, dto: LogoutDto, request: Request) {
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
      metadata: { all: dto.all ?? false },
      request,
    });

    return { success: true };
  }

  async forgotPassword(phone: string) {
    // Only send if the account exists, but answer identically either way.
    const user = await this.users.findByPhone(phone);
    if (user && user.status === UserStatus.ACTIVE) {
      return this.otp.request(phone, OtpPurpose.PASSWORD_RESET);
    }
    return { expiresInSeconds: 120 };
  }

  async forgotPasswordConfirm(phone: string, code: string) {
    await this.otp.verify(phone, OtpPurpose.PASSWORD_RESET, code);
    const user = await this.users.findByPhone(phone);
    if (!user) throw new UnauthorizedException();
    this.assertActive(user);

    const resetToken = await this.tokens.signPasswordResetToken(
      user._id.toString(),
    );
    return { resetToken, expiresInSeconds: 600 };
  }

  async resetPassword(dto: ResetPasswordDto, request: Request) {
    const userId = await this.tokens.verifyPasswordResetToken(dto.resetToken);
    const user = await this.users.findById(userId);
    this.assertActive(user);

    user.passwordHash = await argon2.hash(dto.password);
    await user.save();
    await this.tokens.revokeAll(user._id);

    this.audit.log({
      action: AuditAction.PASSWORD_RESET,
      actorId: user._id,
      targetUserId: user._id,
      request,
    });

    return { success: true };
  }

  async setPassword(userId: string, dto: SetPasswordDto, request: Request) {
    const user = await this.users.findById(userId);

    if (user.passwordHash) {
      if (!dto.currentPassword) {
        throw new BadRequestException('currentPassword is required');
      }
      const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
      if (!valid) throw new UnauthorizedException('Wrong current password');
    }

    user.passwordHash = await argon2.hash(dto.password);
    await user.save();
    await this.tokens.revokeAll(user._id);

    this.audit.log({
      action: AuditAction.PASSWORD_SET,
      actorId: user._id,
      targetUserId: user._id,
      request,
    });

    return { success: true };
  }

  private assertActive(user: UserDocument): void {
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }
  }
}
