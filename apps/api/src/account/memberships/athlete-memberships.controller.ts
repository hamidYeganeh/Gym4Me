import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import {
  CancelPlatformSubscriptionDto,
  ListMyMembershipsQueryDto,
  SelfPurchaseMembershipDto,
  SubscribePlatformDto,
} from './dto/membership.dto';
import { MembershipsService } from './memberships.service';

@ApiTags('account-memberships')
@ApiBearerAuth('access-token')
@Roles(Role.ATHLETE)
@Controller('account/memberships')
export class AthleteMembershipsController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get()
  @ApiOperation({ summary: 'My club memberships (paginated)' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListMyMembershipsQueryDto,
  ) {
    return this.memberships.listMyMemberships(userId, query);
  }

  @Get(':membershipId')
  @ApiOperation({ summary: 'One of my club memberships' })
  get(
    @CurrentUser('sub') userId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.memberships.getMyMembership(userId, membershipId);
  }

  @Post()
  @ApiOperation({ summary: 'Self-purchase a published club membership plan' })
  purchase(
    @CurrentUser('sub') userId: string,
    @Body() dto: SelfPurchaseMembershipDto,
    @Req() request: Request,
  ) {
    return this.memberships.selfPurchase(userId, dto, request);
  }
}

/** Active platform plan catalog for subscribers (owners). */
@ApiTags('account-platform-subscriptions')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/platform-plans')
export class AccountPlatformPlansController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get()
  @ApiOperation({ summary: 'Active platform plans available to subscribe' })
  list() {
    return this.memberships.listActivePlatformPlans();
  }
}

/** Platform SaaS subscription (separate from club memberships). */
@ApiTags('account-platform-subscriptions')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/platform-subscriptions')
export class AccountPlatformSubscriptionsController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get()
  @ApiOperation({ summary: 'My platform subscriptions' })
  list(@CurrentUser('sub') userId: string) {
    return this.memberships.listMyPlatformSubscriptions(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Subscribe to a platform plan' })
  subscribe(
    @CurrentUser('sub') userId: string,
    @Body() dto: SubscribePlatformDto,
    @Req() request: Request,
  ) {
    return this.memberships.subscribePlatform(userId, dto, request);
  }

  @Post(':subscriptionId/cancel')
  @ApiOperation({ summary: 'Cancel my platform subscription' })
  cancel(
    @CurrentUser('sub') userId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: CancelPlatformSubscriptionDto,
    @Req() request: Request,
  ) {
    return this.memberships.cancelPlatformSubscription(
      userId,
      subscriptionId,
      dto,
      request,
    );
  }
}
