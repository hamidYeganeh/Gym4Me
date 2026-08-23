import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../common/jobs/worker-lease.service';
import { WaitlistService } from './waitlist.service';

/** Expires waitlist offers past their TTL so seats free up automatically. */
@Injectable()
export class WaitlistWorker {
  private readonly logger = new Logger(WaitlistWorker.name);
  constructor(
    private readonly waitlist: WaitlistService,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  @Interval(60_000)
  async tick() {
    try {
      const run = await this.workerLeases.runExclusive(
        'waitlist.expire-offers',
        () => this.waitlist.expireOffers(),
        { leaseMs: 180_000 },
      );
      if (!run.acquired) return;
      const result = run.result;
      if (result.expired > 0) {
        this.logger.log(`Waitlist offers expired: ${result.expired}`);
      }
    } catch (err) {
      this.logger.warn(`Waitlist worker failed: ${String(err)}`);
    }
  }
}
