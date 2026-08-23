import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../../audit/audit.module';
import { CouponsModule } from '../../coupons/coupons.module';
import { FinanceModule } from '../../finance/finance.module';
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
  PlatformPlan,
  PlatformPlanSchema,
} from '../../schemas/platform-plan.schema';
import {
  PlatformSubscription,
  PlatformSubscriptionSchema,
} from '../../schemas/platform-subscription.schema';
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
import {
  DiscoveryMembershipPlansController,
  DiscoveryPlatformPlansController,
} from './discovery-memberships.controller';
import { MembershipsService } from './memberships.service';
import {
  OwnerMembershipPlansController,
  OwnerMembershipsController,
} from './owner-memberships.controller';

@Module({
  imports: [
    AuditModule,
    CouponsModule,
    FinanceModule,
    StaffModule,
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: ClubMembershipPlan.name, schema: ClubMembershipPlanSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      { name: MembershipEvent.name, schema: MembershipEventSchema },
      { name: PlatformPlan.name, schema: PlatformPlanSchema },
      { name: PlatformSubscription.name, schema: PlatformSubscriptionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    DiscoveryMembershipPlansController,
    DiscoveryPlatformPlansController,
    OwnerMembershipPlansController,
    OwnerMembershipsController,
    AthleteMembershipsController,
    AccountPlatformPlansController,
    AccountPlatformSubscriptionsController,
    AdminMembershipsController,
  ],
  providers: [SellMembershipCommand, MembershipsService, StaffPermissionGuard],
  exports: [MembershipsService],
})
export class MembershipsModule {}
