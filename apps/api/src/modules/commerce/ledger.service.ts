import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import type { ClientSession } from "mongoose";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";

@Injectable()
export class LedgerService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}
  private async account(code: string, input: Record<string, unknown>, session?: ClientSession) {
    return this.models.LedgerAccount.findOneAndUpdate(
      { code } as any,
      { $setOnInsert: { code, status: "active", ...input } },
      { upsert: true, returnDocument: "after", ...(session ? { session } : {}) },
    ).lean() as any;
  }
  async wallet(userId: string, currency = "IRR", session?: ClientSession) {
    const wallet = (await this.models.Wallet.findOneAndUpdate(
      { "owner.type": "user", "owner.id": objectIdFrom(userId), currency } as any,
      {
        $setOnInsert: {
          owner: { type: "user", id: objectIdFrom(userId) },
          currency,
          status: "active",
          createdBy: objectIdFrom(userId),
        },
      },
      { upsert: true, returnDocument: "after", ...(session ? { session } : {}) },
    ).lean()) as any;
    const account = await this.account(
      `wallet:user:${userId}:${currency}`,
      {
        walletId: wallet._id,
        owner: { type: "user", id: objectIdFrom(userId) },
        type: "liability",
        normalSide: "credit",
        currency,
      },
      session,
    );
    return { wallet, account };
  }
  private async platformAccount(
    kind: "gateway-clearing" | "booking-escrow",
    currency: string,
    session?: ClientSession,
  ) {
    return this.account(
      `platform:${kind}:${currency}`,
      {
        owner: { type: "platform" },
        type: kind === "gateway-clearing" ? "asset" : "liability",
        normalSide: kind === "gateway-clearing" ? "debit" : "credit",
        currency,
      },
      session,
    );
  }
  private async cancellationRevenueAccount(
    organizationId: string,
    currency: string,
    session?: ClientSession,
  ) {
    return this.account(
      `organization:cancellation-revenue:${organizationId}:${currency}`,
      {
        owner: { type: "organization", id: objectIdFrom(organizationId) },
        type: "revenue",
        normalSide: "credit",
        currency,
      },
      session,
    );
  }
  private async organizationRevenueAccount(
    organizationId: string,
    kind: "membership" | "booking" | "commission",
    currency: string,
    session?: ClientSession,
  ) {
    return this.account(
      `organization:${kind}-revenue:${organizationId}:${currency}`,
      {
        owner: { type: "organization", id: objectIdFrom(organizationId) },
        type: "revenue",
        normalSide: "credit",
        currency,
      },
      session,
    );
  }
  private async organizationPayableAccount(
    organizationId: string,
    currency: string,
    session?: ClientSession,
  ) {
    return this.account(
      `organization:settlement-payable:${organizationId}:${currency}`,
      {
        owner: { type: "organization", id: objectIdFrom(organizationId) },
        type: "liability",
        normalSide: "credit",
        currency,
      },
      session,
    );
  }
  private async platformCommissionAccount(currency: string, session?: ClientSession) {
    return this.account(
      `platform:commission-revenue:${currency}`,
      { owner: { type: "platform" }, type: "revenue", normalSide: "credit", currency },
      session,
    );
  }
  private async coachPayableAccount(
    coachProfileId: string,
    coachUserId: string,
    currency: string,
    session?: ClientSession,
  ) {
    return this.account(
      `coach:settlement-payable:${coachProfileId}:${currency}`,
      {
        owner: {
          type: "coach",
          id: objectIdFrom(coachProfileId),
          userId: objectIdFrom(coachUserId),
        },
        type: "liability",
        normalSide: "credit",
        currency,
      },
      session,
    );
  }
  async releaseBookingRevenue(
    actorId: string,
    bookingId: string,
    organizationId: string,
    grossMinor: string,
    commissionMinor: string,
    currency: string,
    coach: { profileId: string; userId: string; amountMinor: string } | undefined,
    session: ClientSession,
  ) {
    const coachAmount = BigInt(coach?.amountMinor ?? "0");
    const escrow = await this.platformAccount("booking-escrow", currency, session),
      payable = await this.organizationPayableAccount(organizationId, currency, session),
      commission = await this.platformCommissionAccount(currency, session),
      coachPayable =
        coachAmount > 0n && coach
          ? await this.coachPayableAccount(coach.profileId, coach.userId, currency, session)
          : null,
      net = (BigInt(grossMinor) - BigInt(commissionMinor) - coachAmount).toString();
    return this.post(
      { type: "booking", id: bookingId, operation: "revenue_release" },
      "شناسایی سهم رزرو و کمیسیون",
      [
        { accountId: escrow._id, side: "debit", amountMinor: grossMinor, currency },
        { accountId: payable._id, side: "credit", amountMinor: net, currency },
        ...(coachPayable
          ? [
              {
                accountId: coachPayable._id,
                side: "credit",
                amountMinor: coach!.amountMinor,
                currency,
              },
            ]
          : []),
        ...(BigInt(commissionMinor) > 0n
          ? [{ accountId: commission._id, side: "credit", amountMinor: commissionMinor, currency }]
          : []),
      ],
      actorId,
      `release:${bookingId}`,
      session,
    );
  }
  async paySettlement(
    actorId: string,
    settlementId: string,
    beneficiary: { type: "organization" | "coach"; id: string; userId?: string },
    amountMinor: string,
    currency: string,
    session: ClientSession,
  ) {
    const payable =
        beneficiary.type === "coach"
          ? await this.coachPayableAccount(
              beneficiary.id,
              beneficiary.userId ?? beneficiary.id,
              currency,
              session,
            )
          : await this.organizationPayableAccount(beneficiary.id, currency, session),
      clearing = await this.platformAccount("gateway-clearing", currency, session);
    return this.post(
      { type: "settlement", id: settlementId, operation: "payout" },
      beneficiary.type === "coach" ? "پرداخت تسویه مربی" : "پرداخت تسویه سازمان",
      [
        { accountId: payable._id, side: "debit", amountMinor, currency },
        { accountId: clearing._id, side: "credit", amountMinor, currency },
      ],
      actorId,
      `settlement:${settlementId}`,
      session,
    );
  }
  async payMembership(
    userId: string,
    contractId: string,
    organizationId: string,
    amountMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const { account } = await this.wallet(userId, currency, session);
    const balance = await this.balance(String(account._id), session);
    if (balance < BigInt(amountMinor))
      throw new ApiError("INSUFFICIENT_WALLET_BALANCE", "موجودی کیف پول کافی نیست.", 409, {
        balance_minor: balance.toString(),
        required_minor: amountMinor,
      });
    const revenue = await this.organizationRevenueAccount(
      organizationId,
      "membership",
      currency,
      session,
    );
    return this.post(
      { type: "membership_contract", id: contractId, operation: "wallet_purchase" },
      "خرید عضویت",
      [
        { accountId: account._id, side: "debit", amountMinor, currency },
        { accountId: revenue._id, side: "credit", amountMinor, currency },
      ],
      userId,
      key,
      session,
    );
  }
  async balance(accountId: string, session?: ClientSession) {
    const rows = await this.models.LedgerTransaction.aggregate([
      { $match: { status: "posted", "entries.accountId": objectIdFrom(accountId) } },
      { $unwind: "$entries" },
      { $match: { "entries.accountId": objectIdFrom(accountId) } },
      { $group: { _id: "$entries.side", total: { $sum: { $toDecimal: "$entries.amountMinor" } } } },
    ]).session(session ?? null);
    let credit = 0n;
    let debit = 0n;
    for (const row of rows as any[]) {
      const value = BigInt(String(row.total));
      if (row._id === "credit") credit = value;
      else debit = value;
    }
    return credit - debit;
  }
  private async post(
    reference: { type: string; id: string; operation: string },
    description: string,
    entries: any[],
    actorUserId: string,
    idempotencyKey: string,
    session: ClientSession,
  ) {
    const existing = await this.models.LedgerTransaction.findOne({
      "reference.type": reference.type,
      "reference.id": objectIdFrom(reference.id),
      "reference.operation": reference.operation,
    })
      .session(session)
      .lean();
    if (existing) return existing;
    const [transaction] = await this.models.LedgerTransaction.create(
      [
        {
          reference: { ...reference, id: objectIdFrom(reference.id) },
          description,
          idempotencyKey,
          entries,
          postedAt: new Date(),
          status: "posted",
          createdBy: objectIdFrom(actorUserId),
        },
      ],
      { session },
    );
    if (!transaction) throw new ApiError("LEDGER_WRITE_FAILED", "ثبت سند مالی انجام نشد.", 500);
    return transaction;
  }
  async topUp(
    userId: string,
    paymentId: string,
    amountMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const amount = BigInt(amountMinor);
    if (amount <= 0n) throw new ApiError("INVALID_AMOUNT", "مبلغ نامعتبر است.", 422);
    const { account } = await this.wallet(userId, currency, session);
    const clearing = await this.platformAccount("gateway-clearing", currency, session);
    return this.post(
      { type: "payment", id: paymentId, operation: "wallet_top_up" },
      "شارژ کیف پول",
      [
        { accountId: clearing._id, side: "debit", amountMinor, currency },
        { accountId: account._id, side: "credit", amountMinor, currency },
      ],
      userId,
      key,
      session,
    );
  }
  async payBooking(
    userId: string,
    referenceId: string,
    amountMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const { account } = await this.wallet(userId, currency, session);
    const balance = await this.balance(String(account._id), session);
    if (balance < BigInt(amountMinor))
      throw new ApiError("INSUFFICIENT_WALLET_BALANCE", "موجودی کیف پول کافی نیست.", 409, {
        balance_minor: balance.toString(),
        required_minor: amountMinor,
      });
    const escrow = await this.platformAccount("booking-escrow", currency, session);
    return this.post(
      { type: "booking_checkout", id: referenceId, operation: "wallet_payment" },
      "پرداخت رزرو از کیف پول",
      [
        { accountId: account._id, side: "debit", amountMinor, currency },
        { accountId: escrow._id, side: "credit", amountMinor, currency },
      ],
      userId,
      key,
      session,
    );
  }
  async gatewayBooking(
    userId: string,
    paymentId: string,
    amountMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const clearing = await this.platformAccount("gateway-clearing", currency, session);
    const escrow = await this.platformAccount("booking-escrow", currency, session);
    return this.post(
      { type: "payment", id: paymentId, operation: "gateway_booking" },
      "وصول پرداخت رزرو",
      [
        { accountId: clearing._id, side: "debit", amountMinor, currency },
        { accountId: escrow._id, side: "credit", amountMinor, currency },
      ],
      userId,
      key,
      session,
    );
  }
  async gatewayMembership(
    userId: string,
    paymentId: string,
    organizationId: string,
    amountMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const clearing = await this.platformAccount("gateway-clearing", currency, session);
    const revenue = await this.organizationRevenueAccount(
      organizationId,
      "membership",
      currency,
      session,
    );
    return this.post(
      { type: "payment", id: paymentId, operation: "gateway_membership" },
      "وصول خرید عضویت",
      [
        { accountId: clearing._id, side: "debit", amountMinor, currency },
        { accountId: revenue._id, side: "credit", amountMinor, currency },
      ],
      userId,
      key,
      session,
    );
  }
  async refundToWallet(
    userId: string,
    refundId: string,
    amountMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const { account } = await this.wallet(userId, currency, session);
    const escrow = await this.platformAccount("booking-escrow", currency, session);
    return this.post(
      { type: "refund", id: refundId, operation: "wallet_credit" },
      "بازپرداخت رزرو به کیف پول",
      [
        { accountId: escrow._id, side: "debit", amountMinor, currency },
        { accountId: account._id, side: "credit", amountMinor, currency },
      ],
      userId,
      key,
      session,
    );
  }
  async refundCancellationPenaltyToWallet(
    actorUserId: string,
    userId: string,
    organizationId: string,
    refundId: string,
    amountMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const { account } = await this.wallet(userId, currency, session);
    const cancellationRevenue = await this.cancellationRevenueAccount(
      organizationId,
      currency,
      session,
    );
    return this.post(
      { type: "refund", id: refundId, operation: "penalty_adjustment" },
      "اصلاح جریمه لغو و بازپرداخت به کیف پول",
      [
        { accountId: cancellationRevenue._id, side: "debit", amountMinor, currency },
        { accountId: account._id, side: "credit", amountMinor, currency },
      ],
      actorUserId,
      key,
      session,
    );
  }
  async reverse(
    actorUserId: string,
    transactionId: string,
    reason: string,
    idempotencyKey: string,
    session: ClientSession,
  ) {
    const original = (await this.models.LedgerTransaction.findById(transactionId)
      .session(session)
      .lean()) as any;
    if (!original || original.status !== "posted")
      throw new ApiError("LEDGER_TRANSACTION_NOT_FOUND", "سند ثبت‌شده پیدا نشد.", 404);
    if (original.reference?.type === "ledger_reversal")
      throw new ApiError("LEDGER_REVERSAL_NOT_REVERSIBLE", "برگشت یک سند برگشتی مجاز نیست.", 409);
    const existing = await this.models.LedgerTransaction.findOne({
      "reference.type": "ledger_reversal",
      "reference.id": original._id,
      "reference.operation": "reverse",
    })
      .session(session)
      .lean();
    if (existing) return existing;
    return this.post(
      { type: "ledger_reversal", id: transactionId, operation: "reverse" },
      `برگشت سند: ${reason}`,
      (original.entries ?? []).map((entry: any) => ({
        accountId: entry.accountId,
        side: entry.side === "debit" ? "credit" : "debit",
        amountMinor: entry.amountMinor,
        currency: entry.currency,
      })),
      actorUserId,
      idempotencyKey,
      session,
    );
  }
  async refundBooking(
    userId: string,
    organizationId: string,
    refundId: string,
    totalMinor: string,
    refundableMinor: string,
    penaltyMinor: string,
    currency: string,
    key: string,
    session: ClientSession,
  ) {
    const total = BigInt(totalMinor);
    const refundable = BigInt(refundableMinor);
    const penalty = BigInt(penaltyMinor);
    if (total < 0n || refundable < 0n || penalty < 0n || refundable + penalty !== total)
      throw new ApiError("INVALID_REFUND_CALCULATION", "محاسبه بازپرداخت تراز نیست.", 422);
    const escrow = await this.platformAccount("booking-escrow", currency, session);
    const entries: any[] = [
      { accountId: escrow._id, side: "debit", amountMinor: totalMinor, currency },
    ];
    if (refundable > 0n) {
      const { account } = await this.wallet(userId, currency, session);
      entries.push({
        accountId: account._id,
        side: "credit",
        amountMinor: refundableMinor,
        currency,
      });
    }
    if (penalty > 0n) {
      const revenue = await this.cancellationRevenueAccount(organizationId, currency, session);
      entries.push({ accountId: revenue._id, side: "credit", amountMinor: penaltyMinor, currency });
    }
    return this.post(
      { type: "refund", id: refundId, operation: "booking_cancellation" },
      "بازپرداخت و جریمه لغو رزرو",
      entries,
      userId,
      key,
      session,
    );
  }
}
