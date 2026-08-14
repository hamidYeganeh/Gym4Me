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

export type TouchPointInput = Partial<Omit<TouchPoint, 'capturedAt'>> & {
  capturedAt?: Date;
};

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
   * Uses atomic upsert so concurrent captures for the same user cannot race
   * on the unique userId index.
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

    const userObjectId = new Types.ObjectId(userId);

    try {
      await this.attributionModel.updateOne(
        { userId: userObjectId },
        {
          $set: { lastTouch: point },
          $setOnInsert: { firstTouch: point },
        },
        { upsert: true },
      );
    } catch (err: unknown) {
      // Concurrent upserts can both attempt insert; loser hits E11000.
      if (!isDuplicateKeyError(err)) {
        throw err;
      }
      await this.attributionModel.updateOne(
        { userId: userObjectId },
        { $set: { lastTouch: point } },
      );
    }

    // Backfill firstTouch on partial/legacy docs (write-once).
    await this.attributionModel.updateOne(
      {
        userId: userObjectId,
        $or: [
          { firstTouch: { $exists: false } },
          { firstTouch: null },
          { 'firstTouch.capturedAt': { $exists: false } },
        ],
      },
      { $set: { firstTouch: point } },
    );

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

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: number }).code === 11000
  );
}
