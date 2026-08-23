import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../common/jobs/worker-lease.service';
import { LifecycleService } from './lifecycle.service';

/**
 * R6–R7 scheduler: enrolls at-risk members into journeys and advances due
 * reminder steps. Reminders themselves are delivered by the outbox worker.
 */
@Injectable()
export class LifecycleWorker {
  private readonly logger = new Logger(LifecycleWorker.name);
  constructor(
    private readonly lifecycle: LifecycleService,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  @Interval(15 * 60_000)
  async tick() {
    try {
      const run = await this.workerLeases.runExclusive(
        'lifecycle.advance-due',
        async () => ({
          enrolled: await this.lifecycle.enrollAllDue(),
          advanced: await this.lifecycle.advanceDueJourneys(),
        }),
        { leaseMs: 300_000 },
      );
      if (!run.acquired) return;
      const { enrolled, advanced } = run.result;
      if (enrolled.enrolled > 0 || advanced.sent > 0) {
        this.logger.log(
          `Lifecycle tick: enrolled=${enrolled.enrolled} sent=${advanced.sent} completed=${advanced.completed}`,
        );
      }
    } catch (err) {
      this.logger.warn(`Lifecycle worker failed: ${String(err)}`);
    }
  }
}
