import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import type Redis from 'ioredis';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './app-config/app-config.module';
import { AuthModule } from './account/auth/auth.module';
import { BookingsModule } from './account/bookings/bookings.module';
import { CalendarModule } from './account/calendar/calendar.module';
import { ClubSlotsModule } from './account/club-slots/club-slots.module';
import { ClubsModule } from './account/clubs/clubs.module';
import { CoachesModule } from './account/coaches/coaches.module';
import { CoachingModule } from './account/coaching/coaching.module';
import { KycModule } from './account/kyc/kyc.module';
import { MembershipsModule } from './account/memberships/memberships.module';
import { ProfileModule } from './account/profile/profile.module';
import { ReferralModule } from './account/referral/referral.module';
import { RolesModule } from './account/roles/roles.module';
import { StaffModule } from './account/staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { BasicsModule } from './basics/basics.module';
import { ArticlesModule } from './articles/articles.module';
import { BannersModule } from './banners/banners.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { CheckinModule } from './checkin/checkin.module';
import { CouponsModule } from './coupons/coupons.module';
import { FinanceModule } from './finance/finance.module';
import { GamificationModule } from './gamification/gamification.module';
import { LifecycleModule } from './lifecycle/lifecycle.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { KycGuard } from './common/guards/kyc.guard';
import { MongoTransactionModule } from './common/mongo/mongo-transaction.module';
import { WorkerRuntimeModule } from './common/jobs/worker-runtime.module';
import { RolesGuard } from './common/guards/roles.guard';
import { REDIS, RedisModule } from './common/redis/redis.module';
import { SmsModule } from './common/sms/sms.module';
import { PushModule } from './common/push/push.module';
import { PaymentModule } from './common/payment/payment.module';
import { StorageModule } from './common/storage/storage.module';
import {
  AUTH_THROTTLE_DAY,
  AUTH_THROTTLE_MINUTE,
  skipUnlessAuthThrottleNamed,
} from './common/throttling/auth-throttle';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { OpsModule } from './ops/ops.module';
import { OutboxModule } from './outbox/outbox.module';
import { ProgressModule } from './progress/progress.module';
import { SocialModule } from './social/social.module';
import { SupportModule } from './support/support.module';
import { ActionCenterModule } from './action-center/action-center.module';
import { UsersModule } from './users/users.module';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Resolve from this file so turbo/root cwd still loads apps/api/.env
      envFilePath: [join(__dirname, '..', '.env'), '.env'],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    MongoTransactionModule,
    WorkerRuntimeModule,
    RedisModule,
    ThrottlerModule.forRootAsync({
      inject: [REDIS, ConfigService],
      useFactory: (redis: Redis, config: ConfigService) => {
        // Local/E2E escape hatch: never enable in production.
        const disabled = config.get('THROTTLE_DISABLED') === 'true';
        const skipMinute = skipUnlessAuthThrottleNamed(AUTH_THROTTLE_MINUTE);
        const skipDay = skipUnlessAuthThrottleNamed(AUTH_THROTTLE_DAY);
        return {
          throttlers: [
            {
              name: 'default',
              limit: 100,
              ttl: 60_000,
              skipIf: () => disabled,
            },
            {
              name: AUTH_THROTTLE_MINUTE,
              limit: 3,
              ttl: 60_000,
              skipIf: (ctx) => disabled || skipMinute(ctx),
            },
            {
              name: AUTH_THROTTLE_DAY,
              limit: 7,
              ttl: 86_400_000,
              skipIf: (ctx) => disabled || skipDay(ctx),
            },
          ],
          storage: new ThrottlerStorageRedisService(redis),
        };
      },
    }),
    SmsModule,
    PushModule,
    PaymentModule,
    StorageModule,
    OutboxModule,
    NotificationsModule,
    AuditModule,
    AppConfigModule,
    ActionCenterModule,
    AnalyticsModule,
    MediaModule,
    BasicsModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    RolesModule,
    ClubsModule,
    CoachesModule,
    ClubSlotsModule,
    BookingsModule,
    CouponsModule,
    FinanceModule,
    MembershipsModule,
    CoachingModule,
    StaffModule,
    CalendarModule,
    CheckinModule,
    WaitlistModule,
    LifecycleModule,
    ProgressModule,
    NutritionModule,
    OpsModule,
    SocialModule,
    ReferralModule,
    KycModule,
    SupportModule,
    GamificationModule,
    ArticlesModule,
    BannersModule,
    DiscoveryModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: KycGuard },
  ],
})
export class AppModule {}
