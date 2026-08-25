import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentStatus } from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import {
  Payment,
  type PaymentDocument,
} from '../../../../schemas/payment.schema';
import {
  PlatformSubscriptionCheckout,
  PlatformSubscriptionCheckoutStatus,
  type PlatformSubscriptionCheckoutDocument,
} from '../../../../schemas/platform-subscription-checkout.schema';
import { PlatformSubscriptionCheckoutService } from './platform-subscription-checkout.service';

@Injectable()
export class PlatformSubscriptionCheckoutReconciliationService {
  constructor(
    @InjectModel(PlatformSubscriptionCheckout.name)
    private readonly checkouts: Model<PlatformSubscriptionCheckoutDocument>,
    @InjectModel(Payment.name)
    private readonly payments: Model<PaymentDocument>,
    private readonly transactions: MongoTransactionService,
    private readonly fulfillment: PlatformSubscriptionCheckoutService,
  ) {}

  async reconcilePending(limit = 100) {
    const now = new Date();
    const candidates = await this.checkouts
      .find({
        status: PlatformSubscriptionCheckoutStatus.PENDING,
        authority: { $exists: true },
        updatedAt: { $lte: new Date(now.getTime() - 2 * 60_000) },
        $or: [
          { lastReconciliationAt: { $exists: false } },
          {
            lastReconciliationAt: {
              $lte: new Date(now.getTime() - 10 * 60_000),
            },
          },
        ],
      })
      .sort({ updatedAt: 1 })
      .limit(limit);
    let captured = 0;
    let unresolved = 0;
    for (const checkout of candidates) {
      if (!checkout.authority) continue;
      try {
        await this.fulfillment.verify(
          checkout.userId.toString(),
          checkout._id.toString(),
          { authority: checkout.authority, status: 'OK' },
        );
        captured += 1;
      } catch (error) {
        unresolved += 1;
        await this.checkouts.updateOne(
          {
            _id: checkout._id,
            status: PlatformSubscriptionCheckoutStatus.PENDING,
          },
          {
            $inc: { reconciliationAttempts: 1 },
            $set: {
              lastReconciliationAt: now,
              lastReconciliationError:
                error instanceof Error ? error.message : String(error),
            },
          },
        );
      }
    }

    const expired = await this.checkouts
      .find({
        status: PlatformSubscriptionCheckoutStatus.PENDING,
        expiresAt: { $lte: now },
        authority: { $exists: false },
      })
      .limit(Math.max(0, limit - candidates.length));
    for (const checkout of expired) {
      await this.transactions.run(async (session) => {
        const current = await this.checkouts
          .findOne({
            _id: checkout._id,
            status: PlatformSubscriptionCheckoutStatus.PENDING,
            expiresAt: { $lte: now },
            authority: { $exists: false },
          })
          .session(session);
        if (!current) return;
        current.status = PlatformSubscriptionCheckoutStatus.EXPIRED;
        await current.save({ session });
        await this.payments.updateOne(
          { _id: current.paymentId, status: PaymentStatus.PENDING },
          { $set: { status: PaymentStatus.CANCELLED, cancelledAt: now } },
          { session },
        );
      });
    }
    return {
      scanned: candidates.length,
      captured,
      unresolved,
      expired: expired.length,
    };
  }
}
