import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { ClubSlotsService } from './club-slots.service';
import {
  CancelSlotOccurrenceDto,
  CreateClubClassDto,
  CreateClubSlotDto,
  UpdateClubClassDto,
  UpdateClubSlotDto,
} from './dto/club-slot.dto';

@ApiTags('club-owner-slots')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('club_owner/clubs')
export class OwnerClubSlotsController {
  constructor(private readonly slots: ClubSlotsService) {}

  // ── Classes ───────────────────────────────────

  @Get(':clubId/classes')
  @ApiOperation({ summary: 'List club classes' })
  listClasses(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.listClasses(clubId),
    );
  }

  @Get(':clubId/classes/:classId')
  @ApiOperation({ summary: 'Get one club class' })
  getClass(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('classId') classId: string,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.getClass(clubId, classId),
    );
  }

  @Post(':clubId/classes')
  @ApiOperation({ summary: 'Create a club class' })
  createClass(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: CreateClubClassDto,
    @Req() request: Request,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.createClass(clubId, dto, user.sub, request),
    );
  }

  @Patch(':clubId/classes/:classId')
  @ApiOperation({ summary: 'Update a club class' })
  updateClass(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateClubClassDto,
    @Req() request: Request,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.updateClass(clubId, classId, dto, user.sub, request),
    );
  }

  @Delete(':clubId/classes/:classId')
  @ApiOperation({ summary: 'Archive a club class' })
  archiveClass(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('classId') classId: string,
    @Req() request: Request,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.archiveClass(clubId, classId, user.sub, request),
    );
  }

  // ── Slots ─────────────────────────────────────

  @Get(':clubId/slots')
  @ApiOperation({ summary: 'List club slots' })
  listSlots(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.listSlots(clubId),
    );
  }

  @Get(':clubId/slots/:slotId')
  @ApiOperation({ summary: 'Get one club slot' })
  getSlot(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('slotId') slotId: string,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.getSlot(clubId, slotId),
    );
  }

  @Post(':clubId/slots')
  @ApiOperation({ summary: 'Create a club slot' })
  createSlot(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: CreateClubSlotDto,
    @Req() request: Request,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.createSlot(clubId, dto, user.sub, request),
    );
  }

  @Patch(':clubId/slots/:slotId')
  @ApiOperation({ summary: 'Update a club slot' })
  updateSlot(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('slotId') slotId: string,
    @Body() dto: UpdateClubSlotDto,
    @Req() request: Request,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.updateSlot(clubId, slotId, dto, user.sub, request),
    );
  }

  @Delete(':clubId/slots/:slotId')
  @ApiOperation({ summary: 'Archive a club slot' })
  archiveSlot(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('slotId') slotId: string,
    @Req() request: Request,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.archiveSlot(clubId, slotId, user.sub, request),
    );
  }

  @Post(':clubId/slots/:slotId/cancel-occurrence')
  @ApiOperation({ summary: 'Cancel a single slot occurrence' })
  cancelOccurrence(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('slotId') slotId: string,
    @Body() dto: CancelSlotOccurrenceDto,
    @Req() request: Request,
  ) {
    return this.slots.requireOwned(user, clubId).then(() =>
      this.slots.cancelOccurrence(clubId, slotId, dto, user.sub, request),
    );
  }
}
