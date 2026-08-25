import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../../common/jobs/worker-lease.service';
import { PlatformSubscriptionCheckoutReconciliationService } from './application/services/platform-subscription-checkout-reconciliation.service';

@Injectable()
export class PlatformSubscriptionCheckoutReconciliationWorker {
  private readonly logger = new Logger(
    PlatformSubscriptionCheckoutReconciliationWorker.name,
  );

  constructor(
    private readonly checkouts: PlatformSubscriptionCheckoutReconciliationService,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  @Interval(5 * 60_000)
  async tick() {
    try {
      const run = await this.workerLeases.runExclusive(
        'memberships.reconcile-platform-subscription-checkouts',
        () => this.checkouts.reconcilePending(),
        { leaseMs: 240_000 },
      );
      if (!run.acquired) return;
      const result = run.result;
      if (result.scanned > 0 || result.expired > 0) {
        this.logger.log(
          `Platform subscription checkout reconciliation scanned=${result.scanned} captured=${result.captured} unresolved=${result.unresolved} expired=${result.expired}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Platform subscription checkout reconciliation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
