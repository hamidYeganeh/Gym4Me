import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import {
  CancelPlatformSubscriptionDto,
  InitiateMembershipCheckoutDto,
  InitiatePlatformSubscriptionCheckoutDto,
  ListMyMembershipsQueryDto,
  PreviewMembershipCheckoutDto,
  PreviewPlatformSubscriptionCheckoutDto,
  SelfPurchaseMembershipDto,
  SubscribePlatformDto,
  VerifyMembershipCheckoutDto,
  VerifyPlatformSubscriptionCheckoutDto,
  SchedulePlatformPlanChangeDto,
} from './dto/membership.dto';
import { MembershipCheckoutService } from './application/services/membership-checkout.service';
import { PlatformSubscriptionCheckoutService } from './application/services/platform-subscription-checkout.service';
import { PlatformEntitlementService } from './application/services/platform-entitlement.service';
import { MembershipsService } from './memberships.service';

@ApiTags('account-memberships')
@ApiBearerAuth('access-token')
@Roles(Role.ATHLETE)
@Controller('account/memberships')
export class AthleteMembershipsController {
  constructor(
    private readonly memberships: MembershipsService,
    private readonly checkouts: MembershipCheckoutService,
  ) {}

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

  @Post('checkouts/initiate')
  @ApiOperation({ summary: 'Initiate verified online membership checkout' })
  initiateCheckout(
    @CurrentUser('sub') userId: string,
    @Body() dto: InitiateMembershipCheckoutDto,
  ) {
    return this.checkouts.initiate(userId, dto);
  }

  @Post('checkouts/preview')
  @ApiOperation({ summary: 'Preview online membership purchase or renewal' })
  previewCheckout(
    @CurrentUser('sub') userId: string,
    @Body() dto: PreviewMembershipCheckoutDto,
  ) {
    return this.checkouts.preview(userId, dto);
  }

  @Post('checkouts/:checkoutId/verify')
  @ApiOperation({
    summary: 'Verify and atomically fulfill membership checkout',
  })
  verifyCheckout(
    @CurrentUser('sub') userId: string,
    @Param('checkoutId') checkoutId: string,
    @Body() dto: VerifyMembershipCheckoutDto,
    @Req() request: Request,
  ) {
    return this.checkouts.verify(userId, checkoutId, dto, request);
  }

  @Post(':membershipId/renewal-preview')
  @ApiOperation({ summary: 'Preview renewal of my current membership plan' })
  async previewRenewal(
    @CurrentUser('sub') userId: string,
    @Param('membershipId') membershipId: string,
  ) {
    const membership = await this.memberships.getMyMembership(
      userId,
      membershipId,
    );
    return this.memberships.previewRenewal(membership.clubId, membershipId, {});
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
  constructor(
    private readonly memberships: MembershipsService,
    private readonly checkouts: PlatformSubscriptionCheckoutService,
    private readonly entitlements: PlatformEntitlementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'My platform subscriptions' })
  list(@CurrentUser('sub') userId: string) {
    return this.memberships.listMyPlatformSubscriptions(userId);
  }

  @Get('entitlements/current')
  @ApiOperation({ summary: 'My server-authoritative platform entitlements' })
  entitlementsSummary(
    @CurrentUser('sub') userId: string,
    @Query('clubId') clubId?: string,
  ) {
    return this.entitlements.summary(userId, clubId);
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

  @Post('checkouts/preview')
  @ApiOperation({ summary: 'Preview a platform subscription checkout' })
  previewCheckout(
    @CurrentUser('sub') userId: string,
    @Body() dto: PreviewPlatformSubscriptionCheckoutDto,
  ) {
    return this.checkouts.preview(userId, dto);
  }

  @Post('checkouts/initiate')
  @ApiOperation({ summary: 'Initiate verified platform subscription checkout' })
  initiateCheckout(
    @CurrentUser('sub') userId: string,
    @Body() dto: InitiatePlatformSubscriptionCheckoutDto,
  ) {
    return this.checkouts.initiate(userId, dto);
  }

  @Post('checkouts/:checkoutId/verify')
  @ApiOperation({
    summary: 'Verify and atomically fulfill platform subscription checkout',
  })
  verifyCheckout(
    @CurrentUser('sub') userId: string,
    @Param('checkoutId') checkoutId: string,
    @Body() dto: VerifyPlatformSubscriptionCheckoutDto,
    @Req() request: Request,
  ) {
    return this.checkouts.verify(userId, checkoutId, dto, request);
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

  @Post(':subscriptionId/plan-change')
  @ApiOperation({ summary: 'Schedule a platform plan downgrade at period end' })
  schedulePlanChange(
    @CurrentUser('sub') userId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: SchedulePlatformPlanChangeDto,
    @Req() request: Request,
  ) {
    return this.memberships.schedulePlatformPlanChange(
      userId,
      subscriptionId,
      dto,
      request,
    );
  }
}
