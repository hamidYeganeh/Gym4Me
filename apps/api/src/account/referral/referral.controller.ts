import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { JwtUser } from '../../common/types';
import { InviteDto } from './dto/invite.dto';
import { ReferralService } from './referral.service';

@ApiTags('referral')
@Controller('account/referral')
export class ReferralController {
  constructor(private readonly referral: ReferralService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate a referral code' })
  validate(@Param('code') code: string) {
    return this.referral.validate(code);
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get current user referral info' })
  myReferral(@CurrentUser('sub') userId: string) {
    return this.referral.myReferral(userId);
  }

  @ApiBearerAuth('access-token')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @Post('invite')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invite contacts via SMS' })
  invite(
    @CurrentUser() user: JwtUser,
    @Body() dto: InviteDto,
    @Req() request: Request,
  ) {
    return this.referral.invite(user.sub, dto.phones, request, user.activeRole);
  }

  @ApiBearerAuth('access-token')
  @Get('invites')
  @ApiOperation({ summary: 'List invites sent by the current user' })
  myInvites(@CurrentUser('sub') userId: string) {
    return this.referral.myInvites(userId);
  }
}
