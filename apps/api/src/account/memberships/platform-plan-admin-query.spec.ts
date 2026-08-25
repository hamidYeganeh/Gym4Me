import { EntityStatus } from '../../common/enums';
import { MembershipsService } from './memberships.service';

describe('MembershipsService platform plan admin query', () => {
  it('queries and projects platform plans rather than subscriptions', async () => {
    const plan = {
      _id: { toString: () => 'plan-1' },
      code: 'owner-pro',
      name: 'حرفه‌ای',
      description: 'پلن تست',
      pricing: {
        amount: 1_000_000,
        tax: 100_000,
        currency: 'IRT',
        periodDays: 30,
      },
      features: ['clubs.manage'],
      status: EntityStatus.ACTIVE,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-02T00:00:00.000Z'),
    };
    const limit = jest.fn().mockResolvedValue([plan]);
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });
    const find = jest.fn().mockReturnValue({ sort });
    const countDocuments = jest.fn().mockResolvedValue(1);
    const platformPlanModel = { find, countDocuments };
    const platformSubModel = {
      find: jest.fn(() => {
        throw new Error('subscription collection must not be queried');
      }),
      countDocuments: jest.fn(),
    };
    const service = new MembershipsService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      platformPlanModel as never,
      platformSubModel as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.adminListPlatformPlans({
      page: 2,
      page_size: 10,
      status: [EntityStatus.ACTIVE],
    });

    expect(find).toHaveBeenCalledWith({ status: [EntityStatus.ACTIVE] });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(skip).toHaveBeenCalledWith(10);
    expect(limit).toHaveBeenCalledWith(10);
    expect(countDocuments).toHaveBeenCalledWith({
      status: [EntityStatus.ACTIVE],
    });
    expect(platformSubModel.find).not.toHaveBeenCalled();
    expect(result.result).toEqual([
      expect.objectContaining({
        id: 'plan-1',
        code: 'owner-pro',
        pricing: expect.objectContaining({ currency: 'IRT' }),
      }),
    ]);
  });
});
