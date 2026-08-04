import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KavenegarSmsService,
  MockSmsService,
  SmsService,
} from './sms.service';

@Global()
@Module({
  providers: [
    {
      provide: SmsService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = (
          config.get<string>('SMS_PROVIDER', 'mock') ?? 'mock'
        ).toLowerCase();
        if (provider === 'kavenegar') {
          return new KavenegarSmsService(config);
        }
        return new MockSmsService();
      },
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
