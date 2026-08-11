import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, StaffPermissionKey } from '../../common/enums';
import { StaffService } from '../staff/staff.service';
import { CalendarService } from './calendar.service';
import {
  ListCalendarBlocksQueryDto,
  UpsertCalendarBlockDto,
} from './dto/calendar.dto';

@ApiTags('club-calendar')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@Controller('account/clubs/:clubId/calendar/blocks')
export class OwnerCalendarController {
  constructor(
    private readonly calendar: CalendarService,
    private readonly staff: StaffService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List calendar blocks for club resources' })
  async list(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListCalendarBlocksQueryDto,
  ) {
    await this.staff.requireClubAccess(actorId, clubId);
    await this.staff.assertStaffPermission(
      clubId,
      actorId,
      StaffPermissionKey.SESSIONS_MANAGE,
    );
    return this.calendar.listForClub(clubId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Upsert a calendar block for a club resource' })
  upsert(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Body() dto: UpsertCalendarBlockDto,
    @Req() request: Request,
  ) {
    return this.calendar.upsertForClub(actorId, clubId, dto, request);
  }

  @Delete(':blockId')
  @ApiOperation({ summary: 'Archive a club calendar block' })
  remove(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Param('blockId') blockId: string,
    @Req() request: Request,
  ) {
    return this.calendar.deleteForClub(actorId, clubId, blockId, request);
  }
}

@ApiTags('coach-calendar')
@ApiBearerAuth('access-token')
@Roles(Role.COACH)
@Controller('account/coach/calendar/blocks')
export class CoachCalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'List my coach calendar blocks' })
  list(
    @CurrentUser('sub') coachUserId: string,
    @Query() query: ListCalendarBlocksQueryDto,
  ) {
    return this.calendar.listForCoach(coachUserId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Upsert a block on my coach calendar' })
  upsert(
    @CurrentUser('sub') coachUserId: string,
    @Body() dto: UpsertCalendarBlockDto,
    @Req() request: Request,
  ) {
    return this.calendar.upsertForCoach(coachUserId, dto, request);
  }

  @Delete(':blockId')
  @ApiOperation({ summary: 'Archive one of my coach calendar blocks' })
  remove(
    @CurrentUser('sub') coachUserId: string,
    @Param('blockId') blockId: string,
    @Req() request: Request,
  ) {
    return this.calendar.deleteForCoach(coachUserId, blockId, request);
  }
}
