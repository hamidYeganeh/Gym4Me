import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EntityStatus } from '../common/enums';
import { CouponDiscountType } from '../schemas/coupon.schema';
import { CouponsService } from './coupons.service';

function query<T>(value: T) {
  const result = {
    session: jest.fn(),
    lean: jest.fn().mockResolvedValue(value),
    then: (
      resolve: (resolved: T) => unknown,
      reject: (error: unknown) => unknown,
    ) => Promise.resolve(value).then(resolve, reject),
  };
  result.session.mockReturnValue(result);
  return result;
}

function setup(globalModifiedCount = 1) {
  const coupon = {
    _id: new Types.ObjectId(),
    code: 'SAVE',
    status: EntityStatus.ACTIVE,
    discount: { type: CouponDiscountType.PERCENT, value: 10 },
    constraints: { maxRedemptions: 5, maxPerUser: 2 },
    redemptionCount: 1,
  };
  const couponModel = {
    findOne: jest.fn().mockReturnValue(query(coupon)),
    updateOne: jest.fn().mockResolvedValue({
      modifiedCount: globalModifiedCount,
    }),
  };
  const save = jest.fn().mockResolvedValue(undefined);
  const RedemptionModel = Object.assign(
    jest.fn().mockImplementation((input: object) => ({ ...input, save })),
    { findOne: jest.fn().mockReturnValue(query(null)) },
  );
  const userUsageModel = {
    findOne: jest.fn().mockReturnValue(query(null)),
    findOneAndUpdate: jest.fn().mockResolvedValue({ count: 1 }),
  };
  const service = new CouponsService(
    couponModel as never,
    RedemptionModel as never,
    userUsageModel as never,
  );
  return { service, coupon, couponModel, userUsageModel };
}

describe('CouponsService atomic redemption limits', () => {
  it('increments global and per-user counters with conditional limits', async () => {
    const { service, coupon, couponModel, userUsageModel } = setup();
    const userId = new Types.ObjectId().toString();

    await expect(
      service.redeem(
        'save',
        { userId, amount: 100_000, contextKey: 'booking:1' },
        {} as never,
      ),
    ).resolves.toEqual({ discount: 10_000, idempotent: false });
    expect(couponModel.updateOne).toHaveBeenCalledWith(
      { _id: coupon._id, redemptionCount: { $lt: 5 } },
      { $inc: { redemptionCount: 1 } },
      { session: {} },
    );
    expect(userUsageModel.findOneAndUpdate).toHaveBeenCalledWith(
      {
        couponId: coupon._id,
        userId: new Types.ObjectId(userId),
        count: { $lt: 2 },
      },
      { $inc: { count: 1 } },
      expect.objectContaining({ upsert: true, returnDocument: 'after' }),
    );
  });

  it('rejects when the atomic global counter no longer has capacity', async () => {
    const { service } = setup(0);
    await expect(
      service.redeem(
        'SAVE',
        {
          userId: new Types.ObjectId().toString(),
          amount: 100_000,
          contextKey: 'booking:2',
        },
        {} as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('CouponsService owner scope and safe create replay', () => {
  const ownerId = new Types.ObjectId().toString();
  const clubId = new Types.ObjectId().toString();
  const input = {
    code: 'CLUB10',
    discount: { type: CouponDiscountType.PERCENT, value: 10 },
    constraints: { maxRedemptions: 10, maxPerUser: 1 },
    status: EntityStatus.ACTIVE,
  };

  function ownerSetup(storedClubId = clubId) {
    const existing = {
      _id: new Types.ObjectId(),
      code: input.code,
      title: undefined,
      clubId: new Types.ObjectId(storedClubId),
      discount: input.discount,
      constraints: input.constraints,
      status: EntityStatus.ACTIVE,
      redemptionCount: 0,
      createdAt: new Date(),
    };
    const couponModel = { findOne: jest.fn().mockResolvedValue(existing) };
    const clubModel = { exists: jest.fn().mockResolvedValue({ _id: clubId }) };
    const service = new CouponsService(
      couponModel as never,
      {} as never,
      {} as never,
      clubModel as never,
    );
    return { couponModel, service };
  }

  it('replays the same natural-key payload without creating a duplicate', async () => {
    const { couponModel, service } = ownerSetup();

    await expect(
      service.createForOwner(ownerId, clubId, input),
    ).resolves.toEqual(expect.objectContaining({ code: input.code, clubId }));
    expect(couponModel.findOne).toHaveBeenCalledTimes(1);
  });

  it('does not expose another club coupon through code replay', async () => {
    const { service } = ownerSetup(new Types.ObjectId().toString());

    await expect(
      service.createForOwner(ownerId, clubId, input),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
