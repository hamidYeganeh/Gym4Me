import {
  Body,
  Controller,
  Get,
  GoneException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, StaffPermissionKey } from '../common/enums';
import { StaffService } from '../account/staff/staff.service';
import {
  JoinWaitlistDto,
  ListWaitlistQueryDto,
  OfferWaitlistDto,
} from './dto/waitlist.dto';
import { WaitlistService } from './waitlist.service';

@ApiTags('waitlist')
@ApiBearerAuth('access-token')
@Controller('account/waitlists')
export class AccountWaitlistController {
  constructor(private readonly waitlists: WaitlistService) {}

  @Get('mine')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'My waitlist entries' })
  listMine(
    @CurrentUser('sub') userId: string,
    @Query() query: ListWaitlistQueryDto,
  ) {
    return this.waitlists.listMine(userId, query);
  }

  @Post('join')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Join a resource waitlist' })
  join(
    @CurrentUser('sub') userId: string,
    @Body() dto: JoinWaitlistDto,
    @Req() request: Request,
  ) {
    return this.waitlists.join(userId, dto, request);
  }

  @Post(':waitlistId/leave')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Leave a waitlist' })
  leave(
    @CurrentUser('sub') userId: string,
    @Param('waitlistId') waitlistId: string,
    @Req() request: Request,
  ) {
    return this.waitlists.leave(userId, waitlistId, request);
  }

  @Post(':waitlistId/claim')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Claim a timed waitlist offer' })
  claim(
    @CurrentUser('sub') _userId: string,
    @Param('waitlistId') _waitlistId: string,
  ) {
    throw new GoneException(
      'Use POST /account/bookings/waitlist/:waitlistId/claim',
    );
  }

  @Post('expire-offers')
  @Roles(Role.CLUB_OWNER, Role.CLUB_STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Expire timed waitlist offers (cron-less callable)',
  })
  expireOffers(@Query('clubId') clubId?: string) {
    return this.waitlists.expireOffers(clubId);
  }
}

@ApiTags('club-waitlist')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@Controller('account/clubs/:clubId/waitlists')
export class ClubWaitlistController {
  constructor(
    private readonly waitlists: WaitlistService,
    private readonly staff: StaffService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List waitlists for a club' })
  async list(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListWaitlistQueryDto,
  ) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.BOOKINGS_READ,
    );
    return this.waitlists.listForClub(clubId, query);
  }

  @Post(':waitlistId/offer')
  @ApiOperation({ summary: 'Offer freed capacity to next waitlist entries' })
  offer(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Param('waitlistId') waitlistId: string,
    @Body() dto: OfferWaitlistDto,
    @Req() request: Request,
  ) {
    return this.waitlists.offer(actorId, clubId, waitlistId, dto, request);
  }
}
