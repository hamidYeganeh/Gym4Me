import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import type Redis from 'ioredis';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './account/auth/auth.module';
import { ClubsModule } from './account/clubs/clubs.module';
import { KycModule } from './account/kyc/kyc.module';
import { ProfileModule } from './account/profile/profile.module';
import { ReferralModule } from './account/referral/referral.module';
import { RolesModule } from './account/roles/roles.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { BasicsModule } from './basics/basics.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { REDIS, RedisModule } from './common/redis/redis.module';
import { SmsModule } from './common/sms/sms.module';
import { PaymentModule } from './common/payment/payment.module';
import { MediaModule } from './media/media.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Resolve from this file so turbo/root cwd still loads apps/api/.env
      envFilePath: [join(__dirname, '..', '.env'), '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    RedisModule,
    ThrottlerModule.forRootAsync({
      inject: [REDIS],
      useFactory: (redis: Redis) => ({
        throttlers: [{ limit: 100, ttl: 60_000 }],
        storage: new ThrottlerStorageRedisService(redis),
      }),
    }),
    SmsModule,
    PaymentModule,
    AuditModule,
    AnalyticsModule,
    MediaModule,
    BasicsModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    RolesModule,
    ClubsModule,
    ReferralModule,
    KycModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
