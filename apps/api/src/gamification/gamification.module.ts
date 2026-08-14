import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Achievement, AchievementSchema } from '../schemas/achievement.schema';
import {
  AchievementGrant,
  AchievementGrantSchema,
} from '../schemas/achievement-grant.schema';
import {
  ArticleUserState,
  ArticleUserStateSchema,
} from '../schemas/article-user-state.schema';
import {
  AthleteProfile,
  AthleteProfileSchema,
} from '../schemas/athlete-profile.schema';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import {
  ClubUserReview,
  ClubUserReviewSchema,
} from '../schemas/club-user-review.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
import {
  CoachProfile,
  CoachProfileSchema,
} from '../schemas/coach-profile.schema';
import { PointRule, PointRuleSchema } from '../schemas/point-rule.schema';
import {
  PointTransaction,
  PointTransactionSchema,
} from '../schemas/point-transaction.schema';
import { AccountGamificationController } from './account-gamification.controller';
import { AdminGamificationController } from './admin-gamification.controller';
import { GamificationService } from './gamification.service';

@Module({
  imports: [
    AuditModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: AchievementGrant.name, schema: AchievementGrantSchema },
      { name: PointRule.name, schema: PointRuleSchema },
      { name: PointTransaction.name, schema: PointTransactionSchema },
      { name: AthleteProfile.name, schema: AthleteProfileSchema },
      { name: CoachProfile.name, schema: CoachProfileSchema },
      { name: Club.name, schema: ClubSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: ArticleUserState.name, schema: ArticleUserStateSchema },
      { name: ClubUserReview.name, schema: ClubUserReviewSchema },
    ]),
  ],
  controllers: [AdminGamificationController, AccountGamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
