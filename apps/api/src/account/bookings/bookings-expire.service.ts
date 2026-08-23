import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../../common/jobs/worker-lease.service';
import { BookingsService } from './bookings.service';

/** SYS-D13: expire unpaid AWAITING_PAYMENT bookings on a fixed interval. */
@Injectable()
export class BookingsExpireService {
  private readonly logger = new Logger(BookingsExpireService.name);
  constructor(
    private readonly bookings: BookingsService,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  @Interval(60_000)
  async tick() {
    try {
      const run = await this.workerLeases.runExclusive(
        'bookings.expire-unpaid',
        () => this.bookings.expireUnpaidBookings(),
        { leaseMs: 180_000 },
      );
      if (!run.acquired) return;
      const result = run.result;
      if (result.cancelled > 0) {
        this.logger.log(
          `Expired ${result.cancelled}/${result.scanned} unpaid bookings`,
        );
      }
    } catch (err) {
      this.logger.warn(`expireUnpaidBookings failed: ${String(err)}`);
    }
  }
}
