import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatureFlag, FeatureFlagSchema } from '../schemas/feature-flag.schema';
import {
  MobileReleasePolicy,
  MobileReleasePolicySchema,
} from '../schemas/mobile-release-policy.schema';
import {
  AdminAppConfigController,
  PublicAppConfigController,
} from './app-config.controller';
import { AppConfigService } from './app-config.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeatureFlag.name, schema: FeatureFlagSchema },
      { name: MobileReleasePolicy.name, schema: MobileReleasePolicySchema },
    ]),
  ],
  controllers: [PublicAppConfigController, AdminAppConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
