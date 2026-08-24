import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClubSlotsModule } from '../account/club-slots/club-slots.module';
import { CoachesModule } from '../account/coaches/coaches.module';
import {
  AthleteProfile,
  AthleteProfileSchema,
} from '../schemas/athlete-profile.schema';
import { Article, ArticleSchema } from '../schemas/article.schema';
import { Banner, BannerSchema } from '../schemas/banner.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
import { ClubClass, ClubClassSchema } from '../schemas/club-class.schema';
import {
  ClubMembershipPlan,
  ClubMembershipPlanSchema,
} from '../schemas/club-membership-plan.schema';
import { ClubSpace, ClubSpaceSchema } from '../schemas/club-space.schema';
import { CoachSlot, CoachSlotSchema } from '../schemas/coach-slot.schema';
import {
  DiscoveryPage,
  DiscoveryPageRevision,
  DiscoveryPageRevisionSchema,
  DiscoveryPageSchema,
} from '../schemas/discovery-page.schema';
import { RefItem, RefItemSchema } from '../schemas/ref-item.schema';
import { Sport, SportSchema } from '../schemas/sport.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { AdminDiscoveryController } from './admin-discovery.controller';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

@Module({
  imports: [
    CoachesModule,
    ClubSlotsModule,
    MongooseModule.forFeature([
      { name: DiscoveryPage.name, schema: DiscoveryPageSchema },
      {
        name: DiscoveryPageRevision.name,
        schema: DiscoveryPageRevisionSchema,
      },
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Club.name, schema: ClubSchema },
      { name: ClubClass.name, schema: ClubClassSchema },
      { name: ClubSpace.name, schema: ClubSpaceSchema },
      { name: CoachSlot.name, schema: CoachSlotSchema },
      {
        name: ClubMembershipPlan.name,
        schema: ClubMembershipPlanSchema,
      },
      { name: RefItem.name, schema: RefItemSchema },
      { name: Sport.name, schema: SportSchema },
      { name: Article.name, schema: ArticleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DiscoveryController, AdminDiscoveryController],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
