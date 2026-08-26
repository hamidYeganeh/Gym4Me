import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MockPayment,
  MockPaymentSchema,
} from '../../schemas/mock-payment.schema';
import { MockPaymentController } from './mock-payment.controller';
import { MockPaymentGatewayService } from './mock-payment.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentReturnController } from './payment-return.controller';
import { ZarinpalPaymentGatewayService } from './zarinpal.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MockPayment.name, schema: MockPaymentSchema },
    ]),
  ],
  controllers: [MockPaymentController, PaymentReturnController],
  providers: [
    MockPaymentGatewayService,
    {
      provide: PaymentGatewayService,
      inject: [ConfigService, MockPaymentGatewayService],
      useFactory: (config: ConfigService, mock: MockPaymentGatewayService) => {
        const provider = (
          config.get<string>('PAYMENT_PROVIDER', 'mock') ?? 'mock'
        ).toLowerCase();
        if (provider === 'zarinpal') {
          return new ZarinpalPaymentGatewayService(config);
        }
        const isProduction =
          (config.get<string>('NODE_ENV', 'development') ?? 'development') ===
          'production';
        const allowProductionMock =
          (
            config.get<string>('ALLOW_MOCK_PAYMENT_IN_PRODUCTION', 'false') ??
            'false'
          ).toLowerCase() === 'true';
        if (provider !== 'mock' || (isProduction && !allowProductionMock)) {
          throw new Error(`Unsupported PAYMENT_PROVIDER=${provider}`);
        }
        return mock;
      },
    },
  ],
  exports: [PaymentGatewayService],
})
export class PaymentModule {}
