import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { LifecycleService } from './lifecycle.service';

/**
 * R6–R7 scheduler: enrolls at-risk members into journeys and advances due
 * reminder steps. Reminders themselves are delivered by the outbox worker.
 */
@Injectable()
export class LifecycleWorker {
  private readonly logger = new Logger(LifecycleWorker.name);
  private running = false;

  constructor(private readonly lifecycle: LifecycleService) {}

  @Interval(15 * 60_000)
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const enrolled = await this.lifecycle.enrollAllDue();
      const advanced = await this.lifecycle.advanceDueJourneys();
      if (enrolled.enrolled > 0 || advanced.sent > 0) {
        this.logger.log(
          `Lifecycle tick: enrolled=${enrolled.enrolled} sent=${advanced.sent} completed=${advanced.completed}`,
        );
      }
    } catch (err) {
      this.logger.warn(`Lifecycle worker failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }
}
