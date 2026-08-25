import { Types } from 'mongoose';
import { AdminKycService } from './admin-kyc.service';

describe('AdminKycService', () => {
  it('keeps an orphaned request visible without crashing the admin queue', async () => {
    const query = {
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
      populate: jest.fn(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          userId: null,
          kind: 'identity',
          status: 'pending',
          createdAt: new Date('2026-08-25T00:00:00.000Z'),
        },
      ]),
    };
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    query.populate.mockReturnValue(query);
    const model = {
      find: jest.fn().mockReturnValue(query),
      countDocuments: jest.fn().mockResolvedValue(1),
    };
    const service = new AdminKycService(
      model as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.list({ page: 1, page_size: 20 });

    expect(result.result[0]?.userId).toBeNull();
  });
});
