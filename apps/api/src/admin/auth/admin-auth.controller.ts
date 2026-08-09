import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import {
  ForgotPasswordConfirmDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RequestOtpDto,
  ResetPasswordDto,
} from '../../account/auth/dto/auth.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { AUTH_THROTTLE } from '../../common/throttling/auth-throttle';
import { AdminAuthService } from './admin-auth.service';
import { AdminConfirmOtpDto } from './dto/admin-auth.dto';

@ApiTags('admin-auth')
@Controller('admin/account/auth')
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request OTP for admin phone login' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm admin OTP and issue tokens' })
  confirmOtp(@Body() dto: AdminConfirmOtpDto, @Req() request: Request) {
    return this.auth.confirmOtp(dto.phone, dto.code, request);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin login with phone and password' })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.auth.login(dto, request);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh admin access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout admin session (or all sessions)' })
  logout(
    @CurrentUser('sub') userId: string,
    @Body() dto: LogoutDto,
    @Req() request: Request,
  ) {
    return this.auth.logout(userId, dto, request);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start admin password reset via OTP' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.phone);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('forgot-password/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm admin password-reset OTP' })
  forgotPasswordConfirm(@Body() dto: ForgotPasswordConfirmDto) {
    return this.auth.forgotPasswordConfirm(dto.phone, dto.code);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password/reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set a new admin password with reset token' })
  resetPassword(@Body() dto: ResetPasswordDto, @Req() request: Request) {
    return this.auth.resetPassword(dto, request);
  }
}
