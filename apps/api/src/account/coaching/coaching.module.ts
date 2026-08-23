import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CoachAvailability,
  CoachAvailabilitySchema,
} from '../../schemas/coach-availability.schema';
import {
  CoachClubAffiliation,
  CoachClubAffiliationSchema,
} from '../../schemas/coach-club-affiliation.schema';
import { CoachLead, CoachLeadSchema } from '../../schemas/coach-lead.schema';
import {
  CoachMessage,
  CoachMessageSchema,
} from '../../schemas/coach-message.schema';
import {
  CoachService,
  CoachServiceSchema,
} from '../../schemas/coach-service.schema';
import {
  CoachStudent,
  CoachStudentSchema,
} from '../../schemas/coach-student.schema';
import {
  CoachThread,
  CoachThreadSchema,
} from '../../schemas/coach-thread.schema';
import {
  HealthAssessment,
  HealthAssessmentSchema,
} from '../../schemas/health-assessment.schema';
import {
  SessionPackage,
  SessionPackageSchema,
} from '../../schemas/session-package.schema';
import { AdminCoachingController } from './admin-coaching.controller';
import { CoachingStudentsQuery } from './application/queries/coaching-students.query';
import { AthleteCoachingController } from './athlete-coaching.controller';
import { CoachCoachingController } from './coach-coaching.controller';
import { CoachingService } from './coaching.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoachService.name, schema: CoachServiceSchema },
      { name: CoachAvailability.name, schema: CoachAvailabilitySchema },
      { name: CoachClubAffiliation.name, schema: CoachClubAffiliationSchema },
      { name: SessionPackage.name, schema: SessionPackageSchema },
      { name: CoachStudent.name, schema: CoachStudentSchema },
      { name: CoachLead.name, schema: CoachLeadSchema },
      { name: HealthAssessment.name, schema: HealthAssessmentSchema },
      { name: CoachThread.name, schema: CoachThreadSchema },
      { name: CoachMessage.name, schema: CoachMessageSchema },
    ]),
  ],
  controllers: [
    CoachCoachingController,
    AthleteCoachingController,
    AdminCoachingController,
  ],
  providers: [CoachingStudentsQuery, CoachingService],
  exports: [CoachingService],
})
export class CoachingModule {}
