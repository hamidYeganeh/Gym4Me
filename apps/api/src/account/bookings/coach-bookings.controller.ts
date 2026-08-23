import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { BookingsService } from './bookings.service';
import {
  CancelBookingDto,
  ListBookingsQueryDto,
  RescheduleBookingDto,
} from './dto/booking.dto';

@ApiTags('coach-bookings')
@ApiBearerAuth('access-token')
@Roles(Role.COACH)
@Controller('coach/bookings')
export class CoachBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Bookings on my coach calendar (paginated)' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListBookingsQueryDto,
  ) {
    return this.bookings.listForCoach(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One booking on my calendar' })
  get(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bookings.getForCoach(userId, id);
  }

  @Get(':id/cancellation-preview')
  @ApiOperation({ summary: 'Preview the athlete refund before coach cancel' })
  cancellationPreview(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.bookings.cancellationPreviewForCoach(userId, id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a pending consultation request' })
  accept(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bookings.acceptByCoach(userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Reject / cancel a booking as the coach' })
  cancel(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookings.cancelByCoach(userId, id, dto);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Move a coach booking to another open slot' })
  reschedule(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookings.rescheduleByCoach(userId, id, dto);
  }

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Mark athlete as checked in' })
  checkIn(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bookings.checkIn(userId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark session as completed' })
  complete(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bookings.complete(userId, id);
  }

  @Post(':id/no-show')
  @ApiOperation({ summary: 'Mark athlete as no-show' })
  markNoShow(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bookings.markNoShow(userId, id);
  }
}
