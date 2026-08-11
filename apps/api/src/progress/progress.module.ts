import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exercise, ExerciseSchema } from '../schemas/exercise.schema';
import {
  MetricType,
  MetricTypeSchema,
} from '../schemas/metric-type.schema';
import {
  ProgressMetric,
  ProgressMetricSchema,
} from '../schemas/progress-metric.schema';
import {
  ProgressPhoto,
  ProgressPhotoSchema,
} from '../schemas/progress-photo.schema';
import {
  WorkoutPlan,
  WorkoutPlanSchema,
} from '../schemas/workout-plan.schema';
import {
  WorkoutProgram,
  WorkoutProgramSchema,
} from '../schemas/workout-program.schema';
import { AccountProgressController } from './account-progress.controller';
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
    ]),
  ],
  controllers: [
    AdminProgressController,
    AdminMetricTypesController,
    AccountProgressController,
  ],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
