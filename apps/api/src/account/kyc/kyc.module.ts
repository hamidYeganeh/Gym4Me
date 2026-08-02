import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KycRequest,
  KycRequestSchema,
} from '../../schemas/kyc-request.schema';
import { UsersModule } from '../../users/users.module';
import { KycController } from './kyc.controller';
import {
  KycProviderService,
  MockKycProviderService,
} from './kyc-provider.service';
import { KycService } from './kyc.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KycRequest.name, schema: KycRequestSchema },
    ]),
    UsersModule,
  ],
  controllers: [KycController],
  providers: [
    KycService,
    // Only the mock driver exists for now; swap by KYC_PROVIDER when real ones land.
    { provide: KycProviderService, useClass: MockKycProviderService },
  ],
  exports: [KycService, MongooseModule],
})
export class KycModule {}
