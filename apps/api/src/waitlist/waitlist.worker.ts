import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WaitlistService } from './waitlist.service';

/** Expires waitlist offers past their TTL so seats free up automatically. */
@Injectable()
export class WaitlistWorker {
  private readonly logger = new Logger(WaitlistWorker.name);
  private running = false;

  constructor(private readonly waitlist: WaitlistService) {}

  @Interval(60_000)
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.waitlist.expireOffers();
      if (result.expired > 0) {
        this.logger.log(`Waitlist offers expired: ${result.expired}`);
      }
    } catch (err) {
      this.logger.warn(`Waitlist worker failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }
}
