import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types';
import {
  SubmitCoachVerificationDto,
  UpdateAthleteProfileDto,
  UpdateCoachProfileDto,
  UpdateMeDto,
} from './dto/update-me.dto';
import {
  ProfileSettingsDto,
  UpdateProfileSettingsDto,
} from './dto/update-profile-settings.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth('access-token')
@Controller('account/profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser('sub') userId: string) {
    return this.profile.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user base profile' })
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateMeDto) {
    return this.profile.updateMe(user.sub, dto, user);
  }

  @Get('settings')
  @ApiOkResponse({ type: ProfileSettingsDto })
  @ApiOperation({ summary: 'Get current user display settings' })
  getSettings(@CurrentUser('sub') userId: string) {
    return this.profile.getSettings(userId);
  }

  @Patch('settings')
  @ApiOkResponse({ type: ProfileSettingsDto })
  @ApiOperation({ summary: 'Update current user display settings' })
  updateSettings(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileSettingsDto,
    @Req() request: Request,
  ) {
    return this.profile.updateSettings(userId, dto, request);
  }

  @Get('athlete')
  @ApiOperation({
    summary: 'Get athlete role profile (requires athlete membership)',
  })
  getAthlete(@CurrentUser() user: JwtUser) {
    return this.profile.getAthleteProfile(user);
  }

  @Patch('athlete')
  @ApiOperation({
    summary: 'Update athlete profile (requires activeRole=athlete)',
  })
  updateAthlete(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateAthleteProfileDto,
  ) {
    return this.profile.updateAthleteProfile(user, dto);
  }

  @Get('coach')
  @ApiOperation({
    summary: 'Get coach role profile (requires coach membership)',
  })
  getCoach(@CurrentUser() user: JwtUser) {
    return this.profile.getCoachProfile(user);
  }

  @Patch('coach')
  @ApiOperation({
    summary: 'Update coach profile (requires activeRole=coach)',
  })
  updateCoach(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateCoachProfileDto,
  ) {
    return this.profile.updateCoachProfile(user, dto);
  }

  @Post('coach/verification')
  @ApiOperation({
    summary: 'Submit coach verification (requires activeRole=coach)',
  })
  submitCoachVerification(
    @CurrentUser() user: JwtUser,
    @Body() dto: SubmitCoachVerificationDto,
    @Req() request: Request,
  ) {
    return this.profile.submitCoachVerification(user, dto, request);
  }
}
