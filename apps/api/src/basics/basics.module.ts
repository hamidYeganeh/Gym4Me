import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import {
  ChoiceGroup,
  ChoiceGroupSchema,
} from '../schemas/choice-group.schema';
import { Location, LocationSchema } from '../schemas/location.schema';
import { RefItem, RefItemSchema } from '../schemas/ref-item.schema';
import { Sport, SportSchema } from '../schemas/sport.schema';
import { AdminBasicsController } from './admin/admin-basics.controller';
import { ChoicesController } from './choices/choices.controller';
import { ChoicesService } from './choices/choices.service';
import { LocationController } from './location/location.controller';
import { LocationService } from './location/location.service';
import { RefController } from './ref/ref.controller';
import { RefService } from './ref/ref.service';
import { SportController } from './sport/sport.controller';
import { SportService } from './sport/sport.service';

@Module({
  imports: [
    MediaModule,
    MongooseModule.forFeature([
      { name: ChoiceGroup.name, schema: ChoiceGroupSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Sport.name, schema: SportSchema },
      { name: RefItem.name, schema: RefItemSchema },
    ]),
  ],
  // SportController before RefController so static sport-* paths win over :type
  controllers: [
    ChoicesController,
    LocationController,
    SportController,
    RefController,
    AdminBasicsController,
  ],
  providers: [ChoicesService, LocationService, SportService, RefService],
  exports: [ChoicesService, LocationService, SportService, RefService],
})
export class BasicsModule {}
