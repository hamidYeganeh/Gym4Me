import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { Model, Types } from 'mongoose';
import {
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../../../common/enums';
import { PaymentGatewayService } from '../../../common/payment/payment-gateway.service';
import { assertAllowedPaymentCallbackUrl } from '../../../common/payment/payment-callback-url.policy';
import { Payment, type PaymentDocument } from '../../../schemas/payment.schema';
import type {
  TopUpWalletDto,
  VerifyWalletTopUpDto,
} from '../../dto/finance.dto';
import { FinanceService } from '../../finance.service';

@Injectable()
export class WalletTopUpService {
  private readonly initiationLeaseMs = 60_000;
  private readonly reconciliationDelayMs = 2 * 60_000;
  private readonly reconciliationIntervalMs = 10 * 60_000;
  private readonly pendingTtlMs = 24 * 60 * 60_000;

  constructor(
    @InjectModel(Payment.name)
    private readonly payments: Model<PaymentDocument>,
    private readonly gateway: PaymentGatewayService,
    private readonly finance: FinanceService,
  ) {}

  async initiate(userId: string, dto: TopUpWalletDto) {
    const orderId = `wallet-topup:${userId}:${dto.idempotencyKey}`;
    const recorded = await this.finance.recordPayment({
      purpose: PaymentPurpose.WALLET_TOPUP,
      channel: PaymentChannel.ZARINPAL,
      status: PaymentStatus.PENDING,
      amount: {
        gross: dto.amount,
        discount: 0,
        tax: 0,
        providerShare: 0,
        platformFee: 0,
        gatewayFee: 0,
        net: dto.amount,
      },
      reference: { orderId },
      payer: { userId },
      related: {},
      idempotencyKey: dto.idempotencyKey,
    });

    let payment = await this.payments.findById(recorded.payment._id);
    if (!payment) throw new NotFoundException('Wallet top-up not found');
    if (
      payment.status === PaymentStatus.CAPTURED ||
      payment.reference.authority
    ) {
      return this.toInitiation(payment, recorded.idempotent);
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException('Wallet top-up is not payable');
    }

    const claimId = randomUUID();
    const now = new Date();
    const claimed = await this.payments.findOneAndUpdate(
      {
        _id: payment._id,
        status: PaymentStatus.PENDING,
        'reference.authority': { $exists: false },
        $or: [
          { gatewayInitiationClaimedAt: { $exists: false } },
          {
            gatewayInitiationClaimedAt: {
              $lte: new Date(now.getTime() - this.initiationLeaseMs),
            },
          },
        ],
      },
      {
        $set: {
          gatewayInitiationClaimId: claimId,
          gatewayInitiationClaimedAt: now,
        },
      },
      { new: true },
    );
    if (!claimed) {
      payment = await this.payments.findById(payment._id);
      if (payment?.reference.authority) {
        return this.toInitiation(payment, true);
      }
      throw new ConflictException('Wallet top-up initiation is in progress');
    }

    try {
      const gateway = await this.gateway.createPayment({
        amount: dto.amount * 10,
        description: 'Gym4Me wallet top-up',
        callbackUrl: assertAllowedPaymentCallbackUrl(dto.callbackUrl),
        orderId,
      });
      const initiatedAt = new Date();
      const initiated = await this.payments.findOneAndUpdate(
        {
          _id: claimed._id,
          status: PaymentStatus.PENDING,
          gatewayInitiationClaimId: claimId,
        },
        {
          $set: {
            'reference.authority': gateway.authority,
            'reference.redirectUrl': gateway.redirectUrl,
            'reference.initiatedAt': initiatedAt,
          },
          $unset: {
            gatewayInitiationClaimId: 1,
            gatewayInitiationClaimedAt: 1,
          },
        },
        { new: true },
      );
      if (!initiated) {
        throw new ConflictException('Wallet top-up initiation lease was lost');
      }
      return this.toInitiation(initiated, recorded.idempotent);
    } catch (error) {
      await this.payments.updateOne(
        { _id: claimed._id, gatewayInitiationClaimId: claimId },
        {
          $unset: {
            gatewayInitiationClaimId: 1,
            gatewayInitiationClaimedAt: 1,
          },
        },
      );
      throw error;
    }
  }

  async verify(userId: string, dto: VerifyWalletTopUpDto, request?: Request) {
    const payment = await this.findByAuthority(userId, dto.authority);
    if (payment.status === PaymentStatus.CAPTURED) {
      return payment.toObject();
    }
    if (dto.status === 'NOK') {
      return this.finance.cancelPendingWalletTopUp(userId, dto.authority);
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException('Wallet top-up is not payable');
    }

    const verification = await this.gateway.verifyPayment({
      authority: dto.authority,
      amount: payment.amount.gross * 10,
    });
    if (!verification.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verification.message}`,
      );
    }
    const captured = await this.finance.capturePendingWalletTopUp(
      userId,
      dto.authority,
      verification.refId,
      request,
    );
    return captured.payment;
  }

  /** Recover captured gateway payments whose browser callback never arrived. */
  async reconcilePending(limit = 50) {
    const now = new Date();
    const expiredBefore = new Date(now.getTime() - this.pendingTtlMs);
    const expired = await this.payments.updateMany(
      {
        purpose: PaymentPurpose.WALLET_TOPUP,
        channel: PaymentChannel.ZARINPAL,
        status: PaymentStatus.PENDING,
        createdAt: { $lte: expiredBefore },
      },
      {
        $set: { status: PaymentStatus.CANCELLED, cancelledAt: now },
        $unset: {
          gatewayInitiationClaimId: 1,
          gatewayInitiationClaimedAt: 1,
        },
      },
    );

    const candidates = await this.payments
      .find({
        purpose: PaymentPurpose.WALLET_TOPUP,
        channel: PaymentChannel.ZARINPAL,
        status: PaymentStatus.PENDING,
        'reference.authority': { $exists: true },
        'reference.initiatedAt': {
          $lte: new Date(now.getTime() - this.reconciliationDelayMs),
        },
        $or: [
          { lastReconciliationAt: { $exists: false } },
          {
            lastReconciliationAt: {
              $lte: new Date(now.getTime() - this.reconciliationIntervalMs),
            },
          },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(Math.max(1, Math.min(limit, 200)));

    let captured = 0;
    let unresolved = 0;
    for (const payment of candidates) {
      const authority = payment.reference.authority;
      const userId = payment.payer.userId?.toString();
      if (!authority || !userId) continue;
      await this.payments.updateOne(
        { _id: payment._id, status: PaymentStatus.PENDING },
        {
          $set: { lastReconciliationAt: now },
          $inc: { reconciliationAttempts: 1 },
        },
      );
      try {
        const verification = await this.gateway.verifyPayment({
          authority,
          amount: payment.amount.gross * 10,
        });
        if (!verification.ok) {
          unresolved += 1;
          await this.payments.updateOne(
            { _id: payment._id, status: PaymentStatus.PENDING },
            {
              $set: {
                lastReconciliationError: String(
                  verification.message || verification.code,
                ).slice(0, 1000),
              },
            },
          );
          continue;
        }
        await this.finance.capturePendingWalletTopUp(
          userId,
          authority,
          verification.refId,
        );
        captured += 1;
        await this.payments.updateOne(
          { _id: payment._id },
          { $unset: { lastReconciliationError: 1 } },
        );
      } catch (error) {
        unresolved += 1;
        const message =
          error instanceof Error ? error.message : 'Reconciliation failed';
        await this.payments.updateOne(
          { _id: payment._id, status: PaymentStatus.PENDING },
          { $set: { lastReconciliationError: message.slice(0, 1000) } },
        );
      }
    }
    return {
      scanned: candidates.length,
      captured,
      unresolved,
      expired: expired.modifiedCount,
    };
  }

  private async findByAuthority(userId: string, authority: string) {
    const payment = await this.payments.findOne({
      purpose: PaymentPurpose.WALLET_TOPUP,
      channel: PaymentChannel.ZARINPAL,
      'payer.userId': new Types.ObjectId(userId),
      'reference.authority': authority,
    });
    if (!payment) throw new NotFoundException('Wallet top-up not found');
    return payment;
  }

  private toInitiation(payment: PaymentDocument, idempotent: boolean) {
    return {
      paymentId: payment._id.toString(),
      status: payment.status,
      authority: payment.reference.authority ?? null,
      redirectUrl: payment.reference.redirectUrl ?? null,
      idempotent,
    };
  }
}
