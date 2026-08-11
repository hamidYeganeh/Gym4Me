import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffModule } from '../account/staff/staff.module';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { CheckIn, CheckInSchema } from '../schemas/check-in.schema';
import { AthleteCheckinController } from './athlete-checkin.controller';
import { CheckinService } from './checkin.service';
import { ClubCheckinController } from './club-checkin.controller';

@Module({
  imports: [
    StaffModule,
    MongooseModule.forFeature([
      { name: CheckIn.name, schema: CheckInSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [ClubCheckinController, AthleteCheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
