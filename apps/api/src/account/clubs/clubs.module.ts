import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationModule } from '../../gamification/gamification.module';
import { UsersModule } from '../../users/users.module';
import {
  Achievement,
  AchievementSchema,
} from '../../schemas/achievement.schema';
import { ClubClass, ClubClassSchema } from '../../schemas/club-class.schema';
import { Club, ClubSchema } from '../../schemas/club.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../../schemas/coach-profile.schema';
import {
  ClubUserReview,
  ClubUserReviewSchema,
} from '../../schemas/club-user-review.schema';
import { Location, LocationSchema } from '../../schemas/location.schema';
import { RefItem, RefItemSchema } from '../../schemas/ref-item.schema';
import { Sport, SportSchema } from '../../schemas/sport.schema';
import { AdminClubsController } from './admin-clubs.controller';
import { ClubsListQuery } from './application/queries/clubs-list.query';
import { ClubsService } from './clubs.service';
import { DiscoveryClubsController } from './discovery-clubs.controller';
import { OwnerClubsController } from './owner-clubs.controller';

@Module({
  imports: [
    UsersModule,
    GamificationModule,
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
      { name: ClubClass.name, schema: ClubClassSchema },
      { name: ClubUserReview.name, schema: ClubUserReviewSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Sport.name, schema: SportSchema },
      { name: RefItem.name, schema: RefItemSchema },
    ]),
  ],
  controllers: [
    OwnerClubsController,
    AdminClubsController,
    DiscoveryClubsController,
  ],
  providers: [ClubsListQuery, ClubsService],
  exports: [ClubsService, MongooseModule],
})
export class ClubsModule {}
