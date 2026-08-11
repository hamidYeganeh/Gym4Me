import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../../audit/audit.module';
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
import {
  AccountPlatformSubscriptionsController,
  AthleteMembershipsController,
} from './athlete-memberships.controller';
import { AdminMembershipsController } from './admin-memberships.controller';
import { MembershipsService } from './memberships.service';
import {
  OwnerMembershipPlansController,
  OwnerMembershipsController,
} from './owner-memberships.controller';

@Module({
  imports: [
    AuditModule,
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: ClubMembershipPlan.name, schema: ClubMembershipPlanSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      { name: MembershipEvent.name, schema: MembershipEventSchema },
      { name: PlatformPlan.name, schema: PlatformPlanSchema },
      { name: PlatformSubscription.name, schema: PlatformSubscriptionSchema },
    ]),
  ],
  controllers: [
    OwnerMembershipPlansController,
    OwnerMembershipsController,
    AthleteMembershipsController,
    AccountPlatformSubscriptionsController,
    AdminMembershipsController,
  ],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
