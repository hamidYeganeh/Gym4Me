import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import {
  ListStaffQueryDto,
  UpdateStaffPermissionsDto,
  UpsertStaffDto,
} from './dto/staff.dto';
import { StaffService } from './staff.service';

@ApiTags('club-staff')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/clubs/:clubId/staff')
export class OwnerStaffController {
  constructor(private readonly staff: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'List club staff members' })
  async list(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListStaffQueryDto,
  ) {
    await this.staff.requireOwnedClub(ownerId, clubId);
    return this.staff.list(clubId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Invite or upsert a club staff member' })
  upsert(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Body() dto: UpsertStaffDto,
    @Req() request: Request,
  ) {
    return this.staff.upsert(ownerId, clubId, dto, request);
  }

  @Patch(':staffId')
  @ApiOperation({ summary: 'Update staff permissions / status' })
  update(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffPermissionsDto,
    @Req() request: Request,
  ) {
    return this.staff.updatePermissions(
      ownerId,
      clubId,
      staffId,
      dto,
      request,
    );
  }

  @Delete(':staffId')
  @ApiOperation({ summary: 'Revoke a club staff member' })
  revoke(
    @CurrentUser('sub') ownerId: string,
    @Param('clubId') clubId: string,
    @Param('staffId') staffId: string,
    @Req() request: Request,
  ) {
    return this.staff.revoke(ownerId, clubId, staffId, request);
  }
}
