import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { StaffService } from '../account/staff/staff.service';
import { LifecycleService } from './lifecycle.service';

@ApiTags('lifecycle')
@ApiBearerAuth('access-token')
@Controller('account/clubs/:clubId/lifecycle')
export class OwnerLifecycleController {
  constructor(
    private readonly lifecycle: LifecycleService,
    private readonly staff: StaffService,
  ) {}

  @Get('segments')
  @Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
  @ApiOperation({ summary: 'Rule-based retention segments (R5)' })
  async segments(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.staff.requireClubAccess(userId, clubId);
    return this.lifecycle.listSegments(clubId);
  }

  @Get('at-risk')
  @Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
  @ApiOperation({ summary: 'Members matching retention risk rules' })
  async atRisk(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.staff.requireClubAccess(userId, clubId);
    return this.lifecycle.listAtRiskMembers(clubId);
  }

  @Get('journeys')
  @Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
  @ApiOperation({ summary: 'Active retention journeys' })
  async journeys(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.staff.requireClubAccess(userId, clubId);
    return this.lifecycle.listJourneys(clubId);
  }

  @Post('journeys/enroll-expiring')
  @Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
  @ApiOperation({ summary: 'Enroll expiring-soon members into journeys' })
  async enroll(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.staff.requireClubAccess(userId, clubId);
    return this.lifecycle.enrollExpiringJourneys(clubId);
  }

  @Post('journeys/run')
  @Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
  @ApiOperation({
    summary: 'Advance due journey steps for this club (manual trigger)',
  })
  async run(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.staff.requireClubAccess(userId, clubId);
    return this.lifecycle.advanceDueJourneys({ clubId });
  }
}
