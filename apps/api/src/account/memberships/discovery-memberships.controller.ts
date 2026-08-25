import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import {
  PaginationQueryDto,
  PublicMembershipPlanSummariesQueryDto,
} from './dto/membership.dto';
import { MembershipsService } from './memberships.service';

/** Public catalog so athletes can browse and purchase club plans. */
@ApiTags('discovery')
@Controller('discovery/clubs/:clubId/membership-plans')
export class DiscoveryMembershipPlansController {
  constructor(private readonly memberships: MembershipsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public active membership plans of a club' })
  list(@Param('clubId') clubId: string, @Query() query: PaginationQueryDto) {
    return this.memberships.listPublicPlans(clubId, query);
  }

  @Public()
  @Get(':planId')
  @ApiOperation({ summary: 'Public membership plan detail' })
  get(@Param('clubId') clubId: string, @Param('planId') planId: string) {
    return this.memberships.getPublicPlan(clubId, planId);
  }
}

@ApiTags('discovery')
@Controller('discovery/membership-plan-summaries')
export class DiscoveryMembershipPlanSummariesController {
  constructor(private readonly memberships: MembershipsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Bounded lowest published plan prices grouped by club/currency',
  })
  list(@Query() query: PublicMembershipPlanSummariesQueryDto) {
    return this.memberships.listPublicPlanSummaries(query.clubIds);
  }
}

@ApiTags('discovery')
@Controller('discovery/platform-plans')
export class DiscoveryPlatformPlansController {
  constructor(private readonly memberships: MembershipsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public active SaaS plans for club owners' })
  list() {
    return this.memberships.listActivePlatformPlans();
  }
}
