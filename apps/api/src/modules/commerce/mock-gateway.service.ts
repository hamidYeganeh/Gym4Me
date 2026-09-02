import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { withTransaction } from "./commerce.transaction.js";
import { IdempotencyService } from "./idempotency.service.js";
import { InvoiceService } from "./invoice.service.js";
import { LedgerService } from "./ledger.service.js";

type Decision = "approve" | "cancel";

@Injectable()
export class MockGatewayService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly ledger: LedgerService,
    private readonly invoices: InvoiceService,
    private readonly idempotency: IdempotencyService,
  ) {}
  async payment(userId: string, paymentId: string) {
    const payment = await this.models.Payment.findOne({
      _id: objectIdFrom(paymentId),
      payerUserId: objectIdFrom(userId),
    }).lean();
    if (!payment) throw new ApiError("PAYMENT_NOT_FOUND", "پرداخت پیدا نشد.", 404);
    return payment;
  }
  async decide(userId: string, paymentId: string, decision: Decision, key: string) {
    return this.idempotency.execute(
      userId,
      "mock_gateway.decide",
      key,
      { paymentId, decision },
      () =>
        withTransaction(
          () => this.models.Payment.db.startSession(),
          async (session) => {
            const payment = (await this.models.Payment.findOne({
              _id: objectIdFrom(paymentId),
              payerUserId: objectIdFrom(userId),
            }).session(session)) as any;
            if (!payment) throw new ApiError("PAYMENT_NOT_FOUND", "پرداخت پیدا نشد.", 404);
            if (payment.provider?.code !== "sandbox")
              throw new ApiError(
                "PAYMENT_PROVIDER_MISMATCH",
                "این پرداخت متعلق به درگاه ماک نیست.",
                409,
              );
            if (payment.status !== "pending")
              throw new ApiError(
                "PAYMENT_ALREADY_DECIDED",
                "نتیجه این پرداخت قبلاً مشخص شده است.",
                409,
              );
            if (decision === "approve") {
              let membershipContract: any;
              let membershipOrganizationId: string | undefined;
              if (payment.payable.type === "membership_contract") {
                membershipContract = (await this.models.MembershipContract.findById(
                  payment.payable.id,
                ).session(session)) as any;
                if (!membershipContract)
                  throw new ApiError(
                    "MEMBERSHIP_NOT_FOUND",
                    "عضویت مرتبط با پرداخت پیدا نشد.",
                    409,
                  );
                const customData = membershipContract.customData;
                membershipOrganizationId = String(
                  customData?.get?.("organizationId") ?? customData?.organizationId ?? "",
                );
                if (!membershipOrganizationId)
                  throw new ApiError(
                    "MEMBERSHIP_ORGANIZATION_MISSING",
                    "سازمان عضویت برای ثبت مالی پیدا نشد.",
                    409,
                  );
              }
              const transaction =
                payment.payable.type === "wallet"
                  ? await this.ledger.topUp(
                      userId,
                      paymentId,
                      payment.amount.amountMinor,
                      payment.amount.currency,
                      key,
                      session,
                    )
                  : payment.payable.type === "membership_contract"
                    ? await this.ledger.gatewayMembership(
                        userId,
                        paymentId,
                        membershipOrganizationId!,
                        payment.amount.amountMinor,
                        payment.amount.currency,
                        key,
                        session,
                      )
                    : await this.ledger.gatewayBooking(
                      userId,
                      paymentId,
                      payment.amount.amountMinor,
                      payment.amount.currency,
                      key,
                      session,
                    );
              payment.status = "paid";
              payment.paidAt = new Date();
              payment.ledgerTransactionId = transaction._id;
              payment.attempts.push({ decidedAt: new Date(), decision, status: "paid" });
              payment.provider = {
                ...payment.provider,
                result: { code: "MOCK_APPROVED", decidedAt: new Date() },
              };
              if (["booking", "booking_series"].includes(payment.payable.type)) {
                const bookingFilter =
                  payment.payable.type === "booking_series"
                    ? { seriesId: payment.payable.id }
                    : { _id: payment.payable.id };
                const invoiceBookings = (await this.models.Booking.find(bookingFilter)
                  .session(session)
                  .lean()) as any[];
                if (!invoiceBookings.length)
                  throw new ApiError("BOOKING_NOT_FOUND", "رزرو مرتبط با پرداخت پیدا نشد.", 409);
                await this.models.Booking.updateMany(
                  bookingFilter,
                  { $set: { status: "confirmed", "payment.status": "paid" } },
                  { session },
                );
                if (payment.payable.type === "booking_series")
                  await this.models.BookingSeries.updateOne(
                    { _id: payment.payable.id },
                    { $set: { status: "active" } },
                    { session },
                  );
                await this.invoices.issue(
                  {
                    sourceType: payment.payable.type,
                    sourceId: String(payment.payable.id),
                    paymentId,
                    userId,
                    organizationId: String(invoiceBookings[0]!.organizationId),
                    title:
                      payment.payable.type === "booking_series" ? "رزرو دوره‌ای" : "رزرو ورزشی",
                    amountMinor: payment.amount.amountMinor,
                    subtotalMinor: invoiceBookings
                      .reduce(
                        (sum, booking) => sum + BigInt(booking.pricing?.subtotalMinor ?? "0"),
                        0n,
                      )
                      .toString(),
                    taxMinor: invoiceBookings
                      .reduce(
                        (sum, booking) => sum + BigInt(booking.pricing?.taxMinor ?? "0"),
                        0n,
                      )
                      .toString(),
                    currency: payment.amount.currency,
                  },
                  session,
                );
              }
              if (membershipContract) {
                membershipContract.status = "active";
                membershipContract.updatedBy = objectIdFrom(userId);
                await membershipContract.save({ session });
                const product = (await this.models.MembershipProduct.findById(
                  membershipContract.productId,
                ).session(session)) as any;
                await this.invoices.issue(
                  {
                    sourceType: "membership_contract",
                    sourceId: String(membershipContract._id),
                    paymentId,
                    userId,
                    organizationId: membershipOrganizationId!,
                    title: product?.profile?.name ?? "عضویت باشگاه",
                    amountMinor: payment.amount.amountMinor,
                    currency: payment.amount.currency,
                  },
                  session,
                );
              }
            } else {
              const nextStatus = "cancelled";
              payment.status = nextStatus;
              payment.attempts.push({ decidedAt: new Date(), decision, status: nextStatus });
              payment.provider = {
                ...payment.provider,
                result: {
                  code: "MOCK_CANCELLED",
                  decidedAt: new Date(),
                },
              };
              if (["booking", "booking_series"].includes(payment.payable.type)) {
                const bookingFilter =
                  payment.payable.type === "booking_series"
                    ? { seriesId: payment.payable.id }
                    : { _id: payment.payable.id };
                await this.models.Booking.updateMany(
                  { ...bookingFilter, status: "pending_payment" },
                  {
                    $set: {
                      status: "cancelled",
                      "payment.status": nextStatus,
                      cancellation: {
                        reason: "پرداخت توسط کاربر لغو شد",
                        source: "mock_gateway",
                        cancelledAt: new Date(),
                      },
                    },
                  },
                  { session },
                );
                if (payment.payable.type === "booking_series")
                  await this.models.BookingSeries.updateOne(
                    { _id: payment.payable.id },
                    { $set: { status: "cancelled" } },
                    { session },
                  );
              }
              if (payment.payable.type === "membership_contract")
                await this.models.MembershipContract.updateOne(
                  { _id: payment.payable.id, status: "pending_payment" },
                  {
                    $set: {
                      status: "cancelled",
                      updatedBy: objectIdFrom(userId),
                      "customData.cancellationReason": "پرداخت توسط کاربر لغو شد",
                    },
                  },
                  { session },
                );
            }
            await payment.save({ session });
            await this.models.OutboxEvent.create(
              [
                {
                  type: `payment.${payment.status}`,
                  aggregate: { type: "payment", id: payment._id },
                  payload: { payerUserId: userId, payable: payment.payable, provider: "sandbox" },
                  status: "pending",
                },
              ],
              { session },
            );
            return {
              payment: payment.toObject(),
              result: { status: payment.status, callbackCode: payment.provider.result.code },
            };
          },
        ),
    );
  }
}
