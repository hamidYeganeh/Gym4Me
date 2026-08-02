import { Injectable, Logger } from '@nestjs/common';

export abstract class SmsService {
  abstract sendOtp(phone: string, code: string): Promise<void>;
  abstract sendInvite(
    phone: string,
    inviterName: string,
    referralCode: string,
  ): Promise<void>;
}

@Injectable()
export class MockSmsService extends SmsService {
  private readonly logger = new Logger('MockSms');

  async sendOtp(phone: string, code: string): Promise<void> {
    this.logger.log(`[OTP] to=${phone} code=${code}`);
  }

  async sendInvite(
    phone: string,
    inviterName: string,
    referralCode: string,
  ): Promise<void> {
    this.logger.log(
      `[INVITE] to=${phone} from=${inviterName} code=${referralCode}`,
    );
  }
}
