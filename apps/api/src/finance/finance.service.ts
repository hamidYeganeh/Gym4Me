import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { ClientSession, QueryFilter } from 'mongoose';
import { ReferralService } from '../account/referral/referral.service';
import {
  AuditAction,
  CashShiftStatus,
  DebtStatus,
  EntityStatus,
  InstallmentStatus,
  InvoiceStatus,
  LedgerAccount,
  LedgerEntryKind,
  AnalyticsPeriod,
  PaymentChannel,
  PaymentPurpose,
  PaymentRefundMethod,
  PaymentStatus,
  PayoutDisputeStatus,
  PayoutRecipientType,
  PayoutStatus,
  WalletOwnerType,
  CompensationBasis,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../common/utils/list-query.util';
import { MongoTransactionService } from '../common/mongo/mongo-transaction.service';
import { AuditService } from '../audit/audit.service';
import { User, UserDocument } from '../schemas/user.schema';
import {
  CashShift,
  CashShiftDocument,
  CashShiftTotals,
} from '../schemas/cash-shift.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import { MembershipAnalyticsQuery } from '../account/memberships/application/queries/membership-analytics.query';
import {
  CompensationRule,
  CompensationRuleDocument,
} from '../schemas/compensation-rule.schema';
import {
  Debt,
  DebtDocument,
  Installment,
  InstallmentDocument,
} from '../schemas/debt.schema';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import {
  LedgerEntry,
  LedgerEntryDocument,
  LedgerLine,
} from '../schemas/ledger-entry.schema';
import {
  Payment,
  PaymentAmountSplit,
  PaymentDocument,
  PaymentRelated,
  PaymentTender,
} from '../schemas/payment.schema';
import { Payout, PayoutDocument } from '../schemas/payout.schema';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';
import {
  AnalyticsPeriodQueryDto,
  CloseCashShiftDto,
  CreateDebtDto,
  CreatePayoutDto,
  IssueInvoiceFromPaymentDto,
  ListCompensationRulesQueryDto,
  ListDebtsQueryDto,
  ListInvoicesQueryDto,
  ListLedgerQueryDto,
  ListPaymentsQueryDto,
  ListWalletsQueryDto,
  ListPayoutsQueryDto,
  RecordDebtPaymentDto,
  RecordManualPaymentDto,
  RecordPaymentDto,
  UpsertCompensationRuleDto,
} from './dto/finance.dto';
import { assertPaymentIdempotencyMatch } from './payment-idempotency.policy';
import { FinanceReadQuery } from './application/queries/finance-read.query';
import { buildWalletRefundLines } from './refund-ledger.policy';

export type WalletOwnerRef = {
  type: WalletOwnerType;
  id: string | Types.ObjectId;
};

const MANUAL_CHANNELS = new Set<PaymentChannel>([
  PaymentChannel.CASH,
  PaymentChannel.POS,
  PaymentChannel.CARD_TO_CARD,
  PaymentChannel.MIXED,
]);

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(LedgerEntry.name)
    private readonly ledgerModel: Model<LedgerEntryDocument>,
    @InjectModel(Debt.name)
    private readonly debtModel: Model<DebtDocument>,
    @InjectModel(Installment.name)
    private readonly installmentModel: Model<InstallmentDocument>,
    @InjectModel(CashShift.name)
    private readonly cashShiftModel: Model<CashShiftDocument>,
    @InjectModel(Payout.name)
    private readonly payoutModel: Model<PayoutDocument>,
    @InjectModel(CompensationRule.name)
    private readonly compensationModel: Model<CompensationRuleDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly audit: AuditService,
    @Inject(forwardRef(() => ReferralService))
    private readonly referral: ReferralService,
    private readonly transactions: MongoTransactionService,
    private readonly financeReadQuery: FinanceReadQuery,
    private readonly membershipAnalytics: MembershipAnalyticsQuery,
  ) {}

  // ── Club scope ──────────────────────────────────────────────────────────

  async requireOwnedClub(ownerId: string, clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(new Types.ObjectId(clubId));
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  // ── Wallet ──────────────────────────────────────────────────────────────

  async getOrCreateWallet(owner: WalletOwnerRef, session?: ClientSession) {
    const ownerId = this.toObjectId(owner.id, 'owner.id');
    const wallet = await this.walletModel
      .findOneAndUpdate(
        { 'owner.type': owner.type, 'owner.id': ownerId },
        {
          $setOnInsert: {
            owner: { type: owner.type, id: ownerId },
            balance: 0,
            currency: 'IRT',
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, session },
      )
      .lean();
    if (!wallet) throw new Error('Wallet upsert did not return a document');
    return wallet;
  }

  /** Rebuild the mutable wallet cache from immutable wallet-liability lines. */
  async rebuildWalletFromLedger(
    owner: WalletOwnerRef,
    actorId: string,
    request?: Request,
  ) {
    const ownerId = this.toObjectId(owner.id, 'owner.id');
    const result = await this.transactions.run(async (session) => {
      const [totals] = await this.ledgerModel
        .aggregate<{ credits: number; debits: number }>([
          { $unwind: '$lines' },
          {
            $match: {
              'lines.account': LedgerAccount.WALLET_LIABILITY,
              'lines.party.type': owner.type,
              'lines.party.id': ownerId,
            },
          },
          {
            $group: {
              _id: null,
              credits: { $sum: '$lines.credit' },
              debits: { $sum: '$lines.debit' },
            },
          },
        ])
        .session(session);
      const calculatedBalance = (totals?.credits ?? 0) - (totals?.debits ?? 0);
      if (calculatedBalance < 0) {
        throw new ConflictException(
          'Ledger-derived wallet balance is negative; manual review required',
        );
      }
      const wallet = await this.getOrCreateWallet(
        { type: owner.type, id: ownerId },
        session,
      );
      const previousBalance = wallet.balance;
      await this.walletModel.updateOne(
        { _id: wallet._id },
        { $set: { balance: calculatedBalance } },
        { session },
      );
      return {
        owner: { type: owner.type, id: ownerId.toString() },
        previousBalance,
        balance: calculatedBalance,
        corrected: previousBalance !== calculatedBalance,
      };
    });
    this.audit.log({
      action: AuditAction.FINANCE_WALLET_REBUILT,
      actorId,
      targetUserId:
        owner.type === WalletOwnerType.USER ? ownerId.toString() : undefined,
      metadata: result,
      request,
    });
    return result;
  }

  async getWalletBalance(owner: WalletOwnerRef) {
    const wallet = await this.getOrCreateWallet(owner);
    return {
      owner: {
        type: wallet.owner.type,
        id: wallet.owner.id.toString(),
      },
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async listWallets(query: ListWalletsQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<WalletDocument> = {};
    if (query.type) filter['owner.type'] = query.type;
    if (query.ownerId) filter['owner.id'] = new Types.ObjectId(query.ownerId);

    const [wallets, total] = await Promise.all([
      this.walletModel
        .find(filter)
        .sort({ updatedAt: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.walletModel.countDocuments(filter),
    ]);
    return paginatedResult(
      wallets.map((wallet) => ({
        id: wallet._id.toString(),
        owner: {
          type: wallet.owner.type,
          id: wallet.owner.id.toString(),
        },
        balance: wallet.balance,
        currency: wallet.currency,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      })),
      total,
      page,
      pageSize,
    );
  }

  // ── Payments ────────────────────────────────────────────────────────────

  /** Server-only promotional credit; never exposed as a self-service API. */
  async grantWalletCredit(
    userId: string,
    amount: number,
    idempotencyKey: string,
    orderId: string,
  ) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('Wallet credit must be a positive integer');
    }
    const ownerId = this.toObjectId(userId, 'userId');
    return this.transactions.run(async (session) => {
      const existing = await this.paymentModel
        .findOne({ idempotencyKey })
        .session(session);
      if (existing) {
        if (
          existing.payer.userId?.toString() !== userId ||
          existing.amount.gross !== amount ||
          existing.reference.orderId !== orderId
        ) {
          throw new ConflictException(
            'Wallet credit idempotency key has different semantics',
          );
        }
        const ledger = await this.ledgerModel
          .findOne({ paymentId: existing._id })
          .session(session)
          .lean();
        return {
          payment: existing.toObject(),
          ledger,
          idempotent: true as const,
        };
      }
      const now = new Date();
      const split = this.normalizeSplit({ gross: amount, net: amount });
      const payment = new this.paymentModel({
        purpose: PaymentPurpose.WALLET_TOPUP,
        channel: PaymentChannel.WALLET,
        status: PaymentStatus.CAPTURED,
        amount: split,
        reference: { orderId },
        payer: { userId: ownerId },
        related: {},
        idempotencyKey,
        capturedAt: now,
      });
      await payment.save({ session });
      const ledger = new this.ledgerModel({
        kind: LedgerEntryKind.ADJUSTMENT,
        paymentId: payment._id,
        lines: [
          {
            account: LedgerAccount.DISCOUNT_EXPENSE,
            debit: amount,
            credit: 0,
          },
          {
            account: LedgerAccount.WALLET_LIABILITY,
            debit: 0,
            credit: amount,
            party: { type: WalletOwnerType.USER, id: ownerId },
          },
        ],
        split,
        related: {},
        dedupeKey: `payment:${idempotencyKey}`,
        occurredAt: now,
        note: 'Server-issued promotional wallet credit',
      });
      await ledger.save({ session });
      const wallet = await this.getOrCreateWallet(
        { type: WalletOwnerType.USER, id: ownerId },
        session,
      );
      await this.walletModel.updateOne(
        { _id: wallet._id },
        { $inc: { balance: amount } },
        { session },
      );
      return {
        payment: payment.toObject(),
        ledger: ledger.toObject(),
        idempotent: false as const,
      };
    });
  }

  /** Capture a previously initiated wallet top-up and post its ledger once. */
  async capturePendingWalletTopUp(
    userId: string,
    authority: string,
    gatewayRefId: string,
    request?: Request,
  ) {
    const walletOwner = { type: WalletOwnerType.USER, id: userId } as const;
    const committed = await this.transactions.run(async (session) => {
      const payment = await this.paymentModel
        .findOne({
          purpose: PaymentPurpose.WALLET_TOPUP,
          channel: PaymentChannel.ZARINPAL,
          'payer.userId': new Types.ObjectId(userId),
          'reference.authority': authority,
        })
        .session(session);
      if (!payment) throw new NotFoundException('Wallet top-up not found');

      if (payment.status === PaymentStatus.CAPTURED) {
        const ledger = await this.ledgerModel
          .findOne({ paymentId: payment._id })
          .session(session)
          .lean();
        return {
          payment: payment.toObject(),
          ledger,
          idempotent: true as const,
        };
      }
      if (
        payment.status !== PaymentStatus.PENDING &&
        payment.status !== PaymentStatus.AUTHORIZED
      ) {
        throw new ConflictException('Wallet top-up is not payable');
      }

      const split = payment.amount;
      const related = payment.related ?? {};
      const lines = this.buildPaymentLines(
        payment.channel,
        split,
        related,
        payment.purpose,
        walletOwner,
      );
      this.assertBalanced(lines);

      const now = new Date();
      payment.status = PaymentStatus.CAPTURED;
      payment.capturedAt = now;
      payment.reference.gatewayRefId = gatewayRefId;
      payment.markModified('reference');
      await payment.save({ session });

      const ledger = new this.ledgerModel({
        kind: LedgerEntryKind.WALLET_TOPUP,
        paymentId: payment._id,
        lines,
        split,
        related,
        dedupeKey: `payment:${payment.idempotencyKey}`,
        occurredAt: now,
      });
      await ledger.save({ session });
      await this.applyWalletSideEffects(
        payment.channel,
        payment.purpose,
        split,
        walletOwner,
        session,
      );
      return {
        payment: payment.toObject(),
        ledger: ledger.toObject(),
        idempotent: false as const,
      };
    });

    if (!committed.idempotent && committed.ledger) {
      const payment = committed.payment;
      await this.runPaymentPostCommitEffects(
        {
          purpose: payment.purpose,
          channel: payment.channel,
          status: PaymentStatus.CAPTURED,
          amount: payment.amount,
          reference: {
            orderId: payment.reference.orderId,
            authority: payment.reference.authority,
            gatewayRefId: payment.reference.gatewayRefId,
          },
          payer: { userId },
          related: {},
          idempotencyKey: payment.idempotencyKey,
        },
        { actorId: userId, request, walletOwner },
        committed,
      );
    }
    return committed;
  }

  /**
   * Capture a verified non-wallet gateway intent inside its caller's domain
   * transaction. The provider verification must already have succeeded.
   */
  async capturePendingGatewayPayment(
    input: {
      paymentId: string | Types.ObjectId;
      authority: string;
      gatewayRefId: string;
      membershipId?: string | Types.ObjectId;
      platformSubscriptionId?: string | Types.ObjectId;
    },
    session: ClientSession,
  ) {
    const payment = await this.paymentModel
      .findById(this.toObjectId(input.paymentId, 'paymentId'))
      .session(session);
    if (!payment) throw new NotFoundException('Payment intent not found');
    if (payment.channel !== PaymentChannel.ZARINPAL) {
      throw new ConflictException('Payment intent is not a gateway payment');
    }
    if (payment.status === PaymentStatus.CAPTURED) {
      const ledger = await this.ledgerModel
        .findOne({ paymentId: payment._id })
        .session(session)
        .lean();
      return {
        payment: payment.toObject(),
        ledger,
        idempotent: true as const,
      };
    }
    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.AUTHORIZED
    ) {
      throw new ConflictException('Payment intent is not payable');
    }

    if (input.membershipId) {
      payment.related.membershipId = this.toObjectId(
        input.membershipId,
        'membershipId',
      );
      payment.markModified('related');
    }
    if (input.platformSubscriptionId) {
      payment.related.platformSubscriptionId = this.toObjectId(
        input.platformSubscriptionId,
        'platformSubscriptionId',
      );
      payment.markModified('related');
    }
    if (
      payment.reference.authority &&
      payment.reference.authority !== input.authority
    ) {
      throw new ConflictException('Payment authority does not match intent');
    }
    const lines = this.buildPaymentLines(
      payment.channel,
      payment.amount,
      payment.related,
      payment.purpose,
      undefined,
      payment.tenders,
    );
    this.assertBalanced(lines);
    const now = new Date();
    payment.status = PaymentStatus.CAPTURED;
    payment.capturedAt = now;
    payment.reference.authority = input.authority;
    payment.reference.gatewayRefId = input.gatewayRefId;
    payment.markModified('reference');
    await payment.save({ session });

    const ledger = new this.ledgerModel({
      kind: LedgerEntryKind.PAYMENT,
      paymentId: payment._id,
      lines,
      split: payment.amount,
      related: payment.related,
      dedupeKey: `payment:${payment.idempotencyKey}`,
      occurredAt: now,
    });
    await ledger.save({ session });
    return {
      payment: payment.toObject(),
      ledger: ledger.toObject(),
      idempotent: false as const,
    };
  }

  async cancelPendingWalletTopUp(userId: string, authority: string) {
    const cancelled = await this.paymentModel.findOneAndUpdate(
      {
        purpose: PaymentPurpose.WALLET_TOPUP,
        channel: PaymentChannel.ZARINPAL,
        'payer.userId': new Types.ObjectId(userId),
        'reference.authority': authority,
        status: PaymentStatus.PENDING,
      },
      {
        $set: {
          status: PaymentStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );
    if (cancelled) return cancelled.toObject();

    const existing = await this.paymentModel.findOne({
      purpose: PaymentPurpose.WALLET_TOPUP,
      'payer.userId': new Types.ObjectId(userId),
      'reference.authority': authority,
    });
    if (!existing) throw new NotFoundException('Wallet top-up not found');
    return existing.toObject();
  }

  async findCapturedBookingPayment(bookingId: string | Types.ObjectId) {
    const payment = await this.paymentModel
      .findOne({
        purpose: PaymentPurpose.BOOKING,
        'related.bookingId': this.toObjectId(bookingId, 'bookingId'),
        status: {
          $in: [
            PaymentStatus.CAPTURED,
            PaymentStatus.PARTIALLY_REFUNDED,
            PaymentStatus.REFUNDED,
          ],
        },
      })
      .sort({ capturedAt: -1 });
    if (!payment) {
      throw new NotFoundException('Captured booking payment not found');
    }
    return payment;
  }

  /** Persist refund intent before any external PSP side effect. */
  async prepareBookingRefund(input: {
    paymentId: string | Types.ObjectId;
    bookingId: string | Types.ObjectId;
    processedBy: string | Types.ObjectId;
    amount: number;
    method: PaymentRefundMethod;
    idempotencyKey: string;
  }) {
    const paymentId = this.toObjectId(input.paymentId, 'paymentId');
    const bookingId = this.toObjectId(input.bookingId, 'bookingId');
    const processedBy = this.toObjectId(input.processedBy, 'processedBy');
    return this.transactions.run(async (session) => {
      const payment = await this.paymentModel
        .findById(paymentId)
        .session(session);
      if (
        !payment ||
        payment.related?.bookingId?.toString() !== bookingId.toString()
      ) {
        throw new NotFoundException('Booking payment not found');
      }
      const paidAmount = payment.amount.gross - payment.amount.discount;
      const remaining = paidAmount - (payment.refundedAmount ?? 0);
      const existing = payment.refunds?.find(
        (refund) => refund.idempotencyKey === input.idempotencyKey,
      );
      if (existing) {
        if (
          existing.amount !== input.amount ||
          existing.method !== input.method
        ) {
          throw new ConflictException(
            'Refund idempotency key is used with different semantics',
          );
        }
        if (existing.status === 'failed') {
          existing.status = 'pending';
          existing.lastError = undefined;
          await payment.save({ session });
        }
        return {
          amount: existing.amount,
          method: existing.method,
          idempotencyKey: existing.idempotencyKey,
          status: existing.status,
        };
      }
      if (input.amount <= 0 || input.amount > remaining) {
        throw new ConflictException(
          `Refund exceeds remaining amount (${remaining})`,
        );
      }
      if (
        input.method === PaymentRefundMethod.GATEWAY_REVERSE &&
        (input.amount !== paidAmount || (payment.refundedAmount ?? 0) !== 0)
      ) {
        throw new ConflictException(
          'Gateway reverse only supports a full refund',
        );
      }
      payment.refunds.push({
        amount: input.amount,
        method: input.method,
        idempotencyKey: input.idempotencyKey,
        status: 'pending',
        processedBy,
        processedAt: new Date(),
      });
      await payment.save({ session });
      const prepared = payment.refunds.at(-1)!;
      return {
        amount: prepared.amount,
        method: prepared.method,
        idempotencyKey: prepared.idempotencyKey,
        status: prepared.status,
      };
    });
  }

  async markBookingRefundFailed(
    paymentId: string | Types.ObjectId,
    idempotencyKey: string,
    error: unknown,
  ) {
    await this.paymentModel.updateOne(
      {
        _id: this.toObjectId(paymentId, 'paymentId'),
        refunds: { $elemMatch: { idempotencyKey, status: 'pending' } },
      },
      {
        $set: {
          'refunds.$.status': 'failed',
          'refunds.$.lastError': String(
            error instanceof Error ? error.message : error,
          ).slice(0, 1000),
        },
      },
    );
  }

  /**
   * Post an immutable refund entry and update the payment/wallet cache in one
   * transaction. The provider call (when any) must succeed before this method.
   */
  async settleBookingRefund(input: {
    paymentId: string | Types.ObjectId;
    bookingId: string | Types.ObjectId;
    payerUserId: string | Types.ObjectId;
    processedBy: string | Types.ObjectId;
    amount: number;
    method: PaymentRefundMethod;
    idempotencyKey: string;
    providerResult?: { code: number | string; message?: string };
  }) {
    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new BadRequestException('Refund amount must be a positive integer');
    }
    const paymentId = this.toObjectId(input.paymentId, 'paymentId');
    const bookingId = this.toObjectId(input.bookingId, 'bookingId');
    const payerUserId = this.toObjectId(input.payerUserId, 'payerUserId');
    const processedBy = this.toObjectId(input.processedBy, 'processedBy');

    const result = await this.transactions.run(async (session) => {
      const payment = await this.paymentModel
        .findById(paymentId)
        .session(session);
      if (
        !payment ||
        payment.related?.bookingId?.toString() !== bookingId.toString()
      ) {
        throw new NotFoundException('Booking payment not found');
      }
      const refundOperation = payment.refunds?.find(
        (refund) => refund.idempotencyKey === input.idempotencyKey,
      );
      if (!refundOperation) {
        throw new ConflictException('Refund intent was not prepared');
      }
      if (refundOperation.status === 'succeeded') {
        const ledger = await this.ledgerModel
          .findOne({ dedupeKey: `refund:${input.idempotencyKey}` })
          .session(session)
          .lean();
        return {
          payment: payment.toObject(),
          ledger,
          idempotent: true as const,
        };
      }
      if (
        payment.status !== PaymentStatus.CAPTURED &&
        payment.status !== PaymentStatus.PARTIALLY_REFUNDED
      ) {
        throw new ConflictException('Payment is not refundable');
      }
      const paidAmount = payment.amount.gross - payment.amount.discount;
      const refundedAmount = payment.refundedAmount ?? 0;
      const remaining = paidAmount - refundedAmount;
      if (input.amount > remaining) {
        throw new ConflictException(
          `Refund exceeds remaining amount (${remaining})`,
        );
      }

      const original = await this.ledgerModel
        .findOne({
          paymentId,
          kind: {
            $in: [LedgerEntryKind.PAYMENT, LedgerEntryKind.WALLET_SPEND],
          },
        })
        .session(session)
        .lean();
      if (!original) throw new NotFoundException('Payment ledger not found');

      const lines =
        input.method === PaymentRefundMethod.GATEWAY_REVERSE
          ? original.lines.map((line) => ({
              account: line.account,
              debit: line.credit,
              credit: line.debit,
              party: line.party,
            }))
          : buildWalletRefundLines(
              original.lines,
              input.amount,
              paidAmount,
              payerUserId,
            );
      if (
        input.method === PaymentRefundMethod.GATEWAY_REVERSE &&
        (input.amount !== paidAmount || refundedAmount !== 0)
      ) {
        throw new ConflictException(
          'Gateway reverse only supports a full refund',
        );
      }
      this.assertBalanced(lines);
      const now = new Date();
      const ledger = new this.ledgerModel({
        kind: LedgerEntryKind.REFUND,
        paymentId,
        lines,
        split: original.split,
        related: original.related,
        dedupeKey: `refund:${input.idempotencyKey}`,
        occurredAt: now,
        note: `Booking refund via ${input.method}`,
      });
      await ledger.save({ session });

      const totalRefunded = refundedAmount + input.amount;
      payment.refundedAmount = totalRefunded;
      payment.status =
        totalRefunded === paidAmount
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED;
      payment.refundedAt = now;
      refundOperation.status = 'succeeded';
      refundOperation.succeededAt = now;
      refundOperation.lastError = undefined;
      refundOperation.providerCode = input.providerResult
        ? String(input.providerResult.code)
        : undefined;
      refundOperation.providerMessage = input.providerResult?.message;
      await payment.save({ session });

      if (input.method === PaymentRefundMethod.WALLET_CREDIT) {
        const wallet = await this.getOrCreateWallet(
          { type: WalletOwnerType.USER, id: payerUserId },
          session,
        );
        await this.walletModel.updateOne(
          { _id: wallet._id },
          { $inc: { balance: input.amount } },
          { session },
        );
      }
      if (totalRefunded === paidAmount) {
        await this.invoiceModel.updateOne(
          { paymentId },
          { $set: { status: InvoiceStatus.VOID, voidedAt: now } },
          { session },
        );
      }
      return {
        payment: payment.toObject(),
        ledger: ledger.toObject(),
        idempotent: false as const,
      };
    });

    if (!result.idempotent) {
      this.audit.log({
        action: AuditAction.FINANCE_REFUND_SETTLED,
        actorId: processedBy,
        targetUserId: payerUserId,
        metadata: {
          paymentId: paymentId.toString(),
          bookingId: bookingId.toString(),
          amount: input.amount,
          method: input.method,
          ledgerEntryId: result.ledger?._id.toString(),
        },
      });
    }
    return result;
  }

  /**
   * Create a Payment + balanced immutable LedgerEntry.
   * Idempotent on `idempotencyKey`. Updates wallet cache for wallet spend / top-up.
   */
  async recordPayment(
    dto: RecordPaymentDto,
    opts?: {
      actorId?: string;
      operatorUserId?: string;
      request?: Request;
      walletOwner?: WalletOwnerRef;
      session?: ClientSession;
    },
  ) {
    try {
      const result = opts?.session
        ? await this.recordPaymentInSession(dto, opts, opts.session)
        : await this.transactions.run((session) =>
            this.recordPaymentInSession(dto, opts, session),
          );

      if (!opts?.session && !result.idempotent) {
        await this.runPaymentPostCommitEffects(dto, opts, result);
      }
      return result;
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        const existing = await this.paymentModel
          .findOne({ idempotencyKey: dto.idempotencyKey })
          .lean();
        if (existing) {
          assertPaymentIdempotencyMatch(existing, dto);
          const ledger = await this.ledgerModel
            .findOne({ paymentId: existing._id })
            .lean();
          return { payment: existing, ledger, idempotent: true as const };
        }
      }
      throw err;
    }
  }

  private async recordPaymentInSession(
    dto: RecordPaymentDto,
    opts:
      | {
          actorId?: string;
          operatorUserId?: string;
          request?: Request;
          walletOwner?: WalletOwnerRef;
        }
      | undefined,
    session: ClientSession,
  ) {
    const existing = await this.paymentModel
      .findOne({ idempotencyKey: dto.idempotencyKey })
      .session(session)
      .lean();
    if (existing) {
      assertPaymentIdempotencyMatch(existing, dto);
      const ledger = await this.ledgerModel
        .findOne({ paymentId: existing._id })
        .session(session)
        .lean();
      return { payment: existing, ledger, idempotent: true as const };
    }

    if (!dto.payer.userId && !dto.payer.guest) {
      throw new BadRequestException('payer.userId or payer.guest is required');
    }

    const status = dto.status ?? PaymentStatus.CAPTURED;
    const now = new Date();
    const related = this.mapRelated(dto.related);
    const split = await this.normalizeSplitWithCompensation(
      dto.amount,
      related,
      session,
    );
    this.assertSplitIdentity(split);
    const tenders = this.normalizeTenders(
      dto.channel,
      dto.tenders,
      split.gross - split.discount,
    );
    const walletOwner =
      opts?.walletOwner ??
      (dto.payer.userId
        ? { type: WalletOwnerType.USER, id: dto.payer.userId }
        : undefined);

    // Fail fast before posting immutable ledger rows.
    if (
      status === PaymentStatus.CAPTURED &&
      dto.channel === PaymentChannel.WALLET &&
      dto.purpose !== PaymentPurpose.WALLET_TOPUP
    ) {
      if (!walletOwner) {
        throw new BadRequestException(
          'Wallet owner required for wallet payments',
        );
      }
      const wallet = await this.getOrCreateWallet(walletOwner, session);
      const paid = split.gross - split.discount;
      if (wallet.balance < paid) {
        throw new BadRequestException('Insufficient wallet balance');
      }
    }

    const paymentDoc = new this.paymentModel({
      purpose: dto.purpose,
      channel: dto.channel,
      status,
      amount: split,
      reference: dto.reference,
      payer: {
        userId: dto.payer.userId
          ? this.toObjectId(dto.payer.userId, 'payer.userId')
          : undefined,
        guest: dto.payer.guest,
      },
      operator: opts?.operatorUserId
        ? {
            userId: this.toObjectId(opts.operatorUserId, 'operatorUserId'),
            note: dto.operatorNote,
          }
        : undefined,
      tenders,
      related,
      idempotencyKey: dto.idempotencyKey,
      capturedAt: status === PaymentStatus.CAPTURED ? now : undefined,
      failedAt: status === PaymentStatus.FAILED ? now : undefined,
      refundedAt:
        status === PaymentStatus.REFUNDED ||
        status === PaymentStatus.PARTIALLY_REFUNDED
          ? now
          : undefined,
    });
    await paymentDoc.save({ session });

    let ledger: LedgerEntryDocument | null = null;

    if (status === PaymentStatus.CAPTURED) {
      const kind =
        dto.purpose === PaymentPurpose.WALLET_TOPUP
          ? LedgerEntryKind.WALLET_TOPUP
          : dto.channel === PaymentChannel.WALLET
            ? LedgerEntryKind.WALLET_SPEND
            : LedgerEntryKind.PAYMENT;

      const lines = this.buildPaymentLines(
        dto.channel,
        split,
        related,
        dto.purpose,
        opts?.walletOwner,
        tenders,
      );
      this.assertBalanced(lines);

      ledger = new this.ledgerModel({
        kind,
        paymentId: paymentDoc._id,
        lines,
        split,
        related,
        dedupeKey: `payment:${dto.idempotencyKey}`,
        occurredAt: now,
        note: dto.note,
      });
      await ledger.save({ session });

      await this.applyWalletSideEffects(
        dto.channel,
        dto.purpose,
        split,
        walletOwner,
        session,
      );
    }

    return {
      payment: paymentDoc.toObject(),
      ledger: ledger?.toObject() ?? null,
      idempotent: false as const,
    };
  }

  async runPaymentPostCommitEffects(
    dto: RecordPaymentDto,
    opts:
      | {
          actorId?: string;
          operatorUserId?: string;
          request?: Request;
          walletOwner?: WalletOwnerRef;
        }
      | undefined,
    result: Awaited<ReturnType<FinanceService['recordPaymentInSession']>>,
  ) {
    if (result.idempotent || !result.ledger) return;
    const payment = result.payment;
    const ledger = result.ledger;

    this.audit.log({
      action: AuditAction.FINANCE_PAYMENT_RECORDED,
      actorId: opts?.actorId ?? opts?.operatorUserId,
      targetUserId: dto.payer.userId,
      metadata: {
        paymentId: payment._id.toString(),
        channel: dto.channel,
        purpose: dto.purpose,
        net: payment.amount.net,
        clubId: payment.related?.clubId?.toString(),
      },
      request: opts?.request,
    });
    this.audit.log({
      action: AuditAction.FINANCE_LEDGER_POSTED,
      actorId: opts?.actorId ?? opts?.operatorUserId,
      metadata: {
        ledgerEntryId: ledger._id.toString(),
        paymentId: payment._id.toString(),
        kind: ledger.kind,
      },
      request: opts?.request,
    });

    if (dto.purpose === PaymentPurpose.WALLET_TOPUP && opts?.walletOwner) {
      this.audit.log({
        action: AuditAction.FINANCE_WALLET_TOPUP,
        targetUserId:
          opts.walletOwner.type === WalletOwnerType.USER
            ? opts.walletOwner.id
            : undefined,
        metadata: {
          ownerType: opts.walletOwner.type,
          ownerId: opts.walletOwner.id.toString(),
          amount: payment.amount.gross - payment.amount.discount,
        },
      });
    }

    try {
      await this.issueInvoiceFromPaymentInternal(payment, {
        actorId: opts?.actorId ?? opts?.operatorUserId,
        request: opts?.request,
      });
    } catch (err) {
      this.logger.warn(
        `Invoice projection failed for payment ${payment._id.toString()}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async recordManualPayment(
    clubId: string,
    operatorUserId: string,
    dto: RecordManualPaymentDto,
    request?: Request,
  ) {
    if (!MANUAL_CHANNELS.has(dto.channel)) {
      throw new BadRequestException(
        'Manual payments must use cash, pos, card_to_card, or mixed',
      );
    }

    return this.recordPayment(
      {
        ...dto,
        related: { ...dto.related, clubId },
        status: PaymentStatus.CAPTURED,
      },
      { operatorUserId, actorId: operatorUserId, request },
    );
  }

  async listPayments(query: ListPaymentsQueryDto) {
    return this.financeReadQuery.listPayments(query);
  }

  async getPayment(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Payment not found');
    }
    const payment = await this.paymentModel.findById(id).lean();
    if (!payment) throw new NotFoundException('Payment not found');
    const ledger = await this.ledgerModel
      .findOne({ paymentId: payment._id })
      .lean();
    return { payment, ledger };
  }

  async listMyPayments(userId: string, query: ListPaymentsQueryDto) {
    return this.listPayments({ ...query, payerUserId: userId });
  }

  // ── Wallet overview ─────────────────────────────────────────────────────

  async getWalletOverview(userId: string) {
    const wallet = await this.getWalletBalance({
      type: WalletOwnerType.USER,
      id: userId,
    });

    const months = 5;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const payments = await this.paymentModel
      .find({
        'payer.userId': this.toObjectId(userId, 'userId'),
        status: PaymentStatus.CAPTURED,
        capturedAt: { $gte: start },
      })
      .select({ purpose: 1, amount: 1, capturedAt: 1, createdAt: 1 })
      .lean();

    const balancePoints: { label: string; value: number }[] = [];
    const incomeSeries: number[] = [];
    const spendSeries: number[] = [];
    let running = 0;

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const monthEnd = new Date(
        start.getFullYear(),
        start.getMonth() + i + 1,
        1,
      );
      let income = 0;
      let spend = 0;
      for (const p of payments) {
        const at = p.capturedAt ?? p.createdAt;
        if (!at || at < monthStart || at >= monthEnd) continue;
        const gross = p.amount?.gross ?? 0;
        if (p.purpose === PaymentPurpose.WALLET_TOPUP) {
          income += gross;
          running += gross;
        } else {
          spend += gross;
          running = Math.max(0, running - gross);
        }
      }
      balancePoints.push({
        label: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        value: Math.round(running / 1000) || wallet.balance,
      });
      incomeSeries.push(income);
      spendSeries.push(spend);
    }

    // Prefer live wallet balance on the latest point.
    if (balancePoints.length) {
      balancePoints[balancePoints.length - 1].value = wallet.balance;
    }

    return {
      ...wallet,
      balancePoints,
      incomeSeries,
      spendSeries,
    };
  }

  // ── Invoices ────────────────────────────────────────────────────────────

  async listMyInvoices(userId: string, query: ListInvoicesQueryDto) {
    const filter: QueryFilter<InvoiceDocument> = {
      'party.payerUserId': this.toObjectId(userId, 'userId'),
    };
    if (query.status) filter.status = query.status;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort({ issuedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.invoiceModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toInvoice(item)),
      total,
      page,
      pageSize,
    );
  }

  async listClubInvoices(clubId: string, query: ListInvoicesQueryDto) {
    const filter: QueryFilter<InvoiceDocument> = {
      'party.clubId': this.toObjectId(clubId, 'clubId'),
    };
    if (query.status) filter.status = query.status;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort({ issuedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.invoiceModel.countDocuments(filter),
    ]);
    const payerIds = [
      ...new Set(
        items
          .map((item) => item.party?.payerUserId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const payers = payerIds.length
      ? await this.userModel
          .find({ _id: { $in: payerIds.map((id) => new Types.ObjectId(id)) } })
          .select({ name: 1 })
          .lean()
      : [];
    const payerNames = new Map(
      payers.map((payer) => [
        payer._id.toString(),
        [payer.name?.first, payer.name?.last].filter(Boolean).join(' ') || null,
      ]),
    );
    return paginatedResult(
      items.map((item) => {
        const view = this.toInvoice(item);
        return {
          ...view,
          party: {
            ...view.party,
            payerDisplayName: view.party.payerUserId
              ? (payerNames.get(view.party.payerUserId) ?? null)
              : null,
          },
        };
      }),
      total,
      page,
      pageSize,
    );
  }

  async getMyInvoice(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invoice not found');
    }
    const item = await this.invoiceModel.findById(id).lean();
    if (!item) throw new NotFoundException('Invoice not found');
    if (item.party?.payerUserId?.toString() !== userId) {
      throw new ForbiddenException('Not your invoice');
    }
    return this.toInvoice(item);
  }

  async issueInvoiceFromPayment(
    userId: string,
    dto: IssueInvoiceFromPaymentDto,
    request?: Request,
  ) {
    const payment = await this.paymentModel.findById(dto.paymentId).lean();
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.payer?.userId?.toString() !== userId) {
      throw new ForbiddenException('Not your payment');
    }
    if (payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException(
        'Payment must be captured to issue invoice',
      );
    }
    return this.issueInvoiceFromPaymentInternal(payment, {
      actorId: userId,
      request,
    });
  }

  async getOwnerFinanceAnalytics(
    clubId: string,
    query: AnalyticsPeriodQueryDto,
  ) {
    const period = query.period ?? AnalyticsPeriod.MONTH;
    const buckets = this.analyticsBucketCount(period);
    const clubOid = this.toObjectId(clubId, 'clubId');
    const since = this.analyticsSince(period);

    const [membershipCounts, payments] = await Promise.all([
      this.membershipAnalytics.getFinanceCounts(clubOid, since),
      this.paymentModel
        .find({
          'related.clubId': clubOid,
          status: PaymentStatus.CAPTURED,
          capturedAt: { $gte: since },
        })
        .select({ amount: 1, capturedAt: 1, createdAt: 1 })
        .lean(),
    ]);
    const { newMembers, activeMembers, cancelledMembers } = membershipCounts;

    const totalGross = payments.reduce(
      (sum, p) => sum + (p.amount?.gross ?? 0),
      0,
    );
    const renewalPct =
      activeMembers === 0
        ? 0
        : Math.round(
            ((activeMembers - cancelledMembers) / Math.max(activeMembers, 1)) *
              100,
          );
    const churnPct =
      activeMembers + cancelledMembers === 0
        ? 0
        : Math.round(
            (cancelledMembers / Math.max(activeMembers + cancelledMembers, 1)) *
              100,
          );

    const fill = (value: number) =>
      Array.from({ length: buckets }, (_, i) =>
        Math.max(0, Math.round((value * (i + 1)) / buckets)),
      );

    return {
      period,
      kpis: [
        {
          id: 'new-members',
          value: newMembers,
          chart: 'line' as const,
          series: fill(newMembers),
        },
        {
          id: 'renewal',
          value: renewalPct,
          chart: 'line' as const,
          series: fill(renewalPct),
          comparisonSeries: fill(Math.max(0, renewalPct - 6)),
        },
        {
          id: 'churn',
          value: churnPct,
          chart: 'line' as const,
          series: fill(churnPct),
        },
        {
          id: 'attendance',
          value: Math.round(totalGross / 1000),
          chart: 'bar' as const,
          series: fill(Math.round(totalGross / 1000)),
        },
      ],
      totals: {
        activeMembers,
        newMembers,
        cancelledMembers,
        capturedGross: totalGross,
      },
    };
  }

  private async issueInvoiceFromPaymentInternal(
    payment: {
      _id: Types.ObjectId;
      purpose: PaymentPurpose;
      amount: PaymentAmountSplit;
      payer: { userId?: Types.ObjectId; guest?: { name: string } };
      related?: PaymentRelated;
      capturedAt?: Date;
      createdAt?: Date;
    },
    opts?: { actorId?: string; request?: Request },
  ) {
    const existing = await this.invoiceModel
      .findOne({ paymentId: payment._id })
      .lean();
    if (existing) return this.toInvoice(existing);

    const payable =
      payment.amount.gross - payment.amount.discount + payment.amount.tax;
    const title = this.invoiceTitleForPurpose(payment.purpose);
    const number = `INV-${payment._id.toString().slice(-8).toUpperCase()}`;
    const issuedAt = payment.capturedAt ?? payment.createdAt ?? new Date();

    let clubName: string | undefined;
    if (payment.related?.clubId) {
      const club = await this.clubModel
        .findById(payment.related.clubId)
        .select({ 'identity.name': 1 })
        .lean();
      clubName = club?.identity?.name;
    }

    try {
      const created = await this.invoiceModel.create({
        paymentId: payment._id,
        number,
        title,
        status: InvoiceStatus.ISSUED,
        lines: [
          {
            title,
            qty: 1,
            unitPrice: payment.amount.gross,
            total: payment.amount.gross,
          },
        ],
        amounts: {
          subtotal: payment.amount.gross,
          discount: payment.amount.discount,
          tax: payment.amount.tax,
          payable: Math.max(0, payable),
        },
        party: {
          payerUserId: payment.payer.userId,
          clubId: payment.related?.clubId,
          clubName,
        },
        issuedAt,
      });

      this.audit.log({
        action: AuditAction.INVOICE_ISSUED,
        actorId: opts?.actorId,
        targetUserId: payment.payer.userId?.toString(),
        metadata: {
          invoiceId: created._id.toString(),
          paymentId: payment._id.toString(),
        },
        request: opts?.request,
      });

      return this.toInvoice(created.toObject());
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        const again = await this.invoiceModel
          .findOne({ paymentId: payment._id })
          .lean();
        if (again) return this.toInvoice(again);
      }
      throw err;
    }
  }

  private invoiceTitleForPurpose(purpose: PaymentPurpose): string {
    switch (purpose) {
      case PaymentPurpose.WALLET_TOPUP:
        return 'Wallet top-up';
      case PaymentPurpose.BOOKING:
        return 'Booking payment';
      case PaymentPurpose.MEMBERSHIP:
        return 'Membership payment';
      case PaymentPurpose.PACKAGE:
        return 'Session package';
      case PaymentPurpose.PLATFORM_SUBSCRIPTION:
        return 'Platform subscription';
      default:
        return 'Payment';
    }
  }

  private toInvoice(doc: {
    _id: Types.ObjectId;
    paymentId: Types.ObjectId;
    number: string;
    title: string;
    status: InvoiceStatus;
    lines: {
      title: string;
      qty: number;
      unitPrice: number;
      total: number;
    }[];
    amounts: {
      subtotal: number;
      discount: number;
      tax: number;
      payable: number;
    };
    party?: {
      payerUserId?: Types.ObjectId;
      clubName?: string;
      clubId?: Types.ObjectId;
    };
    issuedAt: Date;
    voidedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      paymentId: doc.paymentId.toString(),
      number: doc.number,
      title: doc.title,
      status: doc.status,
      lines: doc.lines ?? [],
      amounts: doc.amounts,
      party: {
        payerUserId: doc.party?.payerUserId?.toString() ?? null,
        clubName: doc.party?.clubName ?? null,
        clubId: doc.party?.clubId?.toString() ?? null,
      },
      issuedAt: doc.issuedAt.toISOString(),
      voidedAt: doc.voidedAt?.toISOString() ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private analyticsBucketCount(period: AnalyticsPeriod): number {
    switch (period) {
      case AnalyticsPeriod.WEEK:
        return 7;
      case AnalyticsPeriod.MONTH:
        return 4;
      case AnalyticsPeriod.QUARTER:
        return 3;
      default:
        return 7;
    }
  }

  private analyticsSince(period: AnalyticsPeriod): Date {
    const now = new Date();
    switch (period) {
      case AnalyticsPeriod.WEEK:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case AnalyticsPeriod.MONTH:
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case AnalyticsPeriod.QUARTER:
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  // ── Ledger (read-only; never update) ────────────────────────────────────

  async listLedger(query: ListLedgerQueryDto) {
    return this.financeReadQuery.listLedger(query);
  }

  // ── Cash shifts ─────────────────────────────────────────────────────────

  async openCashShift(clubId: string, openedBy: string) {
    const existing = await this.cashShiftModel
      .findOne({
        clubId: this.toObjectId(clubId, 'clubId'),
        status: CashShiftStatus.OPEN,
      })
      .lean();
    if (existing) {
      throw new ConflictException(
        'An open cash shift already exists for this club',
      );
    }

    const shift = await this.cashShiftModel.create({
      clubId: this.toObjectId(clubId, 'clubId'),
      openedBy: this.toObjectId(openedBy, 'openedBy'),
      status: CashShiftStatus.OPEN,
      openedAt: new Date(),
    });
    return shift.toObject();
  }

  async closeCashShift(
    clubId: string,
    shiftId: string,
    closedBy: string,
    dto: CloseCashShiftDto,
    request?: Request,
  ) {
    const shift = await this.findClubShift(clubId, shiftId);
    if (shift.status !== CashShiftStatus.OPEN) {
      throw new BadRequestException('Cash shift is already closed');
    }

    const expected = await this.computeShiftExpected(
      clubId,
      shift.openedAt,
      new Date(),
    );

    shift.status = CashShiftStatus.CLOSED;
    shift.closedBy = this.toObjectId(closedBy, 'closedBy');
    shift.closedAt = new Date();
    shift.counted = dto.counted;
    shift.expected = expected;
    shift.varianceNote = dto.varianceNote;
    await shift.save();

    this.audit.log({
      action: AuditAction.FINANCE_SHIFT_CLOSED,
      actorId: closedBy,
      metadata: {
        shiftId: shift._id.toString(),
        clubId,
        counted: dto.counted,
        expected,
      },
      request,
    });

    return shift.toObject();
  }

  async listCashShifts(
    clubId: string,
    query: { page?: number; page_size?: number },
  ) {
    const filter = { clubId: this.toObjectId(clubId, 'clubId') };
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.cashShiftModel
        .find(filter)
        .sort({ openedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.cashShiftModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }

  async getOpenCashShift(clubId: string) {
    return this.cashShiftModel
      .findOne({
        clubId: this.toObjectId(clubId, 'clubId'),
        status: CashShiftStatus.OPEN,
      })
      .lean();
  }

  // ── Payouts ─────────────────────────────────────────────────────────────

  async createPayout(
    clubId: string | undefined,
    dto: CreatePayoutDto,
    actorId: string,
    request?: Request,
  ) {
    if (new Date(dto.periodTo) < new Date(dto.periodFrom)) {
      throw new BadRequestException('periodTo must be >= periodFrom');
    }

    const payout = await this.payoutModel.create({
      recipient: {
        type: dto.recipientType,
        id: this.toObjectId(dto.recipientId, 'recipientId'),
      },
      status: PayoutStatus.PENDING,
      amount: dto.amount,
      currency: 'IRT',
      period: {
        from: new Date(dto.periodFrom),
        to: new Date(dto.periodTo),
      },
      clubId: clubId ? this.toObjectId(clubId, 'clubId') : undefined,
      note: dto.note,
    });

    this.audit.log({
      action: AuditAction.FINANCE_PAYOUT_CREATED,
      actorId,
      metadata: {
        payoutId: payout._id.toString(),
        amount: dto.amount,
        recipientType: dto.recipientType,
        recipientId: dto.recipientId,
        clubId,
      },
      request,
    });

    return payout.toObject();
  }

  async settlePayout(
    payoutId: string,
    actorId: string,
    note?: string,
    request?: Request,
  ) {
    if (!Types.ObjectId.isValid(payoutId)) {
      throw new NotFoundException('Payout not found');
    }
    const payout = await this.payoutModel.findById(payoutId);
    if (!payout) throw new NotFoundException('Payout not found');
    if (
      payout.status !== PayoutStatus.PENDING &&
      payout.status !== PayoutStatus.PROCESSING
    ) {
      throw new BadRequestException(
        `Cannot settle payout in status ${payout.status}`,
      );
    }

    const now = new Date();
    const partyType =
      payout.recipient.type === PayoutRecipientType.CLUB
        ? WalletOwnerType.CLUB
        : WalletOwnerType.COACH;

    const lines: LedgerLine[] = [
      {
        account: LedgerAccount.PROVIDER_PAYABLE,
        debit: payout.amount,
        credit: 0,
        party: { type: partyType, id: payout.recipient.id },
      },
      {
        account: LedgerAccount.CASH,
        debit: 0,
        credit: payout.amount,
      },
    ];
    this.assertBalanced(lines);

    const dedupeKey = `payout:${payout._id.toString()}`;
    let ledger: LedgerEntryDocument;
    try {
      ledger = await this.ledgerModel.create({
        kind: LedgerEntryKind.PAYOUT,
        lines,
        split: {
          gross: payout.amount,
          discount: 0,
          tax: 0,
          providerShare: 0,
          platformFee: 0,
          gatewayFee: 0,
          net: payout.amount,
        },
        related: { clubId: payout.clubId },
        dedupeKey,
        occurredAt: now,
        note: note ?? payout.note,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        const existing = await this.ledgerModel.findOne({ dedupeKey }).lean();
        const refreshed = await this.payoutModel.findById(payoutId).lean();
        return {
          payout: refreshed,
          ledger: existing,
          idempotent: true as const,
        };
      }
      throw err;
    }

    payout.status = PayoutStatus.SETTLED;
    payout.settledAt = now;
    payout.ledgerEntryId = ledger._id;
    if (note) payout.note = note;
    await payout.save();

    this.audit.log({
      action: AuditAction.FINANCE_PAYOUT_SETTLED,
      actorId,
      metadata: {
        payoutId: payout._id.toString(),
        ledgerEntryId: ledger._id.toString(),
        amount: payout.amount,
      },
      request,
    });

    return {
      payout: payout.toObject(),
      ledger: ledger.toObject(),
      idempotent: false as const,
    };
  }

  async listPayouts(query: ListPayoutsQueryDto) {
    const filter: QueryFilter<PayoutDocument> = {};
    if (query.status) filter.status = { $in: query.status };
    if (query.clubId) filter.clubId = this.toObjectId(query.clubId, 'clubId');
    if (query.recipientType) {
      filter['recipient.type'] = { $in: query.recipientType };
    }
    if (query.recipientId) {
      filter['recipient.id'] = this.toObjectId(
        query.recipientId,
        'recipientId',
      );
    }
    Object.assign(
      filter,
      createSearchFilter(query.search, [
        'note',
        'dispute.reason',
        'dispute.resolutionNote',
      ]),
    );

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(
      query,
      {
        createdAt: 'createdAt',
        settledAt: 'settledAt',
        amount: 'amount',
        status: 'status',
        recipientType: 'recipient.type',
        periodFrom: 'period.from',
        periodTo: 'period.to',
      },
      { createdAt: -1 },
    );
    const [items, total] = await Promise.all([
      this.payoutModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.payoutModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }

  /**
   * Draft a payout by summing net PROVIDER_PAYABLE credits for the recipient
   * over the period (instead of only accepting a manual DTO amount).
   */
  async draftPeriodPayout(
    clubId: string | undefined,
    dto: {
      recipientType: PayoutRecipientType;
      recipientId: string;
      periodFrom: string;
      periodTo: string;
      note?: string;
    },
    actorId: string,
    request?: Request,
  ) {
    if (new Date(dto.periodTo) < new Date(dto.periodFrom)) {
      throw new BadRequestException('periodTo must be >= periodFrom');
    }

    const partyType =
      dto.recipientType === PayoutRecipientType.CLUB
        ? WalletOwnerType.CLUB
        : WalletOwnerType.COACH;
    const partyId = this.toObjectId(dto.recipientId, 'recipientId');
    const from = new Date(dto.periodFrom);
    const to = new Date(dto.periodTo);

    const entries = await this.ledgerModel
      .find({
        occurredAt: { $gte: from, $lte: to },
        'lines.account': LedgerAccount.PROVIDER_PAYABLE,
        'lines.party.type': partyType,
        'lines.party.id': partyId,
      })
      .lean();

    let amount = 0;
    for (const entry of entries) {
      for (const line of entry.lines) {
        if (
          line.account === LedgerAccount.PROVIDER_PAYABLE &&
          line.party?.type === partyType &&
          line.party.id.toString() === partyId.toString()
        ) {
          amount += (line.credit ?? 0) - (line.debit ?? 0);
        }
      }
    }
    if (amount <= 0) {
      throw new BadRequestException(
        'No positive provider_payable balance for period',
      );
    }

    return this.createPayout(
      clubId,
      {
        recipientType: dto.recipientType,
        recipientId: dto.recipientId,
        amount,
        periodFrom: dto.periodFrom,
        periodTo: dto.periodTo,
        note: dto.note ?? `Draft from ledger ${dto.periodFrom}–${dto.periodTo}`,
      },
      actorId,
      request,
    );
  }

  async openPayoutDispute(
    payoutId: string,
    reason: string,
    actorId: string,
    request?: Request,
  ) {
    const payout = await this.findPayoutOrFail(payoutId);
    if (
      payout.status === PayoutStatus.CANCELLED ||
      payout.status === PayoutStatus.DISPUTED
    ) {
      throw new BadRequestException(
        `Cannot dispute payout in status ${payout.status}`,
      );
    }
    payout.status = PayoutStatus.DISPUTED;
    payout.dispute = {
      status: PayoutDisputeStatus.OPEN,
      reason: reason.trim(),
      openedAt: new Date(),
    };
    await payout.save();

    this.audit.log({
      action: AuditAction.FINANCE_PAYOUT_DISPUTED,
      actorId,
      metadata: { payoutId, reason },
      request,
    });
    return payout.toObject();
  }

  /**
   * Resolve a payout dispute by posting reversing ledger entries only —
   * never mutate past ledger documents.
   */
  async resolvePayoutDispute(
    payoutId: string,
    opts: {
      resolution: PayoutDisputeStatus.RESOLVED | PayoutDisputeStatus.REJECTED;
      note?: string;
      reverseSettledAmount?: boolean;
    },
    actorId: string,
    request?: Request,
  ) {
    const payout = await this.findPayoutOrFail(payoutId);
    if (payout.status !== PayoutStatus.DISPUTED || !payout.dispute) {
      throw new BadRequestException('Payout is not in dispute');
    }

    let reverseLedger: LedgerEntryDocument | null = null;
    if (
      opts.resolution === PayoutDisputeStatus.RESOLVED &&
      opts.reverseSettledAmount !== false &&
      payout.ledgerEntryId &&
      payout.settledAt
    ) {
      const original = await this.ledgerModel.findById(payout.ledgerEntryId);
      if (original) {
        const reverseLines = original.lines.map((line) => ({
          account: line.account,
          debit: line.credit,
          credit: line.debit,
          party: line.party,
        }));
        this.assertBalanced(reverseLines);
        reverseLedger = await this.ledgerModel.create({
          kind: LedgerEntryKind.ADJUSTMENT,
          lines: reverseLines,
          split: original.split,
          related: original.related,
          dedupeKey: `payout-dispute-reverse:${payout._id.toString()}`,
          occurredAt: new Date(),
          note: opts.note ?? `Dispute resolve reverse for payout ${payoutId}`,
        });
      }
    }

    payout.dispute.status = opts.resolution;
    payout.dispute.resolvedAt = new Date();
    payout.dispute.resolutionNote = opts.note;
    payout.status =
      opts.resolution === PayoutDisputeStatus.RESOLVED
        ? PayoutStatus.CANCELLED
        : PayoutStatus.PENDING;
    await payout.save();

    this.audit.log({
      action: AuditAction.FINANCE_PAYOUT_DISPUTE_RESOLVED,
      actorId,
      metadata: {
        payoutId,
        resolution: opts.resolution,
        reverseLedgerId: reverseLedger?._id.toString(),
      },
      request,
    });

    return {
      payout: payout.toObject(),
      reverseLedger: reverseLedger?.toObject() ?? null,
    };
  }

  private async findPayoutOrFail(payoutId: string) {
    if (!Types.ObjectId.isValid(payoutId)) {
      throw new NotFoundException('Payout not found');
    }
    const payout = await this.payoutModel.findById(payoutId);
    if (!payout) throw new NotFoundException('Payout not found');
    return payout;
  }

  // ── Compensation rules ──────────────────────────────────────────────────

  async upsertCompensationRule(clubId: string, dto: UpsertCompensationRuleDto) {
    const payload = {
      clubId: this.toObjectId(clubId, 'clubId'),
      coachUserId: dto.coachUserId
        ? this.toObjectId(dto.coachUserId, 'coachUserId')
        : undefined,
      basis: dto.basis,
      rate: dto.rate,
      status: dto.status ?? EntityStatus.ACTIVE,
      effective: {
        from: new Date(dto.effectiveFrom),
        to: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      },
      note: dto.note,
    };

    if (dto.id) {
      if (!Types.ObjectId.isValid(dto.id)) {
        throw new NotFoundException('Compensation rule not found');
      }
      const updated = await this.compensationModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(dto.id),
            clubId: payload.clubId,
          },
          { $set: payload },
          { returnDocument: 'after' },
        )
        .lean();
      if (!updated) throw new NotFoundException('Compensation rule not found');
      return updated;
    }

    const created = await this.compensationModel.create(payload);
    return created.toObject();
  }

  async listCompensationRules(
    clubId: string,
    query: ListCompensationRulesQueryDto,
  ) {
    const filter: QueryFilter<CompensationRuleDocument> = {
      clubId: this.toObjectId(clubId, 'clubId'),
    };
    if (query.coachUserId) {
      filter.coachUserId = this.toObjectId(query.coachUserId, 'coachUserId');
    }
    if (query.status) filter.status = query.status;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.compensationModel
        .find(filter)
        .sort({ 'effective.from': -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.compensationModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }

  // ── Debts ───────────────────────────────────────────────────────────────

  async createDebt(
    clubId: string,
    dto: CreateDebtDto,
    session?: ClientSession,
  ) {
    if (session) {
      return this.createDebtInSession(clubId, dto, session);
    }
    return this.transactions.run((transactionSession) =>
      this.createDebtInSession(clubId, dto, transactionSession),
    );
  }

  private async createDebtInSession(
    clubId: string,
    dto: CreateDebtDto,
    session: ClientSession,
  ) {
    if (!dto.holder.userId && !dto.holder.guest) {
      throw new BadRequestException(
        'holder.userId or holder.guest is required',
      );
    }

    const debt = new this.debtModel({
      clubId: this.toObjectId(clubId, 'clubId'),
      membershipId: dto.membershipId
        ? this.toObjectId(dto.membershipId, 'membershipId')
        : undefined,
      holder: {
        userId: dto.holder.userId
          ? this.toObjectId(dto.holder.userId, 'holder.userId')
          : undefined,
        guest: dto.holder.guest,
      },
      status: DebtStatus.OPEN,
      principal: dto.principal,
      remaining: dto.principal,
      dueAt: new Date(dto.dueAt),
      paymentIds: [],
      note: dto.note,
    });
    await debt.save({ session });

    if (dto.installmentCount && dto.installmentCount > 1) {
      const count = dto.installmentCount;
      const base = Math.floor(dto.principal / count);
      let allocated = 0;
      const start = new Date(dto.dueAt);
      const docs: Array<{
        debtId: Types.ObjectId;
        sequence: number;
        amount: number;
        status: InstallmentStatus;
        dueAt: Date;
      }> = [];
      for (let i = 0; i < count; i++) {
        const amount = i === count - 1 ? dto.principal - allocated : base;
        allocated += amount;
        const dueAt = new Date(start);
        dueAt.setMonth(dueAt.getMonth() + i);
        docs.push({
          debtId: debt._id,
          sequence: i + 1,
          amount,
          status: InstallmentStatus.SCHEDULED,
          dueAt,
        });
      }
      await this.installmentModel.insertMany(docs, { session });
    }

    const installments = await this.installmentModel
      .find({ debtId: debt._id })
      .sort({ sequence: 1 })
      .session(session ?? null)
      .lean();

    return { debt: debt.toObject(), installments };
  }

  async recordDebtPayment(
    clubId: string,
    debtId: string,
    operatorUserId: string,
    dto: RecordDebtPaymentDto,
    request?: Request,
  ) {
    if (
      !MANUAL_CHANNELS.has(dto.channel) &&
      dto.channel !== PaymentChannel.WALLET
    ) {
      throw new BadRequestException('Unsupported debt payment channel');
    }

    const paymentDto: RecordPaymentDto = {
      purpose: PaymentPurpose.MANUAL,
      channel: dto.channel,
      status: PaymentStatus.CAPTURED,
      amount: {
        gross: dto.amount,
        discount: 0,
        tax: 0,
        providerShare: 0,
        platformFee: 0,
        gatewayFee: 0,
        net: dto.amount,
      },
      reference: {
        orderId: dto.orderId ?? `debt:${debtId}:${dto.idempotencyKey}`,
      },
      payer: {},
      related: { clubId },
      idempotencyKey: dto.idempotencyKey,
      operatorNote: dto.operatorNote,
    };

    const committed = await this.transactions.run(async (session) => {
      const debt = await this.findClubDebt(clubId, debtId, session);
      paymentDto.payer = {
        userId: debt.holder.userId?.toString(),
        guest: debt.holder.guest
          ? {
              name: debt.holder.guest.name,
              phone: debt.holder.guest.phone,
            }
          : undefined,
      };

      const result = await this.recordPayment(paymentDto, {
        operatorUserId,
        actorId: operatorUserId,
        session,
      });

      if (result.idempotent) {
        const alreadyApplied = debt.paymentIds.some((paymentId) =>
          paymentId.equals(result.payment._id),
        );
        if (!alreadyApplied) {
          throw new ConflictException(
            'Idempotency key is already used by another payment',
          );
        }
        return { debt, result };
      }

      if (
        debt.status === DebtStatus.SETTLED ||
        debt.status === DebtStatus.WRITTEN_OFF
      ) {
        throw new BadRequestException(`Debt is ${debt.status}`);
      }
      if (dto.amount > debt.remaining) {
        throw new BadRequestException('Amount exceeds remaining balance');
      }

      debt.remaining = Math.max(0, debt.remaining - dto.amount);
      debt.paymentIds.push(result.payment._id);
      debt.status =
        debt.remaining === 0 ? DebtStatus.SETTLED : DebtStatus.PARTIAL;
      await debt.save({ session });

      if (debt.status === DebtStatus.SETTLED) {
        await this.installmentModel.updateMany(
          {
            debtId: debt._id,
            status: {
              $in: [
                InstallmentStatus.SCHEDULED,
                InstallmentStatus.DUE,
                InstallmentStatus.OVERDUE,
              ],
            },
          },
          { $set: { status: InstallmentStatus.PAID, paidAt: new Date() } },
          { session },
        );
      }

      return { debt, result };
    });

    if (!committed.result.idempotent) {
      await this.runPaymentPostCommitEffects(
        paymentDto,
        { operatorUserId, actorId: operatorUserId, request },
        committed.result,
      );
    }

    return {
      debt: committed.debt.toObject(),
      payment: committed.result.payment,
      ledger: committed.result.ledger,
      idempotent: committed.result.idempotent,
    };
  }

  async listDebts(clubId: string, query: ListDebtsQueryDto) {
    const filter: QueryFilter<DebtDocument> = {
      clubId: this.toObjectId(clubId, 'clubId'),
    };
    if (query.status) filter.status = query.status;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.debtModel
        .find(filter)
        .sort({ dueAt: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.debtModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
  }

  async getDebt(clubId: string, debtId: string) {
    const debt = await this.findClubDebt(clubId, debtId);
    const installments = await this.installmentModel
      .find({ debtId: debt._id })
      .sort({ sequence: 1 })
      .lean();
    return { debt: debt.toObject(), installments };
  }

  // ── Internals ───────────────────────────────────────────────────────────

  private normalizeSplit(
    input: RecordPaymentDto['amount'],
  ): PaymentAmountSplit {
    const discount = input.discount ?? 0;
    const tax = input.tax ?? 0;
    const providerShare = input.providerShare ?? 0;
    const platformFee = input.platformFee ?? 0;
    const gatewayFee = input.gatewayFee ?? 0;
    const net =
      input.net ??
      input.gross - discount - tax - providerShare - platformFee - gatewayFee;
    return {
      pricingVersion: 'finance-split-v1',
      gross: input.gross,
      discount,
      tax,
      providerShare,
      platformFee,
      gatewayFee,
      net,
    };
  }

  /**
   * Best-effort: when providerShare is omitted and a club CompensationRule
   * (REVENUE_PERCENT) exists for the coach/club, compute providerShare.
   */
  private async normalizeSplitWithCompensation(
    input: RecordPaymentDto['amount'],
    related: { clubId?: Types.ObjectId; coachUserId?: Types.ObjectId },
    session?: ClientSession,
  ): Promise<PaymentAmountSplit> {
    if (input.providerShare !== undefined && input.providerShare !== null) {
      return this.normalizeSplit(input);
    }
    if (!related.clubId) {
      return this.normalizeSplit(input);
    }

    const now = new Date();
    const coachMatch = related.coachUserId
      ? {
          $or: [
            { coachUserId: related.coachUserId },
            { coachUserId: { $exists: false } },
            { coachUserId: null },
          ],
        }
      : {};

    const rule = await this.compensationModel
      .findOne({
        clubId: related.clubId,
        status: EntityStatus.ACTIVE,
        basis: CompensationBasis.REVENUE_PERCENT,
        'effective.from': { $lte: now },
        $and: [
          {
            $or: [
              { 'effective.to': { $exists: false } },
              { 'effective.to': null },
              { 'effective.to': { $gte: now } },
            ],
          },
          ...(related.coachUserId ? [coachMatch] : []),
        ],
      })
      .sort({ coachUserId: -1, 'effective.from': -1 })
      .session(session ?? null)
      .lean();

    if (!rule) {
      return this.normalizeSplit(input);
    }

    const providerShare = Math.round((input.gross * rule.rate) / 100);
    return this.normalizeSplit({ ...input, providerShare });
  }

  private assertSplitIdentity(split: PaymentAmountSplit) {
    const expected =
      split.gross -
      split.discount -
      split.tax -
      split.providerShare -
      split.platformFee -
      split.gatewayFee;
    if (split.net !== expected) {
      throw new BadRequestException(
        `Invalid amount split: net must equal gross − discount − tax − providerShare − platformFee − gatewayFee (expected ${expected}, got ${split.net})`,
      );
    }
    if (split.net < 0) {
      throw new BadRequestException(
        'Invalid amount split: net cannot be negative',
      );
    }
  }

  private normalizeTenders(
    channel: PaymentChannel,
    input: RecordPaymentDto['tenders'],
    paid: number,
  ): PaymentTender[] | undefined {
    if (channel !== PaymentChannel.MIXED) {
      if (input?.length) {
        throw new BadRequestException(
          'tenders are only allowed when channel is mixed',
        );
      }
      return undefined;
    }

    if (!input || input.length < 2) {
      throw new BadRequestException(
        'Mixed payments require at least two tender rows',
      );
    }

    const allowed = new Set<PaymentChannel>([
      PaymentChannel.CASH,
      PaymentChannel.POS,
      PaymentChannel.CARD_TO_CARD,
    ]);
    const seen = new Set<PaymentChannel>();
    let total = 0;
    for (const tender of input) {
      if (!allowed.has(tender.channel)) {
        throw new BadRequestException(
          'Mixed tender channel must be cash, pos, or card_to_card',
        );
      }
      if (seen.has(tender.channel)) {
        throw new BadRequestException('Mixed tender channels must be unique');
      }
      seen.add(tender.channel);
      total += tender.amount;
    }
    if (total !== paid) {
      throw new BadRequestException(
        `Mixed tender total must equal collected amount (${paid})`,
      );
    }
    return input.map((tender) => ({ ...tender }));
  }

  /**
   * Post a reversing ADJUSTMENT for a wallet top-up located by the original
   * payment `idempotencyKey`, and pull the amount back out of the wallet
   * cache (balance may go negative — clawback becomes wallet debt).
   * Idempotent per `dedupeKey`. Returns null when no original entry exists.
   */
  async reverseWalletTopUp(
    originalIdempotencyKey: string,
    opts: { dedupeKey: string; note?: string },
  ): Promise<{ ledgerId: string; idempotent: boolean } | null> {
    return this.transactions.run(async (session) => {
      const existing = await this.ledgerModel
        .findOne({ dedupeKey: opts.dedupeKey })
        .session(session)
        .lean();
      if (existing) {
        return { ledgerId: existing._id.toString(), idempotent: true };
      }
      const payment = await this.paymentModel
        .findOne({ idempotencyKey: originalIdempotencyKey })
        .session(session)
        .lean();
      if (!payment) return null;
      const original = await this.ledgerModel
        .findOne({ paymentId: payment._id })
        .session(session)
        .lean();
      if (!original) return null;

      const reverseLines = original.lines.map((line) => ({
        account: line.account,
        debit: line.credit,
        credit: line.debit,
        party: line.party,
      }));
      this.assertBalanced(reverseLines);
      const reversal = new this.ledgerModel({
        kind: LedgerEntryKind.ADJUSTMENT,
        paymentId: payment._id,
        lines: reverseLines,
        split: original.split,
        related: original.related,
        dedupeKey: opts.dedupeKey,
        occurredAt: new Date(),
        note: opts.note,
      });
      await reversal.save({ session });

      const walletLine = original.lines.find(
        (line) =>
          line.account === LedgerAccount.WALLET_LIABILITY &&
          line.credit > 0 &&
          line.party,
      );
      if (walletLine?.party) {
        const wallet = await this.getOrCreateWallet(
          { type: walletLine.party.type, id: walletLine.party.id },
          session,
        );
        await this.walletModel.updateOne(
          { _id: wallet._id },
          { $inc: { balance: -walletLine.credit } },
          { session },
        );
      }
      return { ledgerId: reversal._id.toString(), idempotent: false };
    });
  }

  /**
   * Build balanced double-entry lines for a captured payment.
   * Debit channel asset for paid (= gross − discount);
   * credit tax / platform / gateway / provider / net shares.
   */
  private buildPaymentLines(
    channel: PaymentChannel,
    split: PaymentAmountSplit,
    related: PaymentRelated,
    purpose: PaymentPurpose,
    walletOwner?: WalletOwnerRef,
    tenders?: PaymentTender[],
  ): LedgerLine[] {
    const paid = split.gross - split.discount;
    const lines: LedgerLine[] = [];

    if (purpose === PaymentPurpose.WALLET_TOPUP) {
      lines.push({
        account: this.channelDebitAccount(channel),
        debit: paid,
        credit: 0,
      });
      lines.push({
        account: LedgerAccount.WALLET_LIABILITY,
        debit: 0,
        credit: paid,
        party: walletOwner
          ? {
              type: walletOwner.type,
              id: this.toObjectId(walletOwner.id, 'walletOwner.id'),
            }
          : undefined,
      });
      return lines;
    }

    if (channel === PaymentChannel.WALLET) {
      lines.push({
        account: LedgerAccount.WALLET_LIABILITY,
        debit: paid,
        credit: 0,
        party: walletOwner
          ? {
              type: walletOwner.type,
              id: this.toObjectId(walletOwner.id, 'walletOwner.id'),
            }
          : undefined,
      });
    } else if (channel === PaymentChannel.MIXED) {
      for (const tender of tenders ?? []) {
        lines.push({
          account: this.channelDebitAccount(tender.channel),
          debit: tender.amount,
          credit: 0,
        });
      }
    } else {
      lines.push({
        account: this.channelDebitAccount(channel),
        debit: paid,
        credit: 0,
      });
    }

    if (split.tax > 0) {
      lines.push({
        account: LedgerAccount.TAX_PAYABLE,
        debit: 0,
        credit: split.tax,
      });
    }
    if (split.platformFee > 0) {
      lines.push({
        account: LedgerAccount.PLATFORM_REVENUE,
        debit: 0,
        credit: split.platformFee,
      });
    }
    if (split.gatewayFee > 0) {
      lines.push({
        account: LedgerAccount.GATEWAY_CLEARING,
        debit: 0,
        credit: split.gatewayFee,
      });
    }
    if (split.providerShare > 0) {
      lines.push({
        account: LedgerAccount.PROVIDER_PAYABLE,
        debit: 0,
        credit: split.providerShare,
        party: related.coachUserId
          ? { type: WalletOwnerType.COACH, id: related.coachUserId }
          : related.clubId
            ? { type: WalletOwnerType.CLUB, id: related.clubId }
            : undefined,
      });
    }
    if (split.net > 0) {
      lines.push({
        account: LedgerAccount.PROVIDER_PAYABLE,
        debit: 0,
        credit: split.net,
        party: related.clubId
          ? { type: WalletOwnerType.CLUB, id: related.clubId }
          : related.coachUserId
            ? { type: WalletOwnerType.COACH, id: related.coachUserId }
            : undefined,
      });
    }

    // If discounts were granted, the paid amount is already reduced;
    // optionally mirror discount as an expense for reporting when discount > 0
    // and credits would otherwise under-balance (should not happen with identity).

    return lines;
  }

  private channelDebitAccount(channel: PaymentChannel): LedgerAccount {
    switch (channel) {
      case PaymentChannel.CASH:
        return LedgerAccount.CASH;
      case PaymentChannel.POS:
        return LedgerAccount.POS;
      case PaymentChannel.CARD_TO_CARD:
        return LedgerAccount.CASH;
      case PaymentChannel.ZARINPAL:
        return LedgerAccount.GATEWAY_CLEARING;
      case PaymentChannel.WALLET:
        return LedgerAccount.WALLET_LIABILITY;
      case PaymentChannel.MIXED:
        return LedgerAccount.CASH;
      default:
        return LedgerAccount.CASH;
    }
  }

  private assertBalanced(lines: LedgerLine[]) {
    const debits = lines.reduce((s, l) => s + l.debit, 0);
    const credits = lines.reduce((s, l) => s + l.credit, 0);
    if (debits !== credits) {
      throw new BadRequestException(
        `Unbalanced ledger entry: debits=${debits} credits=${credits}`,
      );
    }
    if (debits === 0) {
      throw new BadRequestException('Ledger entry has no amount');
    }
  }

  private async applyWalletSideEffects(
    channel: PaymentChannel,
    purpose: PaymentPurpose,
    split: PaymentAmountSplit,
    owner?: WalletOwnerRef,
    session?: ClientSession,
  ) {
    if (!owner) return;
    const paid = split.gross - split.discount;

    if (purpose === PaymentPurpose.WALLET_TOPUP) {
      const wallet = await this.getOrCreateWallet(owner, session);
      await this.walletModel.updateOne(
        { _id: wallet._id },
        { $inc: { balance: paid } },
        { session },
      );
      return;
    }

    if (channel === PaymentChannel.WALLET) {
      const wallet = await this.getOrCreateWallet(owner, session);
      const debit = await this.walletModel.updateOne(
        { _id: wallet._id, balance: { $gte: paid } },
        { $inc: { balance: -paid } },
        { session },
      );
      if (debit.modifiedCount !== 1) {
        throw new BadRequestException('Insufficient wallet balance');
      }
    }
  }

  private mapRelated(related?: RecordPaymentDto['related']): PaymentRelated {
    if (!related) return {};
    return {
      bookingId: related.bookingId
        ? this.toObjectId(related.bookingId, 'related.bookingId')
        : undefined,
      membershipId: related.membershipId
        ? this.toObjectId(related.membershipId, 'related.membershipId')
        : undefined,
      membershipPlanId: related.membershipPlanId
        ? this.toObjectId(related.membershipPlanId, 'related.membershipPlanId')
        : undefined,
      platformPlanId: related.platformPlanId
        ? this.toObjectId(related.platformPlanId, 'related.platformPlanId')
        : undefined,
      platformSubscriptionId: related.platformSubscriptionId
        ? this.toObjectId(
            related.platformSubscriptionId,
            'related.platformSubscriptionId',
          )
        : undefined,
      packageId: related.packageId
        ? this.toObjectId(related.packageId, 'related.packageId')
        : undefined,
      clubId: related.clubId
        ? this.toObjectId(related.clubId, 'related.clubId')
        : undefined,
      coachUserId: related.coachUserId
        ? this.toObjectId(related.coachUserId, 'related.coachUserId')
        : undefined,
    };
  }

  private async computeShiftExpected(
    clubId: string,
    from: Date,
    to: Date,
  ): Promise<CashShiftTotals> {
    const clubOid = this.toObjectId(clubId, 'clubId');
    const entries = await this.ledgerModel
      .find({
        'related.clubId': clubOid,
        occurredAt: { $gte: from, $lte: to },
        kind: {
          $in: [LedgerEntryKind.PAYMENT, LedgerEntryKind.WALLET_TOPUP],
        },
      })
      .lean();

    const totals: CashShiftTotals = {
      cash: 0,
      pos: 0,
      cardToCard: 0,
      other: 0,
    };

    for (const entry of entries) {
      for (const line of entry.lines) {
        if (line.debit <= 0) continue;
        switch (line.account) {
          case LedgerAccount.CASH:
            totals.cash += line.debit;
            break;
          case LedgerAccount.POS:
            totals.pos += line.debit;
            break;
          case LedgerAccount.GATEWAY_CLEARING:
            totals.other += line.debit;
            break;
          default:
            break;
        }
      }
    }

    // Card-to-card posts to CASH; separate it for shift reconciliation.
    const cardPayments = await this.paymentModel
      .find({
        'related.clubId': clubOid,
        channel: {
          $in: [PaymentChannel.CARD_TO_CARD, PaymentChannel.MIXED],
        },
        status: PaymentStatus.CAPTURED,
        capturedAt: { $gte: from, $lte: to },
      })
      .lean();
    for (const p of cardPayments) {
      const cardAmount =
        p.channel === PaymentChannel.CARD_TO_CARD
          ? p.amount.gross - p.amount.discount
          : (p.tenders ?? [])
              .filter(
                (tender) => tender.channel === PaymentChannel.CARD_TO_CARD,
              )
              .reduce((sum, tender) => sum + tender.amount, 0);
      totals.cardToCard += cardAmount;
      totals.cash = Math.max(0, totals.cash - cardAmount);
    }

    return totals;
  }

  private async findClubShift(clubId: string, shiftId: string) {
    if (!Types.ObjectId.isValid(shiftId)) {
      throw new NotFoundException('Cash shift not found');
    }
    const shift = await this.cashShiftModel.findOne({
      _id: new Types.ObjectId(shiftId),
      clubId: this.toObjectId(clubId, 'clubId'),
    });
    if (!shift) throw new NotFoundException('Cash shift not found');
    return shift;
  }

  private async findClubDebt(
    clubId: string,
    debtId: string,
    session?: ClientSession,
  ) {
    if (!Types.ObjectId.isValid(debtId)) {
      throw new NotFoundException('Debt not found');
    }
    const debt = await this.debtModel
      .findOne({
        _id: new Types.ObjectId(debtId),
        clubId: this.toObjectId(clubId, 'clubId'),
      })
      .session(session ?? null);
    if (!debt) throw new NotFoundException('Debt not found');
    return debt;
  }

  private toObjectId(
    id: string | Types.ObjectId,
    label: string,
  ): Types.ObjectId {
    if (id instanceof Types.ObjectId) return id;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return new Types.ObjectId(id);
  }
}
