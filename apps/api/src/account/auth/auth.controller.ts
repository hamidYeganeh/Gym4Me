import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AUTH_THROTTLE } from '../../common/throttling/auth-throttle';
import { AuthService } from './auth.service';
import {
  ConfirmOtpDto,
  ForgotPasswordConfirmDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RequestOtpDto,
  ResetPasswordDto,
  SetPasswordDto,
  SwitchRoleDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('account/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request OTP for phone login / signup' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm OTP and issue tokens' })
  confirmOtp(@Body() dto: ConfirmOtpDto, @Req() request: Request) {
    return this.auth.confirmOtp(dto, request);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with phone and password' })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.auth.login(dto, request);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout current session (or all sessions)' })
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
  @ApiOperation({ summary: 'Start password reset via OTP' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.phone);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('forgot-password/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm password-reset OTP' })
  forgotPasswordConfirm(@Body() dto: ForgotPasswordConfirmDto) {
    return this.auth.forgotPasswordConfirm(dto.phone, dto.code);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password/reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set a new password with reset token' })
  resetPassword(@Body() dto: ResetPasswordDto, @Req() request: Request) {
    return this.auth.resetPassword(dto, request);
  }

  @ApiBearerAuth('access-token')
  @Post('set-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set or change password while authenticated' })
  setPassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: SetPasswordDto,
    @Req() request: Request,
  ) {
    return this.auth.setPassword(userId, dto, request);
  }

  @ApiBearerAuth('access-token')
  @Post('switch-role')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Switch active role and receive a new token pair (revokes prior refresh)',
  })
  switchRole(
    @CurrentUser('sub') userId: string,
    @Body() dto: SwitchRoleDto,
    @Req() request: Request,
  ) {
    return this.auth.switchRole(userId, dto, request);
  }
}
