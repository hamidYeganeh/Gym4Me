import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { CoachingService } from './coaching.service';
import { AdminListCoachingQueryDto } from './dto/coaching.dto';

/** Platform ops stubs for coaching domain listings. */
@ApiTags('admin-coaching')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/coaching')
export class AdminCoachingController {
  constructor(private readonly coaching: CoachingService) {}

  @Get('services')
  @ApiOperation({ summary: 'List coaching services (admin)' })
  listServices(@Query() query: AdminListCoachingQueryDto) {
    return this.coaching.adminListServices(query);
  }

  @Get('packages')
  @ApiOperation({ summary: 'List session packages (admin)' })
  listPackages(@Query() query: AdminListCoachingQueryDto) {
    return this.coaching.adminListPackages(query);
  }

  @Get('students')
  @ApiOperation({ summary: 'List coach–student links (admin)' })
  listStudents(@Query() query: AdminListCoachingQueryDto) {
    return this.coaching.adminListStudents(query);
  }

  @Get('health-assessments/:athleteUserId')
  @ApiOperation({ summary: 'Get an athlete health assessment (admin)' })
  getHealth(@Param('athleteUserId') athleteUserId: string) {
    return this.coaching.adminGetHealthAssessment(athleteUserId);
  }
}
