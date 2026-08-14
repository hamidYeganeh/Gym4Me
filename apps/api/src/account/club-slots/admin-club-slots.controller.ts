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
  CreateClubSpaceDto,
  UpdateClubClassDto,
  UpdateClubSlotDto,
  UpdateClubSpaceDto,
} from './dto/club-slot.dto';

@ApiTags('admin-club-slots')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/clubs')
export class AdminClubSlotsController {
  constructor(private readonly slots: ClubSlotsService) {}

  // ── Classes ───────────────────────────────────

  @Get(':clubId/classes')
  @ApiOperation({ summary: 'List club classes (admin)' })
  listClasses(@Param('clubId') clubId: string) {
    return this.slots.listClasses(clubId);
  }

  @Get(':clubId/classes/:classId')
  @ApiOperation({ summary: 'Get one club class (admin)' })
  getClass(@Param('clubId') clubId: string, @Param('classId') classId: string) {
    return this.slots.getClass(clubId, classId);
  }

  @Post(':clubId/classes')
  @ApiOperation({ summary: 'Create a club class (admin)' })
  createClass(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: CreateClubClassDto,
    @Req() request: Request,
  ) {
    return this.slots.createClass(clubId, dto, user.sub, request);
  }

  @Patch(':clubId/classes/:classId')
  @ApiOperation({ summary: 'Update a club class (admin)' })
  updateClass(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateClubClassDto,
    @Req() request: Request,
  ) {
    return this.slots.updateClass(clubId, classId, dto, user.sub, request);
  }

  @Delete(':clubId/classes/:classId')
  @ApiOperation({ summary: 'Archive a club class (admin)' })
  archiveClass(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('classId') classId: string,
    @Req() request: Request,
  ) {
    return this.slots.archiveClass(clubId, classId, user.sub, request);
  }

  // ── Spaces ────────────────────────────────────

  @Get(':clubId/spaces')
  @ApiOperation({ summary: 'List club spaces (admin)' })
  listSpaces(@Param('clubId') clubId: string) {
    return this.slots.listSpaces(clubId);
  }

  @Get(':clubId/spaces/:spaceId')
  @ApiOperation({ summary: 'Get one club space (admin)' })
  getSpace(@Param('clubId') clubId: string, @Param('spaceId') spaceId: string) {
    return this.slots.getSpace(clubId, spaceId);
  }

  @Post(':clubId/spaces')
  @ApiOperation({ summary: 'Create a club space (admin)' })
  createSpace(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: CreateClubSpaceDto,
    @Req() request: Request,
  ) {
    return this.slots.createSpace(clubId, dto, user.sub, request);
  }

  @Patch(':clubId/spaces/:spaceId')
  @ApiOperation({ summary: 'Update a club space (admin)' })
  updateSpace(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateClubSpaceDto,
    @Req() request: Request,
  ) {
    return this.slots.updateSpace(clubId, spaceId, dto, user.sub, request);
  }

  @Delete(':clubId/spaces/:spaceId')
  @ApiOperation({ summary: 'Archive a club space (admin)' })
  archiveSpace(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('spaceId') spaceId: string,
    @Req() request: Request,
  ) {
    return this.slots.archiveSpace(clubId, spaceId, user.sub, request);
  }

  // ── Slots ─────────────────────────────────────

  @Get(':clubId/slots')
  @ApiOperation({ summary: 'List club slots (admin)' })
  listSlots(@Param('clubId') clubId: string) {
    return this.slots.listSlots(clubId);
  }

  @Get(':clubId/slots/:slotId')
  @ApiOperation({ summary: 'Get one club slot (admin)' })
  getSlot(@Param('clubId') clubId: string, @Param('slotId') slotId: string) {
    return this.slots.getSlot(clubId, slotId);
  }

  @Post(':clubId/slots')
  @ApiOperation({ summary: 'Create a club slot (admin)' })
  createSlot(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: CreateClubSlotDto,
    @Req() request: Request,
  ) {
    return this.slots.createSlot(clubId, dto, user.sub, request);
  }

  @Patch(':clubId/slots/:slotId')
  @ApiOperation({ summary: 'Update a club slot (admin)' })
  updateSlot(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('slotId') slotId: string,
    @Body() dto: UpdateClubSlotDto,
    @Req() request: Request,
  ) {
    return this.slots.updateSlot(clubId, slotId, dto, user.sub, request);
  }

  @Delete(':clubId/slots/:slotId')
  @ApiOperation({ summary: 'Archive a club slot (admin)' })
  archiveSlot(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('slotId') slotId: string,
    @Req() request: Request,
  ) {
    return this.slots.archiveSlot(clubId, slotId, user.sub, request);
  }

  @Post(':clubId/slots/:slotId/cancel-occurrence')
  @ApiOperation({ summary: 'Cancel a single slot occurrence (admin)' })
  cancelOccurrence(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('slotId') slotId: string,
    @Body() dto: CancelSlotOccurrenceDto,
    @Req() request: Request,
  ) {
    return this.slots.cancelOccurrence(clubId, slotId, dto, user.sub, request);
  }
}
