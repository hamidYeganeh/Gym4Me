import { Types } from 'mongoose';
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  EntityStatus,
  PublishStatus,
} from '../../common/enums';
import { MembershipsService } from './memberships.service';

describe('MembershipsService public plan summaries', () => {
  it('returns bounded per-currency minimums only for discoverable clubs', async () => {
    const visibleClubId = new Types.ObjectId();
    const hiddenClubId = new Types.ObjectId();
    const lean = jest.fn().mockResolvedValue([{ _id: visibleClubId }]);
    const select = jest.fn().mockReturnValue({ lean });
    const clubModel = { find: jest.fn().mockReturnValue({ select }) };
    const planModel = {
      aggregate: jest.fn().mockResolvedValue([
        {
          _id: { clubId: visibleClubId, currency: 'IRR' },
          fromAmount: 2_500_000,
          planCount: 1,
        },
        {
          _id: { clubId: visibleClubId, currency: 'IRT' },
          fromAmount: 250_000,
          planCount: 2,
        },
      ]),
    };
    const service = new MembershipsService(
      clubModel as never,
      planModel as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.listPublicPlanSummaries([
      visibleClubId.toString(),
      hiddenClubId.toString(),
    ]);

    expect(clubModel.find).toHaveBeenCalledWith({
      _id: { $in: [visibleClubId, hiddenClubId] },
      'review.status': ClubLifecycleStatus.APPROVED,
      operationalStatus: ClubOperationalStatus.ACTIVE,
    });
    expect(planModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          clubId: { $in: [visibleClubId] },
          status: EntityStatus.ACTIVE,
          publishStatus: PublishStatus.PUBLISHED,
        },
      },
      {
        $group: {
          _id: { clubId: '$clubId', currency: '$pricing.currency' },
          fromAmount: { $min: '$pricing.amount' },
          planCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.clubId': 1, '_id.currency': 1 } },
    ]);
    expect(result).toEqual({
      items: [
        {
          clubId: visibleClubId.toString(),
          offers: [
            { currency: 'IRR', fromAmount: 2_500_000, planCount: 1 },
            { currency: 'IRT', fromAmount: 250_000, planCount: 2 },
          ],
        },
      ],
    });
  });
});
