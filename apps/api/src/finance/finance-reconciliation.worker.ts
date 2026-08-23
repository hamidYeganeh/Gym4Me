import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { WorkerLeaseService } from '../common/jobs/worker-lease.service';
import { WalletTopUpService } from './application/services/wallet-top-up.service';

@Injectable()
export class FinanceReconciliationWorker {
  private readonly logger = new Logger(FinanceReconciliationWorker.name);

  constructor(
    private readonly walletTopUps: WalletTopUpService,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  @Interval(5 * 60_000)
  async tick() {
    try {
      const run = await this.workerLeases.runExclusive(
        'finance.reconcile-wallet-topups',
        () => this.walletTopUps.reconcilePending(),
        { leaseMs: 240_000 },
      );
      if (!run.acquired) return;
      const result = run.result;
      if (result.scanned > 0 || result.expired > 0) {
        this.logger.log(
          `Wallet top-up reconciliation scanned=${result.scanned} captured=${result.captured} unresolved=${result.unresolved} expired=${result.expired}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Wallet top-up reconciliation failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}
