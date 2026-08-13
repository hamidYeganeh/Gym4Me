import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequireStaffPermission } from '../common/decorators/require-staff-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, StaffPermissionKey } from '../common/enums';
import { StaffPermissionGuard } from '../common/guards/staff-permission.guard';
import { CheckinService } from './checkin.service';
import {
  CheckInByBookingCodeDto,
  CheckInByMembershipDto,
  HardwareCheckinEventDto,
  ListCheckInsQueryDto,
  ProvisionCheckinDeviceDto,
  SyncOfflineBatchDto,
} from './dto/checkin.dto';

@ApiTags('club-checkin')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@UseGuards(StaffPermissionGuard)
@Controller('account/clubs/:clubId/checkin')
export class ClubCheckinController {
  constructor(private readonly checkin: CheckinService) {}

  @Get()
  @RequireStaffPermission(StaffPermissionKey.BOOKINGS_READ)
  @ApiOperation({ summary: 'List check-ins for a club' })
  async list(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListCheckInsQueryDto,
  ) {
    // Guard already asserted permission; keep service list path.
    return this.checkin.listForClub(clubId, query);
  }

  @Post('booking')
  @RequireStaffPermission(StaffPermissionKey.BOOKINGS_CHECKIN)
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
  @RequireStaffPermission(StaffPermissionKey.MEMBERS_CHECKIN)
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
  @RequireStaffPermission(StaffPermissionKey.BOOKINGS_CHECKIN)
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

@ApiTags('club-checkin-devices')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@UseGuards(StaffPermissionGuard)
@RequireStaffPermission(StaffPermissionKey.MEMBERS_CHECKIN)
@Controller('account/clubs/:clubId/checkin-devices')
export class ClubCheckinDevicesController {
  constructor(private readonly checkin: CheckinService) {}

  @Get()
  @ApiOperation({ summary: 'List provisioned check-in hardware' })
  list(@CurrentUser('sub') actorId: string, @Param('clubId') clubId: string) {
    return this.checkin.listDevices(clubId, actorId);
  }

  @Post()
  @ApiOperation({ summary: 'Provision hardware; secret is returned once' })
  provision(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Body() dto: ProvisionCheckinDeviceDto,
  ) {
    return this.checkin.provisionDevice(clubId, actorId, dto);
  }

  @Post(':deviceId/rotate-secret')
  @ApiOperation({ summary: 'Rotate hardware secret; returned once' })
  rotate(
    @CurrentUser('sub') actorId: string,
    @Param('clubId') clubId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.checkin.rotateDeviceSecret(clubId, deviceId, actorId);
  }
}

@ApiTags('checkin-hardware-webhook')
@Controller('integrations/checkin/devices')
export class HardwareCheckinController {
  constructor(private readonly checkin: CheckinService) {}

  @Public()
  @Post(':deviceId/events')
  @ApiOperation({ summary: 'Vendor-neutral idempotent hardware event webhook' })
  ingest(
    @Param('deviceId') deviceId: string,
    @Headers('x-gym4me-device-key') deviceSecret: string | undefined,
    @Body() dto: HardwareCheckinEventDto,
    @Req() request: Request,
  ) {
    return this.checkin.ingestHardwareEvent(
      deviceId,
      deviceSecret,
      dto,
      request,
    );
  }
}
