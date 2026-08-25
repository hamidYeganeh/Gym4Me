import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../schemas/club-membership.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
import {
  CoachStudent,
  CoachStudentSchema,
} from '../schemas/coach-student.schema';
import { Debt, DebtSchema } from '../schemas/debt.schema';
import { OwnerTask, OwnerTaskSchema } from '../schemas/owner-task.schema';
import { WorkoutLog, WorkoutLogSchema } from '../schemas/workout-log.schema';
import { ActionCenterController } from './action-center.controller';
import { ActionCenterService } from './action-center.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    AnalyticsModule,
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      { name: WorkoutLog.name, schema: WorkoutLogSchema },
      { name: CoachStudent.name, schema: CoachStudentSchema },
      { name: Club.name, schema: ClubSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: OwnerTask.name, schema: OwnerTaskSchema },
    ]),
  ],
  controllers: [ActionCenterController],
  providers: [ActionCenterService],
})
export class ActionCenterModule {}
