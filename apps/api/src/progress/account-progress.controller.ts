import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { HealthSyncProvider, Role } from '../common/enums';
import {
  CreateProgressMetricDto,
  CreateProgressPhotoDto,
  CreatePersonalRecordDto,
  CreateWorkoutLogDto,
  CreateWorkoutPlanDto,
  CreateWorkoutProgramDto,
  AssignWorkoutProgramDto,
  CreateExerciseDto,
  CreateMetricGoalDto,
  DeleteProgressMetricsDto,
  ListExercisesQueryDto,
  ListHealthSyncStatesQueryDto,
  ListMetricGoalsQueryDto,
  ListMetricRemindersQueryDto,
  ListMetricTypesQueryDto,
  ListPersonalRecordsQueryDto,
  ListProgressMetricsQueryDto,
  ListProgressPhotosQueryDto,
  ListWorkoutLogsQueryDto,
  ListWorkoutPlansQueryDto,
  ListWorkoutProgramsQueryDto,
  MetricsSummaryQueryDto,
  ReviewWorkoutLogDto,
  SyncProgressMetricsDto,
  UpdateMetricGoalDto,
  UpdateProgressMetricDto,
  UpdateProgressPhotoDto,
  UpdateWorkoutLogDto,
  UpdateWorkoutPlanDto,
  UpdateWorkoutProgramDto,
  UpsertHealthSyncStateDto,
  UpsertMetricReminderDto,
} from './dto/progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/progress')
export class AccountProgressController {
  constructor(private readonly progress: ProgressService) {}

  // ── Exercises (bank) ────────────────────────────────────────────────────

