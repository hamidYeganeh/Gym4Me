import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KycRequest,
  KycRequestSchema,
} from '../../schemas/kyc-request.schema';
import { UsersModule } from '../../users/users.module';
import { KycController } from './kyc.controller';
import {
  FinnotechKycProviderService,
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
    {
      provide: KycProviderService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = (
          config.get<string>('KYC_PROVIDER', 'mock') ?? 'mock'
        ).toLowerCase();
        if (provider === 'finnotech') {
          return new FinnotechKycProviderService(config);
        }
        return new MockKycProviderService();
      },
    },
  ],
  exports: [KycService, MongooseModule],
})
export class KycModule {}
