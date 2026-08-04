import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnalyticsEventName } from '../common/enums';
import {
  TouchPoint,
  UserAttribution,
  UserAttributionDocument,
} from '../schemas/user-attribution.schema';
import { EventWriterService } from './event-writer.service';

export type TouchPointInput = Partial<
  Omit<TouchPoint, 'capturedAt'>
> & { capturedAt?: Date };

@Injectable()
export class AttributionService {
  constructor(
    @InjectModel(UserAttribution.name)
    private readonly attributionModel: Model<UserAttributionDocument>,
    private readonly events: EventWriterService,
  ) {}

  async get(userId: string) {
    const doc = await this.attributionModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    if (!doc) {
      return { userId, firstTouch: null, lastTouch: null };
    }
    return {
      userId,
      firstTouch: doc.firstTouch ?? null,
      lastTouch: doc.lastTouch ?? null,
    };
  }

  /**
   * Captures a touch. firstTouch is write-once; lastTouch always updates.
   */
  async capture(userId: string, touch: TouchPointInput, activeRole?: string) {
    const capturedAt = touch.capturedAt ?? new Date();
    const point: TouchPoint = {
      source: touch.source,
      medium: touch.medium,
      campaign: touch.campaign,
      content: touch.content,
      term: touch.term,
      referrer: touch.referrer,
      landingPage: touch.landingPage,
      referralCode: touch.referralCode,
      deepLink: touch.deepLink,
      capturedAt,
    };

    const existing = await this.attributionModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!existing) {
      await this.attributionModel.create({
        userId: new Types.ObjectId(userId),
        firstTouch: point,
        lastTouch: point,
      });
    } else {
      existing.lastTouch = point;
      if (!existing.firstTouch?.capturedAt) {
        existing.firstTouch = point;
      }
      existing.markModified('firstTouch');
      existing.markModified('lastTouch');
      await existing.save();
    }

    await this.events.track({
      eventName: AnalyticsEventName.ATTRIBUTION_CAPTURED,
      actor: {
        userId,
        activeRole: activeRole as never,
      },
      properties: {
        source: point.source,
        medium: point.medium,
        campaign: point.campaign,
        referralCode: point.referralCode,
      },
    });

    return this.get(userId);
  }
}
