import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGatewayService } from './payment-gateway.service';
import {
  MockPaymentGatewayService,
  ZarinpalPaymentGatewayService,
} from './zarinpal.service';

@Global()
@Module({
  providers: [
    {
      provide: PaymentGatewayService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = (
          config.get<string>('PAYMENT_PROVIDER', 'mock') ?? 'mock'
        ).toLowerCase();
        if (provider === 'zarinpal') {
          return new ZarinpalPaymentGatewayService(config);
        }
        return new MockPaymentGatewayService();
      },
    },
  ],
  exports: [PaymentGatewayService],
})
export class PaymentModule {}
