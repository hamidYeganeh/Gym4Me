import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AthleteProfile,
  AthleteProfileSchema,
} from '../schemas/athlete-profile.schema';
import { Article, ArticleSchema } from '../schemas/article.schema';
import { Banner, BannerSchema } from '../schemas/banner.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
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
    MongooseModule.forFeature([
      { name: DiscoveryPage.name, schema: DiscoveryPageSchema },
      {
        name: DiscoveryPageRevision.name,
        schema: DiscoveryPageRevisionSchema,
      },
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Club.name, schema: ClubSchema },
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
