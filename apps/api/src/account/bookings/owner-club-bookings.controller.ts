import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { BookingsService } from './bookings.service';
import { CancelBookingDto, ListBookingsQueryDto } from './dto/booking.dto';

/** Venue-side booking operations (desk check-in, cancellation). */
@ApiTags('club-owner-bookings')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('club_owner/clubs/:clubId/bookings')
export class OwnerClubBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Bookings at my club (paginated)' })
  async list(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListBookingsQueryDto,
  ) {
    await this.bookings.requireOwnedClub(userId, clubId);
    return this.bookings.listForClub(clubId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One booking at my club' })
  async get(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.bookings.requireOwnedClub(userId, clubId);
    return this.bookings.getForClub(clubId, id);
  }

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Desk check-in for a booking' })
  async checkIn(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.bookings.requireOwnedClub(userId, clubId);
    return this.bookings.checkInByClub(clubId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a booking as completed' })
  async complete(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.bookings.requireOwnedClub(userId, clubId);
    return this.bookings.completeByClub(clubId, id);
  }

  @Post(':id/no-show')
  @ApiOperation({ summary: 'Mark a booking as no-show' })
  async markNoShow(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
  ) {
    await this.bookings.requireOwnedClub(userId, clubId);
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
    await this.bookings.requireOwnedClub(userId, clubId);
    return this.bookings.cancelByClub(clubId, id, dto);
  }
}
