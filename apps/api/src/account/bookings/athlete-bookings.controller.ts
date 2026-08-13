import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { BookingsService } from './bookings.service';
import {
  CancelBookingDto,
  CancelBookingSeriesDto,
  CreateBookingDto,
  CreateClubBookingDto,
  ListBookingsQueryDto,
  PayBookingDto,
  RescheduleBookingDto,
  VerifyBookingPaymentDto,
} from './dto/booking.dto';

@ApiTags('bookings')
@ApiBearerAuth('access-token')
@Roles(Role.ATHLETE)
@Controller('account/bookings')
export class AthleteBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Reserve a coach slot (awaiting payment)' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookings.create(userId, dto);
  }

  @Post('club')
  @ApiOperation({
    summary: 'Reserve club occurrences (session / class / space)',
  })
  createClub(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateClubBookingDto,
  ) {
    return this.bookings.createClubBooking(userId, dto);
  }

  @Post('series/:groupId/cancel')
  @ApiOperation({ summary: 'Cancel a recurring series from a date' })
  cancelSeries(
    @CurrentUser('sub') userId: string,
    @Param('groupId') groupId: string,
    @Body() dto: CancelBookingSeriesDto,
  ) {
    return this.bookings.cancelSeriesByAthlete(userId, groupId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'My bookings (paginated)' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListBookingsQueryDto,
  ) {
    return this.bookings.listForAthlete(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One of my bookings' })
  get(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bookings.getForAthlete(userId, id);
  }

  @Get(':id/cancellation-preview')
  @ApiOperation({ summary: 'Preview cancellation fee and refund' })
  cancellationPreview(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.bookings.cancellationPreviewForAthlete(userId, id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Start gateway payment for a booking' })
  pay(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: PayBookingDto,
  ) {
    return this.bookings.pay(userId, id, dto.callbackUrl);
  }

  @Post(':id/pay/verify')
  @ApiOperation({ summary: 'Verify gateway callback and confirm booking' })
  verify(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: VerifyBookingPaymentDto,
  ) {
    return this.bookings.verifyPayment(userId, id, dto);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Move booking to another open slot' })
  reschedule(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookings.reschedule(userId, id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel my booking' })
  cancel(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookings.cancelByAthlete(userId, id, dto);
  }
}
