import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  CreateProgressMetricDto,
  CreateProgressPhotoDto,
  CreateWorkoutPlanDto,
  CreateWorkoutProgramDto,
  AssignWorkoutProgramDto,
  ListExercisesQueryDto,
  ListMetricTypesQueryDto,
  ListProgressMetricsQueryDto,
  ListProgressPhotosQueryDto,
  ListWorkoutPlansQueryDto,
  ListWorkoutProgramsQueryDto,
  UpdateProgressMetricDto,
  UpdateProgressPhotoDto,
  UpdateWorkoutPlanDto,
  UpdateWorkoutProgramDto,
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

  // ── Metric types (catalog) ──────────────────────────────────────────────

  @Get('metric-types')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'List active metric types (seeds defaults if empty)' })
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
    summary: 'Assign a program to an athlete (creates WorkoutPlan + increments assignedCount)',
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
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'List my progress metrics (private)' })
  listMetrics(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListProgressMetricsQueryDto,
  ) {
    return this.progress.listMetrics(userId, activeRole, query);
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
}
