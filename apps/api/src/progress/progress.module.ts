import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AthleteDataGrant,
  AthleteDataGrantSchema,
} from '../schemas/athlete-data-grant.schema';
import {
  CoachStudent,
  CoachStudentSchema,
} from '../schemas/coach-student.schema';
import { Exercise, ExerciseSchema } from '../schemas/exercise.schema';
import {
  HealthSyncState,
  HealthSyncStateSchema,
} from '../schemas/health-sync-state.schema';
import { MetricGoal, MetricGoalSchema } from '../schemas/metric-goal.schema';
import {
  MetricReminder,
  MetricReminderSchema,
} from '../schemas/metric-reminder.schema';
import { MetricType, MetricTypeSchema } from '../schemas/metric-type.schema';
import {
  PersonalRecord,
  PersonalRecordSchema,
} from '../schemas/personal-record.schema';
import {
  ProgressMetric,
  ProgressMetricSchema,
} from '../schemas/progress-metric.schema';
import {
  ProgressPhoto,
  ProgressPhotoSchema,
} from '../schemas/progress-photo.schema';
import { WorkoutLog, WorkoutLogSchema } from '../schemas/workout-log.schema';
import { WorkoutPlan, WorkoutPlanSchema } from '../schemas/workout-plan.schema';
import {
  WorkoutProgram,
  WorkoutProgramSchema,
} from '../schemas/workout-program.schema';
import { AccountDataGrantsController } from './account-data-grants.controller';
import { AccountProgressController } from './account-progress.controller';
import { ListProgressMetricsQuery } from './application/queries/list-progress-metrics.query';
import {
  AdminMetricTypesController,
  AdminProgressController,
} from './admin-progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      { name: WorkoutPlan.name, schema: WorkoutPlanSchema },
      { name: WorkoutProgram.name, schema: WorkoutProgramSchema },
      { name: ProgressMetric.name, schema: ProgressMetricSchema },
      { name: ProgressPhoto.name, schema: ProgressPhotoSchema },
      { name: MetricType.name, schema: MetricTypeSchema },
      { name: WorkoutLog.name, schema: WorkoutLogSchema },
      { name: PersonalRecord.name, schema: PersonalRecordSchema },
      { name: CoachStudent.name, schema: CoachStudentSchema },
      { name: AthleteDataGrant.name, schema: AthleteDataGrantSchema },
      { name: MetricGoal.name, schema: MetricGoalSchema },
      { name: MetricReminder.name, schema: MetricReminderSchema },
      { name: HealthSyncState.name, schema: HealthSyncStateSchema },
    ]),
  ],
  controllers: [
    AdminProgressController,
    AdminMetricTypesController,
    AccountProgressController,
    AccountDataGrantsController,
  ],
  providers: [ListProgressMetricsQuery, ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
