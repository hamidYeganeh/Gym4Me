import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { KycRequest, KycRequestSchema } from '../../schemas/kyc-request.schema';
import { UsersModule } from '../../users/users.module';
import { KycController } from './kyc.controller';
import {
  ApiIrKycProviderService,
  FinnotechKycProviderService,
  KycProviderService,
  MockKycProviderService,
} from './kyc-provider.service';
import { KycService } from './kyc.service';
import { assertProductionProvider } from '../../common/providers/provider-mode';

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
        assertProductionProvider({
          nodeEnv: config.get<string>('NODE_ENV', 'development'),
          provider,
          allowed: ['api_ir', 'api.ir', 'finnotech'],
          configKey: 'KYC_PROVIDER',
        });
        if (provider === 'api_ir' || provider === 'api.ir') {
          return new ApiIrKycProviderService(config);
        }
        if (provider === 'finnotech') {
          return new FinnotechKycProviderService(config);
        }
        if (provider === 'mock') return new MockKycProviderService();
        throw new Error(`Unsupported KYC_PROVIDER=${provider}`);
      },
    },
  ],
  exports: [KycService, MongooseModule],
})
export class KycModule {}
