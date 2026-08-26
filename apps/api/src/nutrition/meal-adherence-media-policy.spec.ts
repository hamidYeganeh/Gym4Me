import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MealAdherenceStatus, MediaVisibility } from '../common/enums';
import { MediaPurpose } from '../schemas/media.schema';
import { NutritionService } from './nutrition.service';

describe('NutritionService meal adherence media policy', () => {
  const athleteId = new Types.ObjectId();
  const planId = new Types.ObjectId();
  const mediaId = new Types.ObjectId().toString();
  const session = { id: 'session' };

  function setup(claimError?: Error) {
    const plan = {
      _id: planId,
      athleteUserId: athleteId,
      days: [{ dayIndex: 0, meals: [{ name: 'ناهار', items: [] }] }],
    };
    const created = {
      _id: new Types.ObjectId(),
      athleteUserId: athleteId,
      mealPlanId: planId,
      slot: { dayIndex: 0, mealIndex: 0 },
      status: MealAdherenceStatus.FOLLOWED,
      loggedAt: new Date(),
      privacy: 'private',
      mediaId: new Types.ObjectId(mediaId),
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject() {
        return this;
      },
    };
    const plans = { findById: jest.fn().mockResolvedValue(plan) };
    const adherence = {
      create: jest.fn().mockResolvedValue([created]),
      findOne: jest.fn().mockResolvedValue(null),
    };
    const audit = { log: jest.fn() };
    const media = {
      assertOwnedImage: jest.fn().mockResolvedValue({}),
      claimMealAdherence: claimError
        ? jest.fn().mockRejectedValue(claimError)
        : jest.fn().mockResolvedValue(undefined),
    };
    const transactions = {
      run: jest.fn((work: (value: unknown) => unknown) => work(session)),
    };
    const service = new NutritionService(
      plans as never,
      {} as never,
      adherence as never,
      audit as never,
      media as never,
      transactions as never,
    );
    return { adherence, audit, created, media, service };
  }

  it('claims an owned private meal image in the creation transaction', async () => {
    const { adherence, created, media, service } = setup();
    await service.createMealAdherence(
      athleteId.toString(),
      {
        idempotencyKey: 'meal-log-with-media',
        mealPlanId: planId.toString(),
        slot: { dayIndex: 0, mealIndex: 0 },
        status: MealAdherenceStatus.FOLLOWED,
        mediaId,
      },
      {} as never,
    );
    expect(media.assertOwnedImage).toHaveBeenCalledWith(
      mediaId,
      athleteId.toString(),
      MediaVisibility.PRIVATE,
      MediaPurpose.MEAL_ADHERENCE,
    );
    expect(adherence.create).toHaveBeenCalledWith(expect.any(Array), {
      session,
    });
    expect(media.claimMealAdherence).toHaveBeenCalledWith(
      mediaId,
      athleteId.toString(),
      created._id,
      session,
    );
  });

  it('rejects a slot missing from the plan', async () => {
    const { adherence, service } = setup();
    await expect(
      service.createMealAdherence(
        athleteId.toString(),
        {
          idempotencyKey: 'meal-log-invalid-slot',
          mealPlanId: planId.toString(),
          slot: { dayIndex: 4, mealIndex: 0 },
          status: MealAdherenceStatus.SKIPPED,
        },
        {} as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(adherence.create).not.toHaveBeenCalled();
  });

  it('does not audit when the media claim fails', async () => {
    const { audit, service } = setup(new ForbiddenException());
    await expect(
      service.createMealAdherence(
        athleteId.toString(),
        {
          idempotencyKey: 'meal-log-claim-failure',
          mealPlanId: planId.toString(),
          slot: { dayIndex: 0, mealIndex: 0 },
          status: MealAdherenceStatus.FOLLOWED,
          mediaId,
        },
        {} as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('returns the original log on a safe retry without a second mutation', async () => {
    const { adherence, audit, created, service } = setup();
    const dto = {
      idempotencyKey: 'meal-log-safe-retry',
      mealPlanId: planId.toString(),
      slot: { dayIndex: 0, mealIndex: 0 },
      status: MealAdherenceStatus.FOLLOWED,
      mediaId,
    };
    await service.createMealAdherence(athleteId.toString(), dto, {} as never);
    const payload = adherence.create.mock.calls[0]?.[0]?.[0] as {
      idempotencyFingerprint: string;
    };
    Object.assign(created, {
      idempotencyFingerprint: payload.idempotencyFingerprint,
    });
    adherence.findOne.mockResolvedValue(created);

    await service.createMealAdherence(athleteId.toString(), dto, {} as never);
    expect(adherence.create).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledTimes(1);
  });
});
