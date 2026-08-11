import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from '../../schemas/club.schema';
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

@Module({
  imports: [
    StaffModule,
    MongooseModule.forFeature([
      {
        name: ResourceCalendarBlock.name,
        schema: ResourceCalendarBlockSchema,
      },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
  controllers: [OwnerCalendarController, CoachCalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
