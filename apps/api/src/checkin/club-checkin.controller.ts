import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CheckinService } from './checkin.service';
import {
  CheckInByBookingCodeDto,
  CheckInByMembershipDto,
  ListCheckInsQueryDto,
  SyncOfflineBatchDto,
} from './dto/checkin.dto';

@ApiTags('club-checkin')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@Controller('account/clubs/:clubId/checkin')
export class ClubCheckinController {
  constructor(private readonly checkin: CheckinService) {}

  @Get()
  @ApiOperation({ summary: 'List check-ins for a club' })
  async list(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListCheckInsQueryDto,
  ) {
    await this.checkin.assertListAccess(clubId, actorId);
    return this.checkin.listForClub(clubId, query);
  }

  @Post('booking')
  @ApiOperation({ summary: 'Check in by booking QR / code' })
  checkInByBookingCode(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CheckInByBookingCodeDto,
    @Req() request: Request,
  ) {
    return this.checkin.checkInByBookingCode(clubId, actorId, dto, request);
  }

  @Post('membership')
  @ApiOperation({ summary: 'Check in by club membership' })
  checkInByMembership(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CheckInByMembershipDto,
    @Req() request: Request,
  ) {
    return this.checkin.checkInByMembership(clubId, actorId, dto, request);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync offline check-in batch (idempotent)' })
  syncOfflineBatch(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Body() dto: SyncOfflineBatchDto,
    @Req() request: Request,
  ) {
    return this.checkin.syncOfflineBatch(clubId, actorId, dto, request);
  }
}
