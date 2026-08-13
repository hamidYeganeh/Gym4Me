import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FcmPushService } from './fcm-push.service';
import { MockPushService, PushService } from './push.service';

@Global()
@Module({
  providers: [
    {
      provide: PushService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('PushModule');
        const provider = (
          config.get<string>('PUSH_PROVIDER', 'mock') ?? 'mock'
        ).toLowerCase();
        const isProduction =
          (config.get<string>('NODE_ENV', 'development') ?? 'development') ===
          'production';

        if (provider === 'fcm') {
          const serviceAccount = config.get<string>('FCM_SERVICE_ACCOUNT');
          if (!serviceAccount) {
            if (isProduction) {
              throw new Error(
                'PUSH_PROVIDER=fcm requires FCM_SERVICE_ACCOUNT in production',
              );
            }
            logger.warn(
              'PUSH_PROVIDER=fcm but FCM_SERVICE_ACCOUNT is missing; using mock',
            );
            return new MockPushService();
          }
          try {
            const service = new FcmPushService(serviceAccount);
            logger.log('Push provider: FCM (HTTP v1)');
            return service;
          } catch (error) {
            if (isProduction) throw error;
            logger.error(
              `Invalid FCM_SERVICE_ACCOUNT (${error instanceof Error ? error.message : error}); using mock`,
            );
            return new MockPushService();
          }
        }

        if (provider !== 'mock') {
          if (isProduction) {
            throw new Error(`Unsupported PUSH_PROVIDER=${provider}`);
          }
          logger.warn(`Unknown PUSH_PROVIDER=${provider}; using mock`);
        }
        return new MockPushService();
      },
    },
  ],
  exports: [PushService],
})
export class PushModule {}
