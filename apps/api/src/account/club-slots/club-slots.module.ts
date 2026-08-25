import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../../users/users.module';
import { CalendarModule } from '../calendar/calendar.module';
import { ClubClass, ClubClassSchema } from '../../schemas/club-class.schema';
import { Club, ClubSchema } from '../../schemas/club.schema';
import { ClubSlot, ClubSlotSchema } from '../../schemas/club-slot.schema';
import {
  ClubSlotOccupancy,
  ClubSlotOccupancySchema,
} from '../../schemas/club-slot-occupancy.schema';
import { ClubSpace, ClubSpaceSchema } from '../../schemas/club-space.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../../schemas/coach-profile.schema';
import { AdminClubSlotsController } from './admin-club-slots.controller';
import { ClubSlotsService } from './club-slots.service';
import { DiscoveryClassesController } from './discovery-classes.controller';
import { DiscoveryClassesService } from './discovery-classes.service';
import { DiscoveryClubSlotsController } from './discovery-club-slots.controller';
import { OwnerClubSlotsController } from './owner-club-slots.controller';

@Module({
  imports: [
    UsersModule,
    CalendarModule,
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: ClubClass.name, schema: ClubClassSchema },
      { name: ClubSlot.name, schema: ClubSlotSchema },
      { name: ClubSpace.name, schema: ClubSpaceSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
      { name: ClubSlotOccupancy.name, schema: ClubSlotOccupancySchema },
    ]),
  ],
  controllers: [
    OwnerClubSlotsController,
    AdminClubSlotsController,
    DiscoveryClubSlotsController,
    DiscoveryClassesController,
  ],
  providers: [ClubSlotsService, DiscoveryClassesService],
  exports: [ClubSlotsService, MongooseModule],
})
export class ClubSlotsModule {}
