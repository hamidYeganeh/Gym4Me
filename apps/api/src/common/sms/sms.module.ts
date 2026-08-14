import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KavenegarSmsService, MockSmsService, SmsService } from './sms.service';

@Global()
@Module({
  providers: [
    {
      provide: SmsService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const debugRaw = config.get<string | boolean>('DEBUG_MODE', 'false');
        const debugMode =
          typeof debugRaw === 'boolean'
            ? debugRaw
            : String(debugRaw ?? 'false')
                .trim()
                .toLowerCase() === 'true';
        const provider = (
          config.get<string>('SMS_PROVIDER', 'mock') ?? 'mock'
        ).toLowerCase();

        // Production-like: never mock SMS when DEBUG_MODE is off.
        if (!debugMode || provider === 'kavenegar') {
          return new KavenegarSmsService(config);
        }
        return new MockSmsService();
      },
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
