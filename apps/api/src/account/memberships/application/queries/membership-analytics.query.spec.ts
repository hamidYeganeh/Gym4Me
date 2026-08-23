import { Types } from 'mongoose';
import { MembershipStatus } from '../../../../common/enums';
import { MembershipAnalyticsQuery } from './membership-analytics.query';

describe('MembershipAnalyticsQuery', () => {
  it('owns membership counts exposed to finance without sharing the model', async () => {
    const clubId = new Types.ObjectId();
    const since = new Date('2026-08-01T00:00:00.000Z');
    const countDocuments = jest
      .fn()
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(40)
      .mockResolvedValueOnce(3);
    const query = new MembershipAnalyticsQuery({ countDocuments } as never);

    await expect(query.getFinanceCounts(clubId, since)).resolves.toEqual({
      newMembers: 12,
      activeMembers: 40,
      cancelledMembers: 3,
    });
    expect(countDocuments).toHaveBeenNthCalledWith(1, {
      clubId,
      createdAt: { $gte: since },
    });
    expect(countDocuments).toHaveBeenNthCalledWith(2, {
      clubId,
      status: MembershipStatus.ACTIVE,
    });
    expect(countDocuments).toHaveBeenNthCalledWith(3, {
      clubId,
      status: MembershipStatus.CANCELLED,
      updatedAt: { $gte: since },
    });
  });
});
