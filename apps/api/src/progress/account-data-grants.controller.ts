import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  CreateAthleteDataGrantDto,
  ListAthleteDataGrantsQueryDto,
} from './dto/progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/data-grants')
export class AccountDataGrantsController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'List my athlete data grants' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListAthleteDataGrantsQueryDto,
  ) {
    return this.progress.listDataGrants(userId, query);
  }

  @Post()
  @Roles(Role.ATHLETE)
  @ApiOperation({
    summary: 'Grant a coach scoped access to progress data',
  })
  create(
    @Body() dto: CreateAthleteDataGrantDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.createDataGrant(dto, userId, request);
  }

  @Post(':id/revoke')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Revoke a data grant immediately' })
  revoke(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.progress.revokeDataGrant(id, userId, request);
  }
}
