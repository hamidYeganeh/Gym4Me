import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { BookingsService } from './bookings.service';
import {
  AdminListBookingsQueryDto,
  CancelBookingDto,
} from './dto/booking.dto';

/** Platform booking ops: audits, disputes, refund settlement. */
@ApiTags('admin-bookings')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'All bookings (paginated, filterable)' })
  list(@Query() query: AdminListBookingsQueryDto) {
    return this.bookings.listForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One booking' })
  get(@Param('id') id: string) {
    return this.bookings.getForAdmin(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking as platform admin' })
  cancel(@Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookings.cancelByAdmin(id, dto);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Settle a refund for a cancelled paid booking' })
  refund(@Param('id') id: string) {
    return this.bookings.refundByAdmin(id);
  }
}