  @Get('exercises')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'List active exercises (workout bank)' })
  listExercises(@Query() query: ListExercisesQueryDto) {
    return this.progress.listExercises(query);
  }

  @Post('exercises')
  @Roles(Role.COACH)
  @ApiOperation({
    summary: 'Submit a custom exercise (pending admin verification)',
  })
  submitExercise(
    @Body() dto: CreateExerciseDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.coachSubmitExercise(dto, userId, request);
  }

  // ── Metric types (catalog) ──────────────────────────────────────────────

  @Get('metric-types')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({
    summary: 'List active metric types (seeds defaults if empty)',
  })
  listMetricTypes(@Query() query: ListMetricTypesQueryDto) {
    return this.progress.listActiveMetricTypes(query);
  }

  // ── Workout programs (coach templates) ──────────────────────────────────

  @Get('workout-programs')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'List my workout program templates' })
  listWorkoutPrograms(
    @CurrentUser('sub') userId: string,
    @Query() query: ListWorkoutProgramsQueryDto,
  ) {
    return this.progress.listWorkoutPrograms(userId, query);
  }

  @Get('workout-programs/:id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Get a workout program template' })
  getWorkoutProgram(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.progress.getWorkoutProgram(id, userId);
  }

  @Post('workout-programs')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Create a workout program template' })
  createWorkoutProgram(
    @Body() dto: CreateWorkoutProgramDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.createWorkoutProgram(dto, userId, request);
  }

  @Patch('workout-programs/:id')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Update a workout program template' })
  updateWorkoutProgram(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutProgramDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.updateWorkoutProgram(id, dto, userId, request);
  }

  @Delete('workout-programs/:id')
  @HttpCode(200)
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Archive a workout program template' })
  archiveWorkoutProgram(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.archiveWorkoutProgram(id, userId, request);
  }

  @Post('workout-programs/:id/assign')
  @Roles(Role.COACH)
  @ApiOperation({
    summary:
      'Assign a program to an athlete (creates WorkoutPlan + increments assignedCount)',
  })
  assignWorkoutProgram(
    @Param('id') id: string,
    @Body() dto: AssignWorkoutProgramDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.assignWorkoutProgram(id, dto, userId, request);
  }

  // ── Workout plans ───────────────────────────────────────────────────────

  @Get('workout-plans')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'List workout plans for the active role' })
  listWorkoutPlans(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListWorkoutPlansQueryDto,
  ) {
    return this.progress.listWorkoutPlans(userId, activeRole, query);
  }

  @Get('workout-plans/:id')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Get a workout plan' })
  getWorkoutPlan(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
  ) {
    return this.progress.getWorkoutPlan(id, userId, activeRole);
  }

  @Get('workout-plans/:id/revisions/:revisionId')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Get an immutable workout plan revision snapshot' })
  getWorkoutPlanRevision(
    @Param('id') id: string,
    @Param('revisionId') revisionId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
  ) {
    return this.progress.getWorkoutPlanRevision(
      id,
      revisionId,
      userId,
      activeRole,
    );
  }

  @Post('workout-plans')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a workout plan (coach for athlete, or athlete for self)',
  })
  createWorkoutPlan(
    @Body() dto: CreateWorkoutPlanDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.createWorkoutPlan(dto, userId, activeRole, request);
  }

  @Patch('workout-plans/:id')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Update a workout plan' })
  updateWorkoutPlan(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutPlanDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.updateWorkoutPlan(
      id,
      dto,
      userId,
      activeRole,
      request,
    );
  }

  @Delete('workout-plans/:id')
  @HttpCode(200)
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Archive a workout plan' })
  deleteWorkoutPlan(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.deleteWorkoutPlan(id, userId, activeRole, request);
  }

  // ── Metrics ─────────────────────────────────────────────────────────────

  @Get('metrics')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({
    summary: 'List progress metrics (athlete own / coach with active grant)',
  })
  listMetrics(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListProgressMetricsQueryDto,
  ) {
    return this.progress.listMetrics(userId, activeRole, query);
  }

  @Get('metrics/summary')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Aggregated metric summary for a date range' })
  metricsSummary(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: MetricsSummaryQueryDto,
  ) {
    return this.progress.metricsSummary(userId, activeRole, query);
  }

  @Post('metrics')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Record a progress metric' })
  createMetric(
    @Body() dto: CreateProgressMetricDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.createMetric(dto, userId, activeRole, request);
  }

  @Post('metrics/sync')
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Idempotently sync metric samples from a device health provider',
  })
  syncMetrics(
    @Body() dto: SyncProgressMetricsDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.syncMetrics(dto, userId, activeRole, request);
  }

  @Patch('metrics/:id')
  @Roles(Role.ATHLETE, Role.ADMIN)
  @ApiOperation({ summary: 'Update a progress metric' })
  updateMetric(
    @Param('id') id: string,
    @Body() dto: UpdateProgressMetricDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.updateMetric(id, dto, userId, activeRole, request);
  }

  @Delete('metrics/:id')
  @HttpCode(200)
  @Roles(Role.ATHLETE, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a progress metric' })
  deleteMetric(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.deleteMetric(id, userId, activeRole, request);
  }

  // ── Photos ──────────────────────────────────────────────────────────────

  @Get('photos')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'List my progress photos (private)' })
  listPhotos(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListProgressPhotosQueryDto,
  ) {
    return this.progress.listPhotos(userId, activeRole, query);
  }

  @Post('photos')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Add a progress photo' })
  createPhoto(
    @Body() dto: CreateProgressPhotoDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.createPhoto(dto, userId, activeRole, request);
  }

  @Patch('photos/:id')
  @Roles(Role.ATHLETE, Role.ADMIN)
  @ApiOperation({ summary: 'Update a progress photo' })
  updatePhoto(
    @Param('id') id: string,
    @Body() dto: UpdateProgressPhotoDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.updatePhoto(id, dto, userId, activeRole, request);
  }

  @Delete('photos/:id')
  @HttpCode(200)
  @Roles(Role.ATHLETE, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a progress photo' })
  deletePhoto(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.progress.deletePhoto(id, userId, activeRole, request);
  }

  // ── Workout logs ────────────────────────────────────────────────────────

  @Get('workout-logs')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({
    summary: 'List workout session logs (athlete own / coach for students)',
  })
  listWorkoutLogs(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListWorkoutLogsQueryDto,
  ) {
    return this.progress.listWorkoutLogs(userId, activeRole, query);
  }

  @Post('workout-logs')
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Create a workout log (draft allowed; default status draft)',
  })
  createWorkoutLog(
    @Body() dto: CreateWorkoutLogDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.createWorkoutLog(dto, userId, request);
  }

  @Patch('workout-logs/:id')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Patch a draft / in-progress workout log' })
  updateWorkoutLog(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutLogDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.updateWorkoutLog(id, dto, userId, request);
  }

  @Post('workout-logs/:id/complete')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Mark a workout log completed' })
  completeWorkoutLog(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.completeWorkoutLog(id, userId, request);
  }

  @Post('workout-logs/:id/skip')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Mark a workout log skipped' })
  skipWorkoutLog(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.skipWorkoutLog(id, userId, request);
  }

  @Post('workout-logs/:id/reviews')
  @Roles(Role.COACH)
  @ApiOperation({ summary: 'Append coach feedback to a completed workout log' })
  reviewWorkoutLog(
    @Param('id') id: string,
    @Body() dto: ReviewWorkoutLogDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.reviewWorkoutLog(id, dto, userId, request);
  }

  // ── Goals ───────────────────────────────────────────────────────────────

  @Get('goals')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'List my metric goals' })
  listGoals(
    @CurrentUser('sub') userId: string,
    @Query() query: ListMetricGoalsQueryDto,
  ) {
    return this.progress.listMetricGoals(userId, query);
  }

  @Post('goals')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Create a metric goal' })
  createGoal(
    @Body() dto: CreateMetricGoalDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.createMetricGoal(dto, userId, request);
  }

  @Patch('goals/:id')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Update a metric goal' })
  updateGoal(
    @Param('id') id: string,
    @Body() dto: UpdateMetricGoalDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.updateMetricGoal(id, dto, userId, request);
  }

  // ── Reminders ───────────────────────────────────────────────────────────

  @Get('reminders')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'List my metric reminders (default paused)' })
  listReminders(
    @CurrentUser('sub') userId: string,
    @Query() query: ListMetricRemindersQueryDto,
  ) {
    return this.progress.listMetricReminders(userId, query);
  }

  @Put('reminders/:metricKey')
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Create or replace a reminder for a metric key (opt-in active)',
  })
  upsertReminder(
    @Param('metricKey') metricKey: string,
    @Body() dto: UpsertMetricReminderDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.upsertMetricReminder(metricKey, dto, userId, request);
  }

  // ── Health sync ─────────────────────────────────────────────────────────

  @Get('health-sync')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'List health provider sync states' })
  listHealthSync(
    @CurrentUser('sub') userId: string,
    @Query() query: ListHealthSyncStatesQueryDto,
  ) {
    return this.progress.listHealthSyncStates(userId, query);
  }

  @Put('health-sync/:provider')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Upsert health provider sync state' })
  upsertHealthSync(
    @Param('provider') provider: HealthSyncProvider,
    @Body() dto: UpsertHealthSyncStateDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.upsertHealthSyncState(provider, dto, userId, request);
  }

  // ── Personal records ────────────────────────────────────────────────────

  @Get('personal-records')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'List personal records' })
  listPersonalRecords(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListPersonalRecordsQueryDto,
  ) {
    return this.progress.listPersonalRecords(userId, activeRole, query);
  }

  @Post('personal-records')
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Record a personal record (default privacy PRIVATE)',
  })
  createPersonalRecord(
    @Body() dto: CreatePersonalRecordDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.createPersonalRecord(dto, userId, request);
  }

  // ── Data rights ─────────────────────────────────────────────────────────

  @Get('export')
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary:
      'Export athlete progress data (metrics, photos, grants, goals; no financial data)',
  })
  exportProgress(@CurrentUser('sub') userId: string, @Req() request: Request) {
    return this.progress.exportProgressData(userId, request);
  }

  @Delete('metrics')
  @HttpCode(200)
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Bulk-delete progress metrics (requires confirmation body)',
  })
  deleteMetricsBulk(
    @Body() dto: DeleteProgressMetricsDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.deleteProgressMetrics(dto, userId, request);
  }

  @Post('data-rights/delete-metrics')
  @HttpCode(200)
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Alias: bulk-delete progress metrics with confirmation',
  })
  deleteMetricsDataRights(
    @Body() dto: DeleteProgressMetricsDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.deleteProgressMetrics(dto, userId, request);
  }

  @Get('consent-history')
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Consent / data-grant status history for the athlete',
  })
  consentHistory(@CurrentUser('sub') userId: string) {
    return this.progress.consentHistory(userId);
  }
}
