import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { HttpExceptionFilter } from "./common/http-exception.filter.js";
import { validateEnv } from "./config/app.config.js";
import { DatabaseModule } from "./database/database.module.js";
import { AccountModule } from "./modules/account/account.module.js";
import { AdvertisingModule } from "./modules/advertising/advertising.module.js";
import { AuditModule } from "./modules/audit/audit.module.js";
import { CoachModule } from "./modules/coach/coach.module.js";
import { CommerceModule } from "./modules/commerce/commerce.module.js";
import { FinanceModule } from "./modules/finance/finance.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { MembershipModule } from "./modules/membership/membership.module.js";
import { MetaModule } from "./modules/meta/meta.module.js";
import { NotificationModule } from "./modules/notification/notification.module.js";
import { OrganizationModule } from "./modules/organization/organization.module.js";
import { ReviewModule } from "./modules/review/review.module.js";
import { SupplyModule } from "./modules/supply/supply.module.js";
import { UploadModule } from "./modules/upload/upload.module.js";
import { VerificationModule } from "./modules/verification/verification.module.js";
import { SecurityModule } from "./security/security.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { ttl: 60_000, limit: config.getOrThrow<number>("RATE_LIMIT_PER_MINUTE") },
      ],
    }),
    DatabaseModule,
    SecurityModule,
    AuditModule,
    HealthModule,
    AccountModule,
    MetaModule,
    OrganizationModule,
    SupplyModule,
    CommerceModule,
    CoachModule,
    MembershipModule,
    FinanceModule,
    AdvertisingModule,
    ReviewModule,
    VerificationModule,
    NotificationModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
