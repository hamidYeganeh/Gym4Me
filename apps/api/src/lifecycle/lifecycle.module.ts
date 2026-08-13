import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffModule } from '../account/staff/staff.module';
import { OutboxModule } from '../outbox/outbox.module';
import { CheckIn, CheckInSchema } from '../schemas/check-in.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../schemas/club-membership.schema';
import {
  LifecycleJourney,
  LifecycleJourneySchema,
  LifecycleSegment,
  LifecycleSegmentSchema,
} from '../schemas/lifecycle.schema';
import { LifecycleService } from './lifecycle.service';
import { LifecycleWorker } from './lifecycle.worker';
import { OwnerLifecycleController } from './owner-lifecycle.controller';

@Module({
  imports: [
    StaffModule,
    OutboxModule,
    MongooseModule.forFeature([
      { name: LifecycleSegment.name, schema: LifecycleSegmentSchema },
      { name: LifecycleJourney.name, schema: LifecycleJourneySchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      { name: Club.name, schema: ClubSchema },
      { name: CheckIn.name, schema: CheckInSchema },
    ]),
  ],
  controllers: [OwnerLifecycleController],
  providers: [LifecycleService, LifecycleWorker],
  exports: [LifecycleService],
})
export class LifecycleModule {}
