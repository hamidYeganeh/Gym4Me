import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../../../../schemas/club-membership.schema';
import { MembershipAnalyticsQuery } from './membership-analytics.query';

/** Read-only membership API for cross-domain analytics composition. */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClubMembership.name, schema: ClubMembershipSchema },
    ]),
  ],
  providers: [MembershipAnalyticsQuery],
  exports: [MembershipAnalyticsQuery],
})
export class MembershipAnalyticsModule {}
