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
import type { QueryFilter } from 'mongoose';
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
  MembershipStatus,
  AnalyticsPeriod,
  PaymentChannel,
  PaymentPurpose,
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
import { AuditService } from '../audit/audit.service';
import { User, UserDocument } from '../schemas/user.schema';
import {
  CashShift,
  CashShiftDocument,
  CashShiftTotals,
} from '../schemas/cash-shift.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  ClubMembership,
  ClubMembershipDocument,
} from '../schemas/club-membership.schema';
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
  ListPayoutsQueryDto,
  RecordDebtPaymentDto,
  RecordManualPaymentDto,
  RecordPaymentDto,
  TopUpWalletDto,
  UpsertCompensationRuleDto,
} from './dto/finance.dto';

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
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly audit: AuditService,
    @Inject(forwardRef(() => ReferralService))
    private readonly referral: ReferralService,
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

  async getOrCreateWallet(owner: WalletOwnerRef) {
    const ownerId = this.toObjectId(owner.id, 'owner.id');
    const existing = await this.walletModel
      .findOne({ 'owner.type': owner.type, 'owner.id': ownerId })
      .lean();
    if (existing) return existing;

    try {
      const created = await this.walletModel.create({
        owner: { type: owner.type, id: ownerId },
        balance: 0,
        currency: 'IRT',
      });
      return created.toObject();
    } catch (err) {
      // Race on unique index — re-read.
      if ((err as { code?: number }).code === 11000) {
        const again = await this.walletModel
          .findOne({ 'owner.type': owner.type, 'owner.id': ownerId })
          .lean();
        if (again) return again;
      }
      throw err;
    }
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

  async topUpWallet(userId: string, dto: TopUpWalletDto, request?: Request) {
    const channel = dto.channel ?? PaymentChannel.ZARINPAL;
    if (
      channel !== PaymentChannel.ZARINPAL &&
      channel !== PaymentChannel.CASH &&
      channel !== PaymentChannel.POS &&
      channel !== PaymentChannel.CARD_TO_CARD
    ) {
      throw new BadRequestException('Unsupported top-up channel');
    }

    return this.recordPayment(
      {
        purpose: PaymentPurpose.WALLET_TOPUP,
        channel,
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
          orderId:
            dto.orderId ?? `wallet-topup:${userId}:${dto.idempotencyKey}`,
          authority: dto.authority,
          gatewayRefId: dto.gatewayRefId,
        },
        payer: { userId },
        related: {},
        idempotencyKey: dto.idempotencyKey,
      },
      {
        actorId: userId,
        request,
        walletOwner: { type: WalletOwnerType.USER, id: userId },
      },
    );
  }

  // ── Payments ────────────────────────────────────────────────────────────

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
    },
  ) {
    const existing = await this.paymentModel
      .findOne({ idempotencyKey: dto.idempotencyKey })
      .lean();
    if (existing) {
      const ledger = await this.ledgerModel
        .findOne({ paymentId: existing._id })
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
      const wallet = await this.getOrCreateWallet(walletOwner);
      const paid = split.gross - split.discount;
      if (wallet.balance < paid) {
        throw new BadRequestException('Insufficient wallet balance');
      }
    }

    const paymentDoc = await this.paymentModel.create({
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

      try {
        ledger = await this.ledgerModel.create({
          kind,
          paymentId: paymentDoc._id,
          lines,
          split,
          related,
          dedupeKey: `payment:${dto.idempotencyKey}`,
          occurredAt: now,
          note: dto.note,
        });
      } catch (err) {
        if ((err as { code?: number }).code === 11000) {
          // Concurrent duplicate — return the winning payment.
          const again = await this.paymentModel
            .findOne({ idempotencyKey: dto.idempotencyKey })
            .lean();
          const againLedger = again
            ? await this.ledgerModel.findOne({ paymentId: again._id }).lean()
            : null;
          return {
            payment: again ?? paymentDoc.toObject(),
            ledger: againLedger,
            idempotent: true as const,
          };
        }
        throw err;
      }

      await this.applyWalletSideEffects(
        dto.channel,
        dto.purpose,
        split,
        walletOwner,
      );

      this.audit.log({
        action: AuditAction.FINANCE_PAYMENT_RECORDED,
        actorId: opts?.actorId ?? opts?.operatorUserId,
        targetUserId: dto.payer.userId,
        metadata: {
          paymentId: paymentDoc._id.toString(),
          channel: dto.channel,
          purpose: dto.purpose,
          net: split.net,
          clubId: related.clubId?.toString(),
        },
        request: opts?.request,
      });
      this.audit.log({
        action: AuditAction.FINANCE_LEDGER_POSTED,
        actorId: opts?.actorId ?? opts?.operatorUserId,
        metadata: {
          ledgerEntryId: ledger._id.toString(),
          paymentId: paymentDoc._id.toString(),
          kind,
        },
        request: opts?.request,
      });

      // Best-effort invoice projection for receipt UI.
      try {
        await this.issueInvoiceFromPaymentInternal(paymentDoc.toObject(), {
          actorId: opts?.actorId ?? opts?.operatorUserId,
          request: opts?.request,
        });
      } catch {
        // Non-fatal — invoice can be issued later via from-payment endpoint.
      }
    }

    return {
      payment: paymentDoc.toObject(),
      ledger: ledger?.toObject() ?? null,
      idempotent: false as const,
    };
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
    const filter: QueryFilter<PaymentDocument> = {};
    if (query.status) filter.status = { $in: query.status };
    if (query.channel) filter.channel = { $in: query.channel };
    if (query.purpose) filter.purpose = { $in: query.purpose };
    if (query.clubId) {
      filter['related.clubId'] = this.toObjectId(query.clubId, 'clubId');
    }
    if (query.payerUserId) {
      filter['payer.userId'] = this.toObjectId(
        query.payerUserId,
        'payerUserId',
      );
    }
    Object.assign(
      filter,
      createSearchFilter(query.search, [
        'reference.orderId',
        'reference.authority',
        'reference.gatewayRefId',
        'reference.externalRef',
        'idempotencyKey',
        'payer.guest.name',
        'payer.guest.phone',
        'operator.note',
      ]),
    );

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(
      query,
      {
        createdAt: 'createdAt',
        capturedAt: 'capturedAt',
        amount: 'amount.gross',
        status: 'status',
        channel: 'channel',
        purpose: 'purpose',
        orderId: 'reference.orderId',
      },
      { createdAt: -1 },
    );
    const [items, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.paymentModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
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

    const [newMembers, activeMembers, cancelledMembers, payments] =
      await Promise.all([
        this.membershipModel.countDocuments({
          clubId: clubOid,
          createdAt: { $gte: since },
        }),
        this.membershipModel.countDocuments({
          clubId: clubOid,
          status: MembershipStatus.ACTIVE,
        }),
        this.membershipModel.countDocuments({
          clubId: clubOid,
          status: MembershipStatus.CANCELLED,
          updatedAt: { $gte: since },
        }),
        this.paymentModel
          .find({
            'related.clubId': clubOid,
            status: PaymentStatus.CAPTURED,
            capturedAt: { $gte: since },
          })
          .select({ amount: 1, capturedAt: 1, createdAt: 1 })
          .lean(),
      ]);

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
    const filter: QueryFilter<LedgerEntryDocument> = {};
    if (query.kind) filter.kind = { $in: query.kind };
    if (query.clubId) {
      filter['related.clubId'] = this.toObjectId(query.clubId, 'clubId');
    }
    if (query.paymentId) {
      filter.paymentId = this.toObjectId(query.paymentId, 'paymentId');
    }
    if (query.from || query.to) {
      filter.occurredAt = {};
      if (query.from) {
        (filter.occurredAt as Record<string, Date>).$gte = new Date(query.from);
      }
      if (query.to) {
        (filter.occurredAt as Record<string, Date>).$lte = new Date(query.to);
      }
    }
    Object.assign(
      filter,
      createSearchFilter(query.search, ['dedupeKey', 'note']),
    );

    const { page, pageSize } = resolvePageSize(query);
    const sort = resolveListSort(
      query,
      {
        occurredAt: 'occurredAt',
        createdAt: 'createdAt',
        kind: 'kind',
        amount: 'split.gross',
        dedupeKey: 'dedupeKey',
      },
      { occurredAt: -1 },
    );
    const [items, total] = await Promise.all([
      this.ledgerModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.ledgerModel.countDocuments(filter),
    ]);
    return paginatedResult(items, total, page, pageSize);
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
          { new: true },
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

  async createDebt(clubId: string, dto: CreateDebtDto) {
    if (!dto.holder.userId && !dto.holder.guest) {
      throw new BadRequestException(
        'holder.userId or holder.guest is required',
      );
    }

    const debt = await this.debtModel.create({
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
      await this.installmentModel.insertMany(docs);
    }

    const installments = await this.installmentModel
      .find({ debtId: debt._id })
      .sort({ sequence: 1 })
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
    const debt = await this.findClubDebt(clubId, debtId);
    if (
      debt.status === DebtStatus.SETTLED ||
      debt.status === DebtStatus.WRITTEN_OFF
    ) {
      throw new BadRequestException(`Debt is ${debt.status}`);
    }
    if (dto.amount > debt.remaining) {
      throw new BadRequestException('Amount exceeds remaining balance');
    }
    if (
      !MANUAL_CHANNELS.has(dto.channel) &&
      dto.channel !== PaymentChannel.WALLET
    ) {
      throw new BadRequestException('Unsupported debt payment channel');
    }

    const result = await this.recordPayment(
      {
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
        payer: {
          userId: debt.holder.userId?.toString(),
          guest: debt.holder.guest
            ? {
                name: debt.holder.guest.name,
                phone: debt.holder.guest.phone,
              }
            : undefined,
        },
        related: { clubId },
        idempotencyKey: dto.idempotencyKey,
        operatorNote: dto.operatorNote,
      },
      { operatorUserId, actorId: operatorUserId, request },
    );

    if (!result.idempotent) {
      debt.remaining = Math.max(0, debt.remaining - dto.amount);
      debt.paymentIds.push(result.payment._id);
      debt.status =
        debt.remaining === 0 ? DebtStatus.SETTLED : DebtStatus.PARTIAL;
      await debt.save();

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
        );
      }
    }

    return {
      debt: debt.toObject(),
      payment: result.payment,
      ledger: result.ledger,
      idempotent: result.idempotent,
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
    const payment = await this.paymentModel
      .findOne({ idempotencyKey: originalIdempotencyKey })
      .lean();
    if (!payment) return null;
    const original = await this.ledgerModel
      .findOne({ paymentId: payment._id })
      .lean();
    if (!original) return null;

    const reverseLines = original.lines.map((line) => ({
      account: line.account,
      debit: line.credit,
      credit: line.debit,
      party: line.party,
    }));
    this.assertBalanced(reverseLines);

    let reversal: LedgerEntryDocument;
    try {
      reversal = await this.ledgerModel.create({
        kind: LedgerEntryKind.ADJUSTMENT,
        paymentId: payment._id,
        lines: reverseLines,
        split: original.split,
        related: original.related,
        dedupeKey: opts.dedupeKey,
        occurredAt: new Date(),
        note: opts.note,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        const existing = await this.ledgerModel
          .findOne({ dedupeKey: opts.dedupeKey })
          .lean();
        return existing
          ? { ledgerId: existing._id.toString(), idempotent: true }
          : null;
      }
      throw err;
    }

    const walletLine = original.lines.find(
      (line) =>
        line.account === LedgerAccount.WALLET_LIABILITY &&
        line.credit > 0 &&
        line.party,
    );
    if (walletLine?.party) {
      const wallet = await this.getOrCreateWallet({
        type: walletLine.party.type,
        id: walletLine.party.id,
      });
      await this.walletModel.updateOne(
        { _id: wallet._id },
        { $inc: { balance: -walletLine.credit } },
      );
    }

    return { ledgerId: reversal._id.toString(), idempotent: false };
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
  ) {
    if (!owner) return;
    const paid = split.gross - split.discount;

    if (purpose === PaymentPurpose.WALLET_TOPUP) {
      const wallet = await this.getOrCreateWallet(owner);
      await this.walletModel.updateOne(
        { _id: wallet._id },
        { $inc: { balance: paid } },
      );
      this.audit.log({
        action: AuditAction.FINANCE_WALLET_TOPUP,
        targetUserId:
          owner.type === WalletOwnerType.USER ? owner.id : undefined,
        metadata: {
          ownerType: owner.type,
          ownerId: owner.id.toString(),
          amount: paid,
        },
      });
      return;
    }

    if (channel === PaymentChannel.WALLET) {
      const wallet = await this.getOrCreateWallet(owner);
      if (wallet.balance < paid) {
        throw new BadRequestException('Insufficient wallet balance');
      }
      await this.walletModel.updateOne(
        { _id: wallet._id, balance: { $gte: paid } },
        { $inc: { balance: -paid } },
      );
      const refreshed = await this.walletModel.findById(wallet._id).lean();
      if (!refreshed || refreshed.balance < 0) {
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

  private async findClubDebt(clubId: string, debtId: string) {
    if (!Types.ObjectId.isValid(debtId)) {
      throw new NotFoundException('Debt not found');
    }
    const debt = await this.debtModel.findOne({
      _id: new Types.ObjectId(debtId),
      clubId: this.toObjectId(clubId, 'clubId'),
    });
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
