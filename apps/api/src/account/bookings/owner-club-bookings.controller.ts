import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, StaffPermissionKey } from '../../common/enums';
import { StaffService } from '../staff/staff.service';
import { BookingsService } from './bookings.service';
import {
  CancelBookingDto,
  CreateDeskClubBookingDto,
  ListBookingsQueryDto,
  RescheduleBookingDto,
} from './dto/booking.dto';

/** Venue-side booking operations (desk check-in, cancellation). */
@ApiTags('club-owner-bookings')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@Controller('club_owner/clubs/:clubId/bookings')
export class OwnerClubBookingsController {
  constructor(
    private readonly bookings: BookingsService,
    private readonly staff: StaffService,
  ) {}

  @Post('desk')
  @ApiOperation({ summary: 'Create a desk booking for a member or guest' })
  async createDesk(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CreateDeskClubBookingDto,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.BOOKINGS_CREATE);
    return this.bookings.createDeskClubBooking(userId, clubId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Bookings at my club (paginated)' })
  async list(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListBookingsQueryDto,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.BOOKINGS_READ);
    return this.bookings.listForClub(clubId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One booking at my club' })
  async get(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.BOOKINGS_READ);
    return this.bookings.getForClub(clubId, id);
  }

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Desk check-in for a booking' })
  async checkIn(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.BOOKINGS_CHECKIN);
    return this.bookings.checkInByClub(clubId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a booking as completed' })
  async complete(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.BOOKINGS_CHECKIN);
    return this.bookings.completeByClub(clubId, id);
  }

  @Post(':id/no-show')
  @ApiOperation({ summary: 'Mark a booking as no-show' })
  async markNoShow(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.BOOKINGS_CHECKIN);
    return this.bookings.markNoShowByClub(clubId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking as the venue' })
  async cancel(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.BOOKINGS_CREATE);
    return this.bookings.cancelByClub(clubId, id, dto);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Move a booking to another club occurrence' })
  async reschedule(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    await this.authorize(userId, clubId, StaffPermissionKey.SESSIONS_MANAGE);
    return this.bookings.rescheduleByClub(clubId, id, dto);
  }

  private async authorize(
    userId: string,
    clubId: string,
    permission: StaffPermissionKey,
  ) {
    await this.staff.requireClubAccess(userId, clubId);
    await this.staff.assertStaffPermission(clubId, userId, permission);
  }
}
