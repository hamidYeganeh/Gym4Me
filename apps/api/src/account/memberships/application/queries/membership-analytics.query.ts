import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MembershipStatus } from '../../../../common/enums';
import {
  ClubMembership,
  type ClubMembershipDocument,
} from '../../../../schemas/club-membership.schema';

/** Membership-owned aggregate used by finance analytics composition. */
@Injectable()
export class MembershipAnalyticsQuery {
  constructor(
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
  ) {}

  async getFinanceCounts(clubId: Types.ObjectId, since: Date) {
    const [newMembers, activeMembers, cancelledMembers] = await Promise.all([
      this.membershipModel.countDocuments({
        clubId,
        createdAt: { $gte: since },
      }),
      this.membershipModel.countDocuments({
        clubId,
        status: MembershipStatus.ACTIVE,
      }),
      this.membershipModel.countDocuments({
        clubId,
        status: MembershipStatus.CANCELLED,
        updatedAt: { $gte: since },
      }),
    ]);
    return { newMembers, activeMembers, cancelledMembers };
  }
}
