jest.mock('../../account/bookings/bookings.service', () => ({
  BookingsService: class {},
}));

import type { WorkerLeaseService } from './worker-lease.service';
import { BookingsExpireService } from '../../account/bookings/bookings-expire.service';
import { WaitlistWorker } from '../../waitlist/waitlist.worker';
import { LifecycleWorker } from '../../lifecycle/lifecycle.worker';
import { FinanceReconciliationWorker } from '../../finance/finance-reconciliation.worker';
import { BookingPaymentReconciliationWorker } from '../../account/bookings/booking-payment-reconciliation.worker';

class SharedTestLease {
  private held = new Set<string>();

  async runExclusive<T>(key: string, work: () => Promise<T>) {
    if (this.held.has(key)) return { acquired: false as const };
    this.held.add(key);
    try {
      return { acquired: true as const, result: await work() };
    } finally {
      this.held.delete(key);
    }
  }
}

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

describe('periodic worker multi-instance leases', () => {
  it('runs booking expiry once across two instances', async () => {
    const gate = deferred();
    const bookings = {
      expireUnpaidBookings: jest.fn(async () => {
        await gate.promise;
        return { scanned: 1, cancelled: 1 };
      }),
    };
    const leases = new SharedTestLease() as unknown as WorkerLeaseService;
    const first = new BookingsExpireService(bookings as never, leases);
    const second = new BookingsExpireService(bookings as never, leases);

    const firstTick = first.tick();
    await Promise.resolve();
    const secondTick = second.tick();
    gate.release();
    await Promise.all([firstTick, secondTick]);

    expect(bookings.expireUnpaidBookings).toHaveBeenCalledTimes(1);
  });

  it('runs waitlist expiry once across two instances', async () => {
    const gate = deferred();
    const waitlist = {
      expireOffers: jest.fn(async () => {
        await gate.promise;
        return { expired: 1 };
      }),
    };
    const leases = new SharedTestLease() as unknown as WorkerLeaseService;
    const first = new WaitlistWorker(waitlist as never, leases);
    const second = new WaitlistWorker(waitlist as never, leases);

    const firstTick = first.tick();
    await Promise.resolve();
    const secondTick = second.tick();
    gate.release();
    await Promise.all([firstTick, secondTick]);

    expect(waitlist.expireOffers).toHaveBeenCalledTimes(1);
  });

  it('advances lifecycle journeys once across two instances', async () => {
    const gate = deferred();
    const lifecycle = {
      enrollAllDue: jest.fn(async () => {
        await gate.promise;
        return { enrolled: 1 };
      }),
      advanceDueJourneys: jest
        .fn()
        .mockResolvedValue({ sent: 1, completed: 0 }),
    };
    const leases = new SharedTestLease() as unknown as WorkerLeaseService;
    const first = new LifecycleWorker(lifecycle as never, leases);
    const second = new LifecycleWorker(lifecycle as never, leases);

    const firstTick = first.tick();
    await Promise.resolve();
    const secondTick = second.tick();
    gate.release();
    await Promise.all([firstTick, secondTick]);

    expect(lifecycle.enrollAllDue).toHaveBeenCalledTimes(1);
    expect(lifecycle.advanceDueJourneys).toHaveBeenCalledTimes(1);
  });

  it('reconciles wallet top-ups once across two instances', async () => {
    const gate = deferred();
    const walletTopUps = {
      reconcilePending: jest.fn(async () => {
        await gate.promise;
        return { scanned: 1, captured: 1, unresolved: 0, expired: 0 };
      }),
    };
    const leases = new SharedTestLease() as unknown as WorkerLeaseService;
    const first = new FinanceReconciliationWorker(
      walletTopUps as never,
      leases,
    );
    const second = new FinanceReconciliationWorker(
      walletTopUps as never,
      leases,
    );

    const firstTick = first.tick();
    await Promise.resolve();
    const secondTick = second.tick();
    gate.release();
    await Promise.all([firstTick, secondTick]);

    expect(walletTopUps.reconcilePending).toHaveBeenCalledTimes(1);
  });

  it('reconciles booking payments once across two instances', async () => {
    const gate = deferred();
    const reconcile = jest.fn(async () => {
      await gate.promise;
      return { scanned: 1, captured: 1, unresolved: 0 };
    });
    const leases = new SharedTestLease() as unknown as WorkerLeaseService;
    const first = new BookingPaymentReconciliationWorker(
      {} as never,
      {} as never,
      leases,
    );
    const second = new BookingPaymentReconciliationWorker(
      {} as never,
      {} as never,
      leases,
    );
    first.reconcilePending = reconcile;
    second.reconcilePending = reconcile;

    const firstTick = first.tick();
    await Promise.resolve();
    const secondTick = second.tick();
    gate.release();
    await Promise.all([firstTick, secondTick]);

    expect(reconcile).toHaveBeenCalledTimes(1);
  });
});
