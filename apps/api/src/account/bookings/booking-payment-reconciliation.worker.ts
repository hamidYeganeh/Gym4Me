import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingStatus } from '../../common/enums';
import { WorkerLeaseService } from '../../common/jobs/worker-lease.service';
import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { VerifyBookingPaymentCommand } from './application/commands/verify-booking-payment.command';

@Injectable()
export class BookingPaymentReconciliationWorker {
  private readonly logger = new Logger(BookingPaymentReconciliationWorker.name);

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly verifyPayment: VerifyBookingPaymentCommand,
    private readonly workerLeases: WorkerLeaseService,
  ) {}

  @Interval(5 * 60_000)
  async tick() {
    try {
      const run = await this.workerLeases.runExclusive(
        'bookings.reconcile-payments',
        () => this.reconcilePending(),
        { leaseMs: 240_000 },
      );
      if (!run.acquired) return;
      if (run.result.scanned > 0) {
        this.logger.log(
          `Booking payment reconciliation scanned=${run.result.scanned} captured=${run.result.captured} unresolved=${run.result.unresolved}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Booking payment reconciliation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async reconcilePending(limit = 100) {
    const now = new Date();
    const candidates = await this.bookingModel
      .find({
        status: BookingStatus.AWAITING_PAYMENT,
        'payment.authority': { $exists: true },
        'payment.initiatedAt': { $lte: new Date(now.getTime() - 2 * 60_000) },
        $or: [
          { 'payment.lastReconciliationAt': { $exists: false } },
          {
            'payment.lastReconciliationAt': {
              $lte: new Date(now.getTime() - 10 * 60_000),
            },
          },
        ],
      })
      .sort({ 'payment.initiatedAt': 1 })
      .limit(limit);
    let captured = 0;
    let unresolved = 0;
    for (const booking of candidates) {
      const authority = booking.payment?.authority;
      if (!authority) continue;
      try {
        await this.verifyPayment.execute(
          booking.athleteId.toString(),
          booking,
          {
            authority,
            status: 'OK',
          },
        );
        captured += 1;
      } catch (error) {
        unresolved += 1;
        await this.bookingModel.updateOne(
          { _id: booking._id, status: BookingStatus.AWAITING_PAYMENT },
          {
            $inc: { 'payment.reconciliationAttempts': 1 },
            $set: {
              'payment.lastReconciliationAt': now,
              'payment.lastReconciliationError':
                error instanceof Error ? error.message : String(error),
            },
          },
        );
      }
    }
    return { scanned: candidates.length, captured, unresolved };
  }
}
