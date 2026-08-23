import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KavenegarSmsService, MockSmsService, SmsService } from './sms.service';
import { assertProductionProvider } from '../providers/provider-mode';

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
        assertProductionProvider({
          nodeEnv: config.get<string>('NODE_ENV', 'development'),
          provider,
          allowed: ['kavenegar'],
          configKey: 'SMS_PROVIDER',
        });

        if (provider === 'kavenegar') {
          return new KavenegarSmsService(config);
        }
        if (provider === 'mock' && debugMode) return new MockSmsService();
        throw new Error(
          `SMS_PROVIDER=${provider} requires DEBUG_MODE=true outside production`,
        );
      },
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
