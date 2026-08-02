import { Global, Module } from '@nestjs/common';
import { MockSmsService, SmsService } from './sms.service';

@Global()
@Module({
  // Only the mock driver exists for now; swap by SMS_PROVIDER when a real one lands.
  providers: [{ provide: SmsService, useClass: MockSmsService }],
  exports: [SmsService],
})
export class SmsModule {}
