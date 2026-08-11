import {
  Body,
  Controller,
  Get,
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
  CreateOwnerTaskDto,
  ListOwnerTasksQueryDto,
  UpdateOwnerTaskStatusDto,
} from './dto/ops.dto';
import { OpsService } from './ops.service';

@ApiTags('club-owner-ops')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/clubs/:clubId/tasks')
export class OwnerOpsController {
  constructor(private readonly ops: OpsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Open task count for home badge' })
  async summary(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.ops.requireOwnedClub(userId, clubId);
    return this.ops.tasksSummary(clubId);
  }

  @Get()
  @ApiOperation({ summary: 'List club owner tasks' })
  async list(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListOwnerTasksQueryDto,
  ) {
    await this.ops.requireOwnedClub(userId, clubId);
    return this.ops.listTasks(clubId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a club owner task' })
  async create(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CreateOwnerTaskDto,
    @Req() request: Request,
  ) {
    await this.ops.requireOwnedClub(userId, clubId);
    return this.ops.createTask(clubId, userId, dto, request);
  }

  @Patch(':taskId/status')
  @ApiOperation({ summary: 'Update owner task status' })
  async updateStatus(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateOwnerTaskStatusDto,
    @Req() request: Request,
  ) {
    await this.ops.requireOwnedClub(userId, clubId);
    return this.ops.updateTaskStatus(clubId, taskId, userId, dto, request);
  }
}
