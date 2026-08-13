import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { OutboxService } from './outbox.service';

@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);
  private running = false;

  constructor(private readonly outbox: OutboxService) {}

  @Interval(15_000)
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.outbox.publishPending();
      if (result.published > 0) {
        this.logger.debug(
          `Outbox published ${result.published}/${result.scanned}`,
        );
      }
    } catch (err) {
      this.logger.warn(`Outbox worker failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }
}
