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
  CreateExerciseDto,
  CreateMetricTypeDto,
  ListExercisesQueryDto,
  ListMetricTypesQueryDto,
  UpdateExerciseDto,
  UpdateMetricTypeDto,
} from './dto/progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/progress/exercises')
export class AdminProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'List exercises (all statuses)' })
  list(@Query() query: ListExercisesQueryDto) {
    return this.progress.adminListExercises(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exercise' })
  get(@Param('id') id: string) {
    return this.progress.adminGetExercise(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an exercise' })
  create(
    @Body() dto: CreateExerciseDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.progress.adminCreateExercise(dto, adminId, request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an exercise' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.progress.adminUpdateExercise(id, dto, adminId, request);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive an exercise' })
  archive(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.progress.adminArchiveExercise(id, adminId, request);
  }
}

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/progress/metric-types')
export class AdminMetricTypesController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'List metric types (catalog)' })
  list(@Query() query: ListMetricTypesQueryDto) {
    return this.progress.adminListMetricTypes(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a metric type' })
  get(@Param('id') id: string) {
    return this.progress.adminGetMetricType(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a metric type' })
  create(
    @Body() dto: CreateMetricTypeDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.progress.adminCreateMetricType(dto, adminId, request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a metric type' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMetricTypeDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.progress.adminUpdateMetricType(id, dto, adminId, request);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive a metric type' })
  archive(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.progress.adminArchiveMetricType(id, adminId, request);
  }
}
