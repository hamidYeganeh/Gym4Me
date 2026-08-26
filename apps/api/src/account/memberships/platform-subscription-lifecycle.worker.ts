import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../../common/jobs/worker-lease.service';
import { PlatformSubscriptionLifecycleService } from './application/services/platform-subscription-lifecycle.service';

@Injectable()
export class PlatformSubscriptionLifecycleWorker {
  private readonly logger = new Logger(
    PlatformSubscriptionLifecycleWorker.name,
  );

  constructor(
    private readonly lifecycle: PlatformSubscriptionLifecycleService,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  @Interval(5 * 60_000)
  async tick() {
    try {
      const run = await this.workerLeases.runExclusive(
        'memberships.platform-subscription-lifecycle',
        () => this.lifecycle.reconcile(),
        { leaseMs: 240_000 },
      );
      if (!run.acquired || !run.result.scanned) return;
      this.logger.log(
        `Platform subscription lifecycle scanned=${run.result.scanned} grace=${run.result.grace} fallback=${run.result.fallback} readOnly=${run.result.readOnly}`,
      );
    } catch (error) {
      this.logger.warn(
        `Platform subscription lifecycle failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
