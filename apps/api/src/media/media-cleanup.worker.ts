import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../common/jobs/worker-lease.service';
import { MediaService } from './media.service';

@Injectable()
export class MediaCleanupWorker {
  private readonly logger = new Logger(MediaCleanupWorker.name);

  constructor(
    private readonly media: MediaService,
    private readonly leases: WorkerLeaseService,
  ) {}

  @Interval(15 * 60_000)
  async tick() {
    try {
      const run = await this.leases.runExclusive(
        'media.managed-orphan-cleanup',
        () => this.media.cleanupManagedMediaOrphans(),
        { leaseMs: 10 * 60_000 },
      );
      if (!run.acquired || !run.result.scanned) return;
      this.logger.log(
        `Managed media cleanup scanned=${run.result.scanned} deleted=${run.result.deleted} failed=${run.result.failed}`,
      );
    } catch (error) {
      this.logger.warn(
        `Managed media cleanup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
