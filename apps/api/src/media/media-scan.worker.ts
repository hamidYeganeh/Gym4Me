import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../common/jobs/worker-lease.service';
import { MediaService } from './media.service';

@Injectable()
export class MediaScanWorker {
  private readonly logger = new Logger(MediaScanWorker.name);

  constructor(
    private readonly media: MediaService,
    private readonly leases: WorkerLeaseService,
  ) {}

  @Interval(60_000)
  async tick() {
    try {
      const run = await this.leases.runExclusive(
        'media.malware-scan',
        () => this.media.processPendingScans(),
        { leaseMs: 5 * 60_000 },
      );
      if (!run.acquired || !run.result.scanned) return;
      this.logger.log(
        `Media scan batch scanned=${run.result.scanned} clean=${run.result.clean} quarantined=${run.result.quarantined} failed=${run.result.failed}`,
      );
    } catch (error) {
      this.logger.warn(
        `Media scan worker failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
