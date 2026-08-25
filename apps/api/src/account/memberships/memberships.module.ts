import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../../audit/audit.module';
import { CouponsModule } from '../../coupons/coupons.module';
import { FinanceModule } from '../../finance/finance.module';
import { OutboxModule } from '../../outbox/outbox.module';
import { Club, ClubSchema } from '../../schemas/club.schema';
import {
  ClubMembershipPlan,
  ClubMembershipPlanSchema,
} from '../../schemas/club-membership-plan.schema';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../../schemas/club-membership.schema';
import {
  MembershipEvent,
  MembershipEventSchema,
} from '../../schemas/membership-event.schema';
import {
  MembershipCheckout,
  MembershipCheckoutSchema,
} from '../../schemas/membership-checkout.schema';
import { Payment, PaymentSchema } from '../../schemas/payment.schema';
import {
  PlatformPlan,
  PlatformPlanSchema,
} from '../../schemas/platform-plan.schema';
import {
  PlatformSubscription,
  PlatformSubscriptionSchema,
} from '../../schemas/platform-subscription.schema';
import {
  PlatformSubscriptionCheckout,
  PlatformSubscriptionCheckoutSchema,
} from '../../schemas/platform-subscription-checkout.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { StaffPermissionGuard } from '../../common/guards/staff-permission.guard';
import { StaffModule } from '../staff/staff.module';
import {
  AccountPlatformPlansController,
  AccountPlatformSubscriptionsController,
  AthleteMembershipsController,
} from './athlete-memberships.controller';
import { AdminMembershipsController } from './admin-memberships.controller';
import { SellMembershipCommand } from './application/commands/sell-membership.command';
import { RenewMembershipCommand } from './application/commands/renew-membership.command';
import { MembershipCheckoutService } from './application/services/membership-checkout.service';
import {
  DiscoveryMembershipPlanSummariesController,
  DiscoveryMembershipPlansController,
  DiscoveryPlatformPlansController,
} from './discovery-memberships.controller';
import { MembershipsService } from './memberships.service';
import { MembershipCheckoutReconciliationWorker } from './membership-checkout-reconciliation.worker';
import { PlatformSubscriptionCheckoutService } from './application/services/platform-subscription-checkout.service';
import { PlatformSubscriptionCheckoutReconciliationService } from './application/services/platform-subscription-checkout-reconciliation.service';
import { PlatformSubscriptionCheckoutPolicy } from './application/policies/platform-subscription-checkout.policy';
import { PlatformSubscriptionCheckoutReconciliationWorker } from './platform-subscription-checkout-reconciliation.worker';
import {
  OwnerMembershipPlansController,
  OwnerMembershipsController,
} from './owner-memberships.controller';

@Module({
  imports: [
    AuditModule,
    CouponsModule,
    FinanceModule,
    OutboxModule,
    StaffModule,
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: ClubMembershipPlan.name, schema: ClubMembershipPlanSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      { name: MembershipEvent.name, schema: MembershipEventSchema },
      { name: MembershipCheckout.name, schema: MembershipCheckoutSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: PlatformPlan.name, schema: PlatformPlanSchema },
      { name: PlatformSubscription.name, schema: PlatformSubscriptionSchema },
      {
        name: PlatformSubscriptionCheckout.name,
        schema: PlatformSubscriptionCheckoutSchema,
      },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    DiscoveryMembershipPlansController,
    DiscoveryMembershipPlanSummariesController,
    DiscoveryPlatformPlansController,
    OwnerMembershipPlansController,
    OwnerMembershipsController,
    AthleteMembershipsController,
    AccountPlatformPlansController,
    AccountPlatformSubscriptionsController,
    AdminMembershipsController,
  ],
  providers: [
    RenewMembershipCommand,
    MembershipCheckoutService,
    MembershipCheckoutReconciliationWorker,
    PlatformSubscriptionCheckoutService,
    PlatformSubscriptionCheckoutPolicy,
    PlatformSubscriptionCheckoutReconciliationService,
    PlatformSubscriptionCheckoutReconciliationWorker,
    SellMembershipCommand,
    MembershipsService,
    StaffPermissionGuard,
  ],
  exports: [MembershipsService],
})
export class MembershipsModule {}
