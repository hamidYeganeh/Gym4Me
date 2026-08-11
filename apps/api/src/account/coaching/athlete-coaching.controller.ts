import { Body, Controller, Get, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { CoachingService } from './coaching.service';
import {
  ListPackagesQueryDto,
  ListStudentsQueryDto,
  UpsertHealthAssessmentDto,
} from './dto/coaching.dto';

@ApiTags('athlete-coaching')
@ApiBearerAuth('access-token')
@Roles(Role.ATHLETE)
@Controller('account/athlete/coaching')
export class AthleteCoachingController {
  constructor(private readonly coaching: CoachingService) {}

  @Get('packages')
  @ApiOperation({ summary: 'My purchased session packages' })
  listPackages(
    @CurrentUser('sub') userId: string,
    @Query() query: ListPackagesQueryDto,
  ) {
    return this.coaching.listPackagesForAthlete(userId, query);
  }

  @Get('coaches')
  @ApiOperation({ summary: 'Coaches I am linked to as a student' })
  listCoaches(
    @CurrentUser('sub') userId: string,
    @Query() query: ListStudentsQueryDto,
  ) {
    return this.coaching.listMyCoaches(userId, query);
  }

  @Get('health-assessment')
  @ApiOperation({ summary: 'My health / PAR-Q assessment' })
  getHealth(@CurrentUser('sub') userId: string) {
    return this.coaching.getHealthAssessmentForViewer({
      athleteUserId: userId,
      viewerUserId: userId,
      viewerRole: 'athlete',
    });
  }

  @Put('health-assessment')
  @ApiOperation({ summary: 'Upsert my health / PAR-Q assessment' })
  upsertHealth(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpsertHealthAssessmentDto,
    @Req() request: Request,
  ) {
    return this.coaching.upsertHealthAssessment(userId, dto, request);
  }
}
