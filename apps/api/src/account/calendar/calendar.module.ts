import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from '../../schemas/club.schema';
import { Booking, BookingSchema } from '../../schemas/booking.schema';
import { ClubClass, ClubClassSchema } from '../../schemas/club-class.schema';
import { ClubSlot, ClubSlotSchema } from '../../schemas/club-slot.schema';
import { ClubSpace, ClubSpaceSchema } from '../../schemas/club-space.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../../schemas/coach-profile.schema';
import {
  ResourceCalendarBlock,
  ResourceCalendarBlockSchema,
} from '../../schemas/resource-calendar-block.schema';
import { StaffModule } from '../staff/staff.module';
import {
  CoachCalendarController,
  OwnerCalendarController,
} from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarAvailabilityService } from './calendar-availability.service';

@Module({
  imports: [
    StaffModule,
    MongooseModule.forFeature([
      {
        name: ResourceCalendarBlock.name,
        schema: ResourceCalendarBlockSchema,
      },
      { name: Club.name, schema: ClubSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: ClubClass.name, schema: ClubClassSchema },
      { name: ClubSlot.name, schema: ClubSlotSchema },
      { name: ClubSpace.name, schema: ClubSpaceSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
    ]),
  ],
  controllers: [OwnerCalendarController, CoachCalendarController],
  providers: [CalendarService, CalendarAvailabilityService],
  exports: [CalendarService, CalendarAvailabilityService],
})
export class CalendarModule {}
