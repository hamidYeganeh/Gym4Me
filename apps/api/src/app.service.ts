import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly config: ConfigService,
  ) {}

  getHello(): string {
    return 'Gym4Me API';
  }

  getReadiness() {
    const database = this.connection.readyState === 1;
    const providers = {
      sms: this.config.get<string>('SMS_PROVIDER', 'mock'),
      payment: this.config.get<string>('PAYMENT_PROVIDER', 'mock'),
      push: this.config.get<string>('PUSH_PROVIDER', 'mock'),
    };
    const production =
      this.config.get<string>('NODE_ENV', 'development') === 'production';
    const providersReady =
      !production ||
      (providers.sms === 'kavenegar' &&
        providers.payment === 'zarinpal' &&
        providers.push === 'fcm');
    return {
      ready: database && providersReady,
      database,
      providers,
      checkedAt: new Date().toISOString(),
    };
  }
}
