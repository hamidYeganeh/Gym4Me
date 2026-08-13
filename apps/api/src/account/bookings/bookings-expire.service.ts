import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';

/** SYS-D13: expire unpaid AWAITING_PAYMENT bookings on a fixed interval. */
@Injectable()
export class BookingsExpireService {
  private readonly logger = new Logger(BookingsExpireService.name);
  private running = false;

  constructor(private readonly bookings: BookingsService) {}

  @Interval(60_000)
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.bookings.expireUnpaidBookings();
      if (result.cancelled > 0) {
        this.logger.log(
          `Expired ${result.cancelled}/${result.scanned} unpaid bookings`,
        );
      }
    } catch (err) {
      this.logger.warn(`expireUnpaidBookings failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }
}
