import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { AdminAnalyticsService } from './admin-analytics.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly analytics: AdminAnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Platform KPIs: totals, review queues, series' })
  overview() {
    return this.analytics.overview();
  }
}
