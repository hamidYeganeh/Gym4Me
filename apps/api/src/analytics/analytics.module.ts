import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AnalyticsEvent,
  AnalyticsEventSchema,
} from '../schemas/analytics-event.schema';
import {
  UserAttribution,
  UserAttributionSchema,
} from '../schemas/user-attribution.schema';
import { AnalyticsController } from './analytics.controller';
import { AttributionService } from './attribution.service';
import { EventWriterService } from './event-writer.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      { name: UserAttribution.name, schema: UserAttributionSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [EventWriterService, AttributionService],
  exports: [EventWriterService, AttributionService],
})
export class AnalyticsModule {}
