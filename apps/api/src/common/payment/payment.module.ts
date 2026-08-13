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
import { ZarinpalPaymentGatewayService } from './zarinpal.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MockPayment.name, schema: MockPaymentSchema },
    ]),
  ],
  controllers: [MockPaymentController],
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
        if (provider !== 'mock' || isProduction) {
          throw new Error(`Unsupported PAYMENT_PROVIDER=${provider}`);
        }
        return mock;
      },
    },
  ],
  exports: [PaymentGatewayService],
})
export class PaymentModule {}
