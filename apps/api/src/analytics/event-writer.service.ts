import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnalyticsEventName, Role } from '../common/enums';
import { randomToken } from '../common/utils/hash.util';
import {
  AnalyticsEvent,
  AnalyticsEventDocument,
} from '../schemas/analytics-event.schema';

export interface TrackEventInput {
  eventId?: string;
  eventName: AnalyticsEventName;
  occurredAt?: Date;
  schemaVersion?: number;
  actor?: {
    userId?: string | Types.ObjectId;
    activeRole?: Role;
  };
  context?: {
    source?: string;
    platform?: string;
    locale?: string;
    timezone?: string;
    correlationId?: string;
    clubId?: string | Types.ObjectId;
  };
  properties?: Record<string, unknown>;
}

@Injectable()
export class EventWriterService {
  private readonly logger = new Logger(EventWriterService.name);

  constructor(
    @InjectModel(AnalyticsEvent.name)
    private readonly eventModel: Model<AnalyticsEventDocument>,
  ) {}

  /**
   * Idempotent upsert by eventId. Safe to call from domain services after commit.
   */
  async track(input: TrackEventInput): Promise<void> {
    const eventId = input.eventId ?? `srv_${randomToken(16)}`;
    try {
      await this.eventModel.updateOne(
        { eventId },
        {
          $setOnInsert: {
            eventId,
            eventName: input.eventName,
            occurredAt: input.occurredAt ?? new Date(),
            schemaVersion: input.schemaVersion ?? 1,
            actor: {
              userId: input.actor?.userId
                ? new Types.ObjectId(input.actor.userId.toString())
                : undefined,
              activeRole: input.actor?.activeRole,
            },
            context: {
              source: input.context?.source,
              platform: input.context?.platform,
              locale: input.context?.locale,
              timezone: input.context?.timezone,
              correlationId: input.context?.correlationId,
              clubId: input.context?.clubId
                ? new Types.ObjectId(input.context.clubId.toString())
                : undefined,
            },
            properties: input.properties ?? {},
          },
        },
        { upsert: true },
      );
    } catch (err) {
      // Analytics must not break domain flows.
      this.logger.warn(
        `Failed to track ${input.eventName}: ${(err as Error).message}`,
      );
    }
  }
}
