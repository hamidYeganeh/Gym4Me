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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import {
  CreatePlatformPlanDto,
  ListPlatformPlansQueryDto,
  ListPlatformSubscriptionsQueryDto,
  UpdatePlatformPlanDto,
} from './dto/membership.dto';
import { MembershipsService } from './memberships.service';

@ApiTags('admin-memberships')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminMembershipsController {
  constructor(private readonly memberships: MembershipsService) {}

  // ── Platform plans ──────────────────────────────────────────────────────

  @Get('platform-plans')
  @ApiOperation({ summary: 'List platform SaaS plans' })
  listPlans(@Query() query: ListPlatformPlansQueryDto) {
    return this.memberships.adminListPlatformPlans(query);
  }

  @Get('platform-plans/:planId')
  @ApiOperation({ summary: 'Get a platform plan' })
  getPlan(@Param('planId') planId: string) {
    return this.memberships.adminGetPlatformPlan(planId);
  }

  @Post('platform-plans')
  @ApiOperation({ summary: 'Create a platform plan' })
  createPlan(
    @Body() dto: CreatePlatformPlanDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.memberships.adminCreatePlatformPlan(dto, adminId, request);
  }

  @Patch('platform-plans/:planId')
  @ApiOperation({ summary: 'Update a platform plan' })
  updatePlan(
    @Param('planId') planId: string,
    @Body() dto: UpdatePlatformPlanDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.memberships.adminUpdatePlatformPlan(
      planId,
      dto,
      adminId,
      request,
    );
  }

  @Delete('platform-plans/:planId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive a platform plan (soft delete)' })
  archivePlan(
    @Param('planId') planId: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.memberships.adminArchivePlatformPlan(planId, adminId, request);
  }

  // ── Platform subscriptions ──────────────────────────────────────────────

  @Get('platform-subscriptions')
  @ApiOperation({ summary: 'List platform subscriptions' })
  listSubscriptions(@Query() query: ListPlatformSubscriptionsQueryDto) {
    return this.memberships.adminListPlatformSubscriptions(query);
  }
}
