import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { ApiError } from "../../common/api-error.js";
import { AuditService } from "../audit/audit.service.js";
import { LedgerService } from "../commerce/ledger.service.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { toStorage } from "../organization/entity-mapper.js";
@Injectable()
export class FinanceService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly m: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly ledger: LedgerService,
    private readonly audit: AuditService,
  ) {}
  async rules(actor: string, org: string) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_READ);
    return this.m.CommissionRule.find({
      "scope.type": "organization",
      "scope.id": objectIdFrom(org),
    })
      .sort({ priority: -1 })
      .lean();
  }
  async createRule(actor: string, org: string, input: any, requestId: string) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_MANAGE);
    const item = await this.m.CommissionRule.create({
      scope: { type: "organization", id: objectIdFrom(org) },
      ...(toStorage(input) as any),
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: "finance.commission_rule.created",
      entityType: "commission_rule",
      entityId: String(item._id),
      organizationId: org,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }
  async updateRule(actor: string, org: string, id: string, input: any, requestId: string) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_MANAGE);
    const item = await this.m.CommissionRule.findOneAndUpdate(
      { _id: objectIdFrom(id), "scope.type": "organization", "scope.id": objectIdFrom(org) },
      { $set: { ...(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("COMMISSION_RULE_NOT_FOUND", "قانون کمیسیون پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "finance.commission_rule.updated",
      entityType: "commission_rule",
      entityId: id,
      organizationId: org,
      after: item,
      requestId,
    });
    return item;
  }
  async taxRules(actor: string, org: string) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_READ);
    return this.m.TaxRule.find({ organizationId: objectIdFrom(org) })
      .sort({ priority: -1, createdAt: -1 })
      .lean();
  }
  private async assertTaxScope(org: string, scope: any) {
    if (scope.type === "organization") {
      if (String(scope.id) !== org)
        throw new ApiError("TAX_SCOPE_INVALID", "دامنه سازمانی قانون مالیات معتبر نیست.", 422);
      return;
    }
    if (scope.type === "branch") {
      const branch = (await this.m.Branch.findById(scope.id).lean()) as any;
      const club = branch ? ((await this.m.Club.findById(branch.clubId).lean()) as any) : null;
      if (!club || String(club.organizationId) !== org)
        throw new ApiError("TAX_SCOPE_INVALID", "شعبه متعلق به این سازمان نیست.", 422);
      return;
    }
    if (
      !(await this.m.Offering.exists({
        _id: objectIdFrom(scope.id),
        organizationId: objectIdFrom(org),
      }))
    )
      throw new ApiError("TAX_SCOPE_INVALID", "خدمت متعلق به این سازمان نیست.", 422);
  }
  async createTaxRule(actor: string, org: string, input: any, requestId: string) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_MANAGE);
    await this.assertTaxScope(org, input.scope);
    const item = await this.m.TaxRule.create({
      organizationId: objectIdFrom(org),
      ...(toStorage(input) as any),
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: "finance.tax_rule.created",
      entityType: "tax_rule",
      entityId: String(item._id),
      organizationId: org,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }
  async updateTaxRule(actor: string, org: string, id: string, input: any, requestId: string) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_MANAGE);
    const item = await this.m.TaxRule.findOneAndUpdate(
      { _id: objectIdFrom(id), organizationId: objectIdFrom(org) },
      { $set: { ...(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("TAX_RULE_NOT_FOUND", "قانون مالیات پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "finance.tax_rule.updated",
      entityType: "tax_rule",
      entityId: id,
      organizationId: org,
      after: item,
      requestId,
    });
    return item;
  }
  private commission(booking: any, rules: any[]) {
    const rule = rules.find((r) => {
      const ids = r.appliesTo?.offeringIds ?? [];
      return !ids.length || ids.some((id: any) => String(id) === String(booking.offeringId));
    });
    const gross = BigInt(booking.pricing?.totalMinor ?? "0");
    if (!rule) return gross / 10n;
    if (rule.calculation?.type === "fixed")
      return BigInt(rule.calculation.amountMinor ?? "0") > gross
        ? gross
        : BigInt(rule.calculation.amountMinor ?? "0");
    return (gross * BigInt(rule.calculation?.percentageBps ?? 0)) / 10000n;
  }
  async createSettlement(actor: string, org: string, input: any, requestId: string) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_READ);
    const duplicate = await this.m.Settlement.findOne({
      "beneficiary.type": "organization",
      "beneficiary.id": objectIdFrom(org),
      "period.startsAt": input.starts_at,
      "period.endsAt": input.ends_at,
      status: { $ne: "cancelled" },
    }).lean();
    if (duplicate) return duplicate;
    const bookings = (await this.m.Booking.find({
      organizationId: objectIdFrom(org),
      status: "completed",
      updatedAt: { $gte: input.starts_at, $lt: input.ends_at },
      "payment.status": "paid",
      "operations.settledAt": { $exists: false },
    }).lean()) as any[];
    if (!bookings.length)
      throw new ApiError("NO_SETTLEMENT_ITEMS", "رزرو تسویه‌نشده‌ای در این دوره وجود ندارد.", 409);
    const rules = (await this.m.CommissionRule.find({
      "scope.type": "organization",
      "scope.id": objectIdFrom(org),
      status: "active",
      $or: [
        { "validity.startsAt": { $exists: false } },
        { "validity.startsAt": { $lte: input.ends_at } },
      ],
    })
      .sort({ priority: -1 })
      .lean()) as any[];
    const offerings = (await this.m.Offering.find({
      _id: { $in: bookings.map((b) => b.offeringId) },
    }).lean()) as any[];
    const session = await this.m.Settlement.db.startSession();
    try {
      let result: any;
      await session.withTransaction(async () => {
        const items = bookings.map((b) => {
          const gross = BigInt(b.pricing?.totalMinor ?? "0"),
            commission = this.commission(b, rules),
            offering = offerings.find((x) => String(x._id) === String(b.offeringId)),
            coachBps = BigInt(
              offering?.provider?.type === "coach"
                ? (offering.revenueShare?.coachPercentageBps ?? 0)
                : 0,
            ),
            requestedCoach = (gross * coachBps) / 10000n,
            coachMinor = requestedCoach > gross - commission ? gross - commission : requestedCoach;
          return {
            bookingId: b._id,
            grossMinor: gross.toString(),
            commissionMinor: commission.toString(),
            coachMinor: coachMinor.toString(),
            organizationMinor: (gross - commission - coachMinor).toString(),
            ...(coachMinor > 0n
              ? {
                  coachProfileId: offering.provider.coachProfileId,
                  coachUserId: offering.provider.coachUserId,
                }
              : {}),
          };
        });
        const gross = items.reduce((s, x) => s + BigInt(x.grossMinor), 0n),
          commission = items.reduce((s, x) => s + BigInt(x.commissionMinor), 0n),
          organizationPayable = items.reduce((s, x) => s + BigInt(x.organizationMinor), 0n);
        const [settlement] = await this.m.Settlement.create(
          [
            {
              beneficiary: { type: "organization", id: objectIdFrom(org) },
              period: { startsAt: input.starts_at, endsAt: input.ends_at },
              totals: {
                grossMinor: gross.toString(),
                commissionMinor: commission.toString(),
                coachMinor: items.reduce((s, x) => s + BigInt(x.coachMinor), 0n).toString(),
                payableMinor: organizationPayable.toString(),
                currency: input.currency,
              },
              items,
              status: "approved",
              createdBy: objectIdFrom(actor),
            },
          ],
          { session },
        );
        result = settlement;
        const coachSettlementIds: any[] = [];
        const coachIds = [
          ...new Set(items.filter((x) => x.coachProfileId).map((x) => String(x.coachProfileId))),
        ];
        for (const coachId of coachIds) {
          const coachItems = items.filter((x) => String(x.coachProfileId) === coachId),
            coachTotal = coachItems.reduce((s, x) => s + BigInt(x.coachMinor), 0n),
            coachUserId = String(coachItems[0]!.coachUserId);
          const [coachSettlement] = await this.m.Settlement.create(
            [
              {
                beneficiary: {
                  type: "coach",
                  id: objectIdFrom(coachId),
                  userId: objectIdFrom(coachUserId),
                  organizationId: objectIdFrom(org),
                },
                period: { startsAt: input.starts_at, endsAt: input.ends_at },
                totals: {
                  grossMinor: coachItems.reduce((s, x) => s + BigInt(x.grossMinor), 0n).toString(),
                  payableMinor: coachTotal.toString(),
                  currency: input.currency,
                },
                items: coachItems.map((x) => ({
                  bookingId: x.bookingId,
                  grossMinor: x.grossMinor,
                  payableMinor: x.coachMinor,
                })),
                status: "approved",
                createdBy: objectIdFrom(actor),
              },
            ],
            { session },
          );
          coachSettlementIds.push(coachSettlement!._id);
        }
        for (const item of items)
          await this.ledger.releaseBookingRevenue(
            actor,
            String(item.bookingId),
            org,
            item.grossMinor,
            item.commissionMinor,
            input.currency,
            item.coachProfileId
              ? {
                  profileId: String(item.coachProfileId),
                  userId: String(item.coachUserId),
                  amountMinor: item.coachMinor,
                }
              : undefined,
            session,
          );
        await this.m.Booking.updateMany(
          { _id: { $in: items.map((x) => x.bookingId) } },
          {
            $set: {
              "operations.settledAt": new Date(),
              "operations.settlementId": settlement!._id,
              "operations.coachSettlementIds": coachSettlementIds,
            },
          },
          { session },
        );
      });
      await this.audit.record({
        actorUserId: actor,
        action: "finance.settlement.created",
        entityType: "settlement",
        entityId: String(result._id),
        organizationId: org,
        after: result.toObject(),
        requestId,
      });
      return result.toObject();
    } finally {
      await session.endSession();
    }
  }
  async settlements(actor: string, org: string, q: any) {
    await this.access.assertOrganization(actor, org, PERMISSIONS.ORGANIZATION_FINANCE_READ);
    const filter: any = {
      "beneficiary.type": "organization",
      "beneficiary.id": objectIdFrom(org),
      ...(q.status ? { status: q.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.m.Settlement.find(filter)
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      this.m.Settlement.countDocuments(filter),
    ]);
    return { items, total };
  }
  async pay(actor: string, id: string, input: any, requestId: string) {
    const settlement = (await this.m.Settlement.findById(id).lean()) as any;
    if (!settlement) throw new ApiError("SETTLEMENT_NOT_FOUND", "تسویه پیدا نشد.", 404);
    const org = String(settlement.beneficiary.organizationId ?? settlement.beneficiary.id);
    const session = await this.m.Settlement.db.startSession();
    try {
      let item: any;
      await session.withTransaction(async () => {
        await this.ledger.paySettlement(
          actor,
          id,
          {
            type: settlement.beneficiary.type,
            id: String(settlement.beneficiary.id),
            ...(settlement.beneficiary.userId
              ? { userId: String(settlement.beneficiary.userId) }
              : {}),
          },
          settlement.totals.payableMinor,
          settlement.totals.currency,
          session,
        );
        item = await this.m.Settlement.findOneAndUpdate(
          { _id: objectIdFrom(id), status: "approved" },
          {
            $set: {
              status: "paid",
              "totals.paidAt": new Date(),
              "totals.payoutReference": input.reference,
              "totals.payoutNote": input.note,
              updatedBy: objectIdFrom(actor),
            },
          },
          { returnDocument: "after", session },
        ).lean();
        if (!item)
          throw new ApiError("SETTLEMENT_NOT_PAYABLE", "تسویه در وضعیت قابل پرداخت نیست.", 409);
      });
      await this.audit.record({
        actorUserId: actor,
        action: "finance.settlement.paid",
        entityType: "settlement",
        entityId: id,
        organizationId: org,
        after: item,
        requestId,
      });
      return item;
    } finally {
      await session.endSession();
    }
  }
  async ledgerTransactions(q: any) {
    const filter: any = { ...(q.status ? { status: q.status } : {}) };
    const [items, total] = await Promise.all([
      this.m.LedgerTransaction.find(filter)
        .sort({ postedAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      this.m.LedgerTransaction.countDocuments(filter),
    ]);
    return { items, total };
  }
  async adminSettlements(q: any) {
    const filter: any = { ...(q.status ? { status: q.status } : {}) };
    const [items, total] = await Promise.all([
      this.m.Settlement.find(filter)
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      this.m.Settlement.countDocuments(filter),
    ]);
    return { items, total };
  }
  private async organizationPaymentIds(organizationId: string) {
    const bookings = (await this.m.Booking.find({ organizationId: objectIdFrom(organizationId) })
      .select({ _id: 1, seriesId: 1, "payment.id": 1 })
      .lean()) as any[];
    return [...new Set(bookings.map((item) => String(item.payment?.id)).filter(Boolean))].map(
      objectIdFrom,
    );
  }
  async invoices(actor: string | undefined, organizationId: string | undefined, q: any) {
    if (actor && organizationId)
      await this.access.assertOrganization(
        actor,
        organizationId,
        PERMISSIONS.ORGANIZATION_FINANCE_READ,
      );
    const filter: any = {
      ...(organizationId ? { organizationId: objectIdFrom(organizationId) } : {}),
      ...(q.status ? { status: q.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.m.Invoice.find(filter)
        .sort({ issuedAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      this.m.Invoice.countDocuments(filter),
    ]);
    return { items, total };
  }
  async refunds(actor: string | undefined, organizationId: string | undefined, q: any) {
    if (actor && organizationId)
      await this.access.assertOrganization(
        actor,
        organizationId,
        PERMISSIONS.ORGANIZATION_FINANCE_READ,
      );
    const filter: any = {
      ...(organizationId
        ? { paymentId: { $in: await this.organizationPaymentIds(organizationId) } }
        : {}),
      ...(q.status ? { status: q.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.m.Refund.find(filter)
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      this.m.Refund.countDocuments(filter),
    ]);
    return { items, total };
  }
  async manualRefund(actor: string, input: any, requestId: string) {
    const duplicate = await this.m.Refund.findOne({
      paymentId: objectIdFrom(input.payment_id),
      "provider.idempotencyKey": input.idempotency_key,
    }).lean();
    if (duplicate) return duplicate;
    const payment = (await this.m.Payment.findOne({
      _id: objectIdFrom(input.payment_id),
      status: { $in: ["paid", "partially_refunded", "retained"] },
    }).lean()) as any;
    if (!payment) throw new ApiError("PAYMENT_NOT_REFUNDABLE", "پرداخت قابل بازپرداخت نیست.", 409);
    if (!["booking", "booking_series"].includes(payment.payable?.type))
      throw new ApiError(
        "MANUAL_REFUND_PAYABLE_UNSUPPORTED",
        "بازپرداخت دستی فعلاً فقط برای پرداخت رزرو قابل انجام است.",
        422,
      );
    const bookingFilter =
      payment.payable.type === "booking_series"
        ? { seriesId: payment.payable.id }
        : { _id: payment.payable.id };
    const bookings = (await this.m.Booking.find(bookingFilter).lean()) as any[];
    if (!bookings.length)
      throw new ApiError("REFUND_BOOKING_NOT_FOUND", "رزرو پرداخت پیدا نشد.", 404);
    if (bookings.some((booking) => booking.operations?.settledAt))
      throw new ApiError(
        "SETTLED_PAYMENT_REFUND_REQUIRES_ADJUSTMENT",
        "برای رزرو تسویه‌شده ابتدا باید سند تسویه برگشت داده شود.",
        409,
      );
    const previous = (await this.m.Refund.find({
      paymentId: payment._id,
      status: "paid",
    }).lean()) as any[];
    const refunded = previous.reduce(
      (sum, item) => sum + BigInt(item.amount?.amountMinor ?? "0"),
      0n,
    );
    const amount = BigInt(input.amount_minor);
    const paid = BigInt(payment.amount?.amountMinor ?? "0");
    if (amount > paid - refunded)
      throw new ApiError(
        "REFUND_AMOUNT_EXCEEDS_REMAINING",
        "مبلغ از مانده قابل بازپرداخت بیشتر است.",
        422,
        {
          remaining_minor: (paid - refunded).toString(),
        },
      );
    const escrowWasFullyAllocated = previous.some(
      (item) => BigInt(item.calculation?.totalMinor ?? "0") === paid,
    );
    const session = await this.m.Payment.db.startSession();
    try {
      let result: any;
      await session.withTransaction(async () => {
        const [refund] = await this.m.Refund.create(
          [
            {
              paymentId: payment._id,
              amount: { amountMinor: input.amount_minor, currency: payment.amount.currency },
              calculation: {
                mode: "admin_manual",
                paidMinor: paid.toString(),
                previouslyRefundedMinor: refunded.toString(),
              },
              reason: { code: "admin_manual", description: input.reason },
              provider: { code: "internal_wallet", idempotencyKey: input.idempotency_key },
              status: "processing",
              createdBy: objectIdFrom(actor),
            },
          ],
          { session },
        );
        if (!refund) throw new ApiError("REFUND_WRITE_FAILED", "ثبت بازپرداخت انجام نشد.", 500);
        const transaction = escrowWasFullyAllocated
          ? await this.ledger.refundCancellationPenaltyToWallet(
              actor,
              String(payment.payerUserId),
              String(bookings[0].organizationId),
              String(refund._id),
              input.amount_minor,
              payment.amount.currency,
              input.idempotency_key,
              session,
            )
          : await this.ledger.refundToWallet(
              String(payment.payerUserId),
              String(refund._id),
              input.amount_minor,
              payment.amount.currency,
              input.idempotency_key,
              session,
            );
        const nextRefunded = refunded + amount;
        const paymentStatus = nextRefunded === paid ? "refunded" : "partially_refunded";
        refund.status = "paid";
        refund.ledgerTransactionId = transaction._id;
        refund.refundedAt = new Date();
        await refund.save({ session });
        await this.m.Payment.updateOne(
          { _id: payment._id },
          { $set: { status: paymentStatus, updatedBy: objectIdFrom(actor) } },
          { session },
        );
        await this.m.Booking.updateMany(
          bookingFilter,
          { $set: { "payment.status": paymentStatus, updatedBy: objectIdFrom(actor) } },
          { session },
        );
        await this.m.Invoice.updateMany(
          { "source.paymentId": payment._id },
          { $set: { status: paymentStatus, updatedBy: objectIdFrom(actor) } },
          { session },
        );
        result = refund.toObject();
      });
      await this.audit.record({
        actorUserId: actor,
        action: "finance.refund.manual",
        entityType: "refund",
        entityId: String(result._id),
        after: result,
        requestId,
      });
      return result;
    } finally {
      await session.endSession();
    }
  }
  async reverseLedger(actor: string, id: string, input: any, requestId: string) {
    const session = await this.m.LedgerTransaction.db.startSession();
    try {
      let result: any;
      await session.withTransaction(async () => {
        result = await this.ledger.reverse(actor, id, input.reason, input.idempotency_key, session);
      });
      const item = result.toObject ? result.toObject() : result;
      await this.audit.record({
        actorUserId: actor,
        action: "finance.ledger.reversed",
        entityType: "ledger_transaction",
        entityId: String(item._id),
        after: item,
        requestId,
      });
      return item;
    } finally {
      await session.endSession();
    }
  }
  async reconciliation(actor: string | undefined, organizationId: string | undefined) {
    if (actor && organizationId)
      await this.access.assertOrganization(
        actor,
        organizationId,
        PERMISSIONS.ORGANIZATION_FINANCE_READ,
      );
    const organizationPaymentIds = organizationId
      ? await this.organizationPaymentIds(organizationId)
      : undefined;
    const paymentFilter: any = {
      status: "paid",
      ...(organizationPaymentIds ? { _id: { $in: organizationPaymentIds } } : {}),
    };
    const payments = (await this.m.Payment.find(paymentFilter).lean()) as any[];
    const paymentLedgerIds = payments.map((item) => item.ledgerTransactionId).filter(Boolean);
    const [paymentLedgers, invoices, refunds] = await Promise.all([
      this.m.LedgerTransaction.find({
        _id: { $in: paymentLedgerIds },
        status: "posted",
      }).lean() as any,
      this.m.Invoice.find({
        ...(organizationId ? { organizationId: objectIdFrom(organizationId) } : {}),
        "source.paymentId": { $in: payments.map((item) => item._id) },
      }).lean() as any,
      this.m.Refund.find({
        paymentId: { $in: payments.map((item) => item._id) },
        status: "paid",
      }).lean() as any,
    ]);
    const refundLedgers = (await this.m.LedgerTransaction.find({
      _id: { $in: refunds.map((item: any) => item.ledgerTransactionId).filter(Boolean) },
      status: "posted",
    }).lean()) as any[];
    const missingLedger = payments.filter(
      (payment) =>
        !payment.ledgerTransactionId ||
        !paymentLedgers.some((row: any) => String(row._id) === String(payment.ledgerTransactionId)),
    );
    const missingInvoice = payments.filter(
      (payment) =>
        payment.payable?.type !== "wallet" &&
        !invoices.some((invoice: any) => String(invoice.source?.paymentId) === String(payment._id)),
    );
    const inconsistentRefunds = refunds.filter(
      (refund: any) =>
        !refund.ledgerTransactionId ||
        !refundLedgers.some((row: any) => String(row._id) === String(refund.ledgerTransactionId)),
    );
    return {
      status:
        missingLedger.length || missingInvoice.length || inconsistentRefunds.length
          ? "attention_required"
          : "balanced",
      checkedAt: new Date(),
      counts: {
        payments: payments.length,
        invoices: invoices.length,
        refunds: refunds.length,
        missingLedger: missingLedger.length,
        missingInvoice: missingInvoice.length,
        inconsistentRefunds: inconsistentRefunds.length,
      },
      issues: {
        paymentsWithoutLedger: missingLedger.slice(0, 100).map((item) => String(item._id)),
        paymentsWithoutInvoice: missingInvoice.slice(0, 100).map((item) => String(item._id)),
        refundsWithoutLedger: inconsistentRefunds
          .slice(0, 100)
          .map((item: any) => String(item._id)),
      },
    };
  }
  async report(actor: string | undefined, organizationId: string | undefined, q: any) {
    if (actor && organizationId)
      await this.access.assertOrganization(
        actor,
        organizationId,
        PERMISSIONS.ORGANIZATION_FINANCE_READ,
      );
    const bookingFilter: any = {
      createdAt: { $gte: q.from, $lt: q.to },
      ...(organizationId ? { organizationId: objectIdFrom(organizationId) } : {}),
    };
    const bookings = (await this.m.Booking.find(bookingFilter).lean()) as any[];
    const ids = bookings.map((item) => item._id);
    const checkIns = await this.m.CheckIn.countDocuments({
      bookingId: { $in: ids },
      checkedInAt: { $gte: q.from, $lt: q.to },
    });
    const completed = bookings.filter((item) => item.status === "completed");
    const cancelled = bookings.filter((item) => item.status === "cancelled");
    const monetary = bookings.filter((item) => item.payment?.status === "paid");
    const grossMinor = monetary.reduce(
      (sum, item) => sum + BigInt(item.pricing?.totalMinor ?? "0"),
      0n,
    );
    const membershipFilter: any = {
      createdAt: { $gte: q.from, $lt: q.to },
      ...(organizationId
        ? {
            productId: {
              $in: await this.m.MembershipProduct.distinct("_id", {
                organizationId: objectIdFrom(organizationId),
              }),
            },
          }
        : {}),
    };
    const [membershipsSold, membershipUsages, settlements] = await Promise.all([
      this.m.MembershipContract.countDocuments(membershipFilter),
      this.m.MembershipUsage.countDocuments({
        bookingId: { $in: ids },
        status: { $in: ["reserved", "consumed"] },
      }),
      this.m.Settlement.find({
        createdAt: { $gte: q.from, $lt: q.to },
        ...(organizationId
          ? {
              $or: [
                { "beneficiary.id": objectIdFrom(organizationId) },
                { "beneficiary.organizationId": objectIdFrom(organizationId) },
              ],
            }
          : {}),
      }).lean() as any,
    ]);
    const payableMinor = (settlements as any[])
      .filter((item) => item.status === "approved")
      .reduce((sum, item) => sum + BigInt(item.totals?.payableMinor ?? "0"), 0n);
    const paidMinor = (settlements as any[])
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + BigInt(item.totals?.payableMinor ?? "0"), 0n);
    const byOffering = new Map<string, { bookings: number; grossMinor: bigint }>();
    for (const item of bookings) {
      const key = String(item.offeringId);
      const row = byOffering.get(key) ?? { bookings: 0, grossMinor: 0n };
      row.bookings += 1;
      if (item.payment?.status === "paid")
        row.grossMinor += BigInt(item.pricing?.totalMinor ?? "0");
      byOffering.set(key, row);
    }
    const offerings = (await this.m.Offering.find({
      _id: { $in: [...byOffering.keys()].map(objectIdFrom) },
    }).lean()) as any[];
    return {
      period: { from: q.from, to: q.to },
      bookings: {
        total: bookings.length,
        completed: completed.length,
        cancelled: cancelled.length,
        checkIns,
        completionRate: bookings.length
          ? Math.round((completed.length / bookings.length) * 10000) / 100
          : 0,
      },
      revenue: { grossMinor: grossMinor.toString(), currency: "IRR" },
      memberships: { sold: membershipsSold, usages: membershipUsages },
      settlements: {
        approvedPayableMinor: payableMinor.toString(),
        paidMinor: paidMinor.toString(),
      },
      topOfferings: [...byOffering.entries()]
        .map(([id, value]) => ({
          id,
          name: offerings.find((item) => String(item._id) === id)?.profile?.name ?? "خدمت",
          bookings: value.bookings,
          grossMinor: value.grossMinor.toString(),
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 10),
    };
  }
}
