import { Types } from 'mongoose';
import { NotificationPreferencesService } from './notification-preferences.service';

describe('NotificationPreferencesService', () => {
  it('atomically upserts defaults when preferences do not exist yet', async () => {
    const userId = new Types.ObjectId().toString();
    const doc = {
      userId: new Types.ObjectId(userId),
      channels: undefined,
      quietHours: undefined,
      marketingDailyCap: undefined,
      updatedAt: new Date('2026-08-22T00:00:00.000Z'),
    };
    const findOneAndUpdate = jest.fn().mockResolvedValue(doc);
    const service = new NotificationPreferencesService({
      findOneAndUpdate,
    } as never);

    const result = await service.getOrCreate(userId);

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId) } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    expect(result).toMatchObject({
      userId,
      channels: {
        push: true,
        sms: true,
        inApp: true,
        email: false,
        marketing: false,
      },
      quietHours: {
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Tehran',
      },
      marketingDailyCap: 3,
    });
  });
});
