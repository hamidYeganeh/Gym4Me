import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationPreference,
  NotificationPreferenceDocument,
} from '../schemas/notification-preference.schema';

export type UpdateNotificationPreferenceInput = {
  channels?: {
    push?: boolean;
    sms?: boolean;
    inApp?: boolean;
    email?: boolean;
    marketing?: boolean;
  };
  quietHours?: {
    start?: string;
    end?: string;
    timezone?: string;
  };
  marketingDailyCap?: number;
};

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectModel(NotificationPreference.name)
    private readonly preferenceModel: Model<NotificationPreferenceDocument>,
  ) {}

  async getOrCreate(userId: string) {
    let doc = await this.preferenceModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!doc) {
      doc = await this.preferenceModel.create({
        userId: new Types.ObjectId(userId),
      });
    }
    return this.toPublic(doc);
  }

  async update(userId: string, input: UpdateNotificationPreferenceInput) {
    const doc = await this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          ...(input.channels
            ? Object.fromEntries(
                Object.entries(input.channels).map(([k, v]) => [
                  `channels.${k}`,
                  v,
                ]),
              )
            : {}),
          ...(input.quietHours
            ? Object.fromEntries(
                Object.entries(input.quietHours).map(([k, v]) => [
                  `quietHours.${k}`,
                  v,
                ]),
              )
            : {}),
          ...(input.marketingDailyCap !== undefined
            ? { marketingDailyCap: input.marketingDailyCap }
            : {}),
        },
        $setOnInsert: { userId: new Types.ObjectId(userId) },
      },
      { upsert: true, new: true },
    );
    return this.toPublic(doc);
  }

  /** True when local wall-clock is inside quiet hours (best-effort for Asia/Tehran). */
  async isInQuietHours(userId: string, at = new Date()): Promise<boolean> {
    const prefs = await this.getOrCreate(userId);
    const [sh, sm] = prefs.quietHours.start.split(':').map(Number);
    const [eh, em] = prefs.quietHours.end.split(':').map(Number);
    const minutes = at.getHours() * 60 + at.getMinutes();
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start === end) return false;
    if (start < end) return minutes >= start && minutes < end;
    return minutes >= start || minutes < end;
  }

  private toPublic(doc: NotificationPreferenceDocument) {
    return {
      userId: doc.userId.toString(),
      channels: {
        push: doc.channels?.push ?? true,
        sms: doc.channels?.sms ?? true,
        inApp: doc.channels?.inApp ?? true,
        email: doc.channels?.email ?? false,
        marketing: doc.channels?.marketing ?? false,
      },
      quietHours: {
        start: doc.quietHours?.start ?? '22:00',
        end: doc.quietHours?.end ?? '08:00',
        timezone: doc.quietHours?.timezone ?? 'Asia/Tehran',
      },
      marketingDailyCap: doc.marketingDailyCap ?? 3,
      updatedAt: doc.updatedAt,
    };
  }
}
