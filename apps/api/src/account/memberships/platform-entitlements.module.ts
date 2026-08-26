import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../../schemas/club-membership.schema';
import { ClubStaff, ClubStaffSchema } from '../../schemas/club-staff.schema';
import { Club, ClubSchema } from '../../schemas/club.schema';
import {
  PlatformSubscription,
  PlatformSubscriptionSchema,
} from '../../schemas/platform-subscription.schema';
import { PlatformEntitlementService } from './application/services/platform-entitlement.service';
import {
  PlatformPlan,
  PlatformPlanSchema,
} from '../../schemas/platform-plan.schema';
import {
  PlatformEntitlementBoundary,
  PlatformEntitlementBoundarySchema,
} from '../../schemas/platform-entitlement-boundary.schema';
import {
  PlatformEntitlementUsage,
  PlatformEntitlementUsageSchema,
} from '../../schemas/platform-entitlement-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: ClubStaff.name, schema: ClubStaffSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
      { name: PlatformSubscription.name, schema: PlatformSubscriptionSchema },
      { name: PlatformPlan.name, schema: PlatformPlanSchema },
      {
        name: PlatformEntitlementBoundary.name,
        schema: PlatformEntitlementBoundarySchema,
      },
      {
        name: PlatformEntitlementUsage.name,
        schema: PlatformEntitlementUsageSchema,
      },
    ]),
  ],
  providers: [PlatformEntitlementService],
  exports: [PlatformEntitlementService],
})
export class PlatformEntitlementsModule {}
