import { audit, createSchema, customData, mixed, objectId, status } from "../../../database/mongoose.js";
import {
  ACCESS_PASS_STATUSES,
  CANCELLATION_SCOPES,
  CHECK_IN_STATUSES,
  FALLBACK_PENALTY_TYPES,
  HOLD_STATUSES,
  IDEMPOTENCY_STATUSES,
  LEDGER_SIDES,
  PENALTY_TYPES,
} from "../enums/index.js";

export const commerceModels = {
  CancellationPolicy: createSchema({
    scope: {
      type: { type: String, enum: CANCELLATION_SCOPES, required: true },
      id: { type: objectId, required: true },
    },
    profile: { name: { type: String, required: true }, description: String },
    rules: [
      {
        id: { type: String, required: true },
        minimumMinutesBeforeStart: { type: Number, required: true, min: 0 },
        penalty: {
          type: { type: String, enum: PENALTY_TYPES, required: true },
          percentageBps: Number,
          amountMinor: String,
        },
        status: { type: String, default: "active" },
      },
    ],
    fallbackPenalty: {
      type: { type: String, enum: FALLBACK_PENALTY_TYPES, default: "none" },
      percentageBps: Number,
      amountMinor: String,
    },
    settings: {
      refundDestination: { type: String, default: "wallet" },
      applyToPendingPayment: { type: Boolean, default: false },
    },
    customData,
    status: { type: String, default: "draft", index: true },
    ...audit,
  }),
  Household: createSchema({
    ownerUserId: { type: objectId, ref: "User", required: true, unique: true },
    profile: { name: { type: String, default: "خانواده من" } },
    members: [
      {
        id: { type: String, required: true },
        userId: { type: objectId, ref: "User" },
        profile: {
          fullName: { type: String, required: true },
          relation: String,
          birthDate: Date,
          gender: String,
          mobile: String,
        },
        status: { type: String, default: "active" },
      },
    ],
    status,
    ...audit,
  }),
  PricingQuote: createSchema({
    customerUserId: { type: objectId, ref: "User", required: true, index: true },
    organizationId: objectId,
    branchId: objectId,
    offeringId: { type: objectId, ref: "Offering", required: true },
    occurrences: [mixed],
    participants: [mixed],
    pricing: mixed,
    snapshot: mixed,
    expiresAt: { type: Date, required: true },
    status: { type: String, default: "active", index: true },
    ...audit,
  }),
  BookingHold: createSchema({
    tokenHash: { type: String, required: true, unique: true, select: false },
    quoteId: { type: objectId, ref: "PricingQuote", required: true },
    customerUserId: { type: objectId, ref: "User", required: true, index: true },
    organizationId: objectId,
    branchId: objectId,
    offeringId: objectId,
    allocations: [mixed],
    participants: [mixed],
    pricing: mixed,
    expiresAt: { type: Date, required: true },
    convertedAt: Date,
    releasedAt: Date,
    status: { type: String, enum: HOLD_STATUSES, default: "held", index: true },
    ...audit,
  }),
  WaitlistEntry: createSchema({
    customerUserId: { type: objectId, ref: "User", required: true, index: true },
    organizationId: { type: objectId, ref: "Organization", required: true },
    branchId: { type: objectId, ref: "Branch", required: true, index: true },
    offeringId: { type: objectId, ref: "Offering", required: true },
    request: {
      startsAt: { type: Date, required: true },
      endsAt: { type: Date, required: true },
      participants: { type: Number, required: true, min: 1 },
      resourceIds: [objectId],
    },
    notification: { offeredAt: Date, expiresAt: Date, channel: String },
    status: { type: String, default: "waiting", index: true },
    ...audit,
  }),
  BookingSeries: createSchema({
    customerUserId: { type: objectId, ref: "User", required: true, index: true },
    recurrence: mixed,
    bookingIds: [objectId],
    pricing: mixed,
    status: { type: String, default: "active", index: true },
    ...audit,
  }),
  Booking: createSchema({
    customerUserId: { type: objectId, ref: "User", required: true, index: true },
    seriesId: { type: objectId, ref: "BookingSeries" },
    organizationId: { type: objectId, ref: "Organization", index: true },
    branchId: { type: objectId, ref: "Branch", index: true },
    offeringId: { type: objectId, ref: "Offering" },
    holdId: { type: objectId, ref: "BookingHold" },
    occurrenceIndex: Number,
    allocations: [mixed],
    participants: [mixed],
    recurrence: mixed,
    pricing: mixed,
    payment: mixed,
    cancellation: mixed,
    reschedule: mixed,
    operations: mixed,
    status: { type: String, default: "pending_payment", index: true },
    customData,
    ...audit,
  }),
  AccessPass: createSchema({
    bookingId: { type: objectId, ref: "Booking", required: true, index: true },
    participant: {
      key: { type: String, required: true },
      kind: String,
      referenceId: String,
      profile: mixed,
    },
    branchId: { type: objectId, ref: "Branch", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    validity: { startsAt: { type: Date, required: true }, endsAt: { type: Date, required: true } },
    usedAt: Date,
    revokedAt: Date,
    status: { type: String, enum: ACCESS_PASS_STATUSES, default: "issued", index: true },
    ...audit,
  }),
  CheckIn: createSchema({
    bookingId: { type: objectId, ref: "Booking", required: true, index: true },
    accessPassId: { type: objectId, ref: "AccessPass", required: true, unique: true },
    participant: mixed,
    userId: { type: objectId, ref: "User" },
    branchId: { type: objectId, ref: "Branch", required: true, index: true },
    method: { type: String, default: "qr" },
    checkedInAt: { type: Date, required: true },
    checkedOutAt: Date,
    checkout: mixed,
    performedBy: objectId,
    status: { type: String, enum: CHECK_IN_STATUSES, default: "checked_in", index: true },
    ...audit,
  }),
  Wallet: createSchema({
    owner: { type: { type: String, required: true }, id: { type: objectId, required: true } },
    currency: { type: String, required: true },
    settings: { allowNegative: { type: Boolean, default: false } },
    status,
    ...audit,
  }),
  LedgerAccount: createSchema({
    walletId: { type: objectId, ref: "Wallet" },
    owner: mixed,
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    normalSide: { type: String, required: true },
    currency: { type: String, required: true },
    status,
    ...audit,
  }),
  LedgerTransaction: createSchema({
    reference: {
      type: { type: String, required: true },
      id: { type: objectId, required: true },
      operation: String,
    },
    idempotencyKey: String,
    description: String,
    postedAt: { type: Date, default: Date.now, index: true },
    entries: [
      {
        accountId: { type: objectId, ref: "LedgerAccount", required: true },
        side: { type: String, enum: LEDGER_SIDES, required: true },
        amountMinor: { type: String, required: true },
        currency: { type: String, required: true },
      },
    ],
    status: { type: String, default: "posted" },
    ...audit,
  }),
  Payment: createSchema({
    payerUserId: { type: objectId, ref: "User", required: true, index: true },
    payable: { type: { type: String, required: true }, id: { type: objectId, required: true } },
    amount: {
      amountMinor: { type: String, required: true },
      currency: { type: String, required: true },
    },
    method: { type: String, required: true },
    provider: mixed,
    attempts: [mixed],
    ledgerTransactionId: objectId,
    idempotencyKey: String,
    expiresAt: Date,
    paidAt: Date,
    failedAt: Date,
    status: { type: String, default: "pending", index: true },
    ...audit,
  }),
  Refund: createSchema({
    paymentId: { type: objectId, ref: "Payment", required: true },
    amount: { amountMinor: String, currency: String },
    calculation: mixed,
    reason: mixed,
    provider: mixed,
    ledgerTransactionId: objectId,
    refundedAt: Date,
    status: { type: String, default: "pending", index: true },
    ...audit,
  }),
  Invoice: createSchema({
    number: { type: String, required: true, unique: true },
    organizationId: { type: objectId, ref: "Organization", index: true },
    source: {
      type: { type: String, required: true },
      id: { type: objectId, required: true },
      paymentId: objectId,
    },
    recipient: mixed,
    lines: [mixed],
    totals: mixed,
    issuedAt: { type: Date, default: Date.now, index: true },
    status,
    ...audit,
  }),
  IdempotencyRecord: createSchema({
    userId: { type: objectId, ref: "User", required: true },
    key: { type: String, required: true },
    operation: { type: String, required: true },
    requestHash: String,
    response: mixed,
    error: mixed,
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: IDEMPOTENCY_STATUSES, default: "processing", index: true },
    ...audit,
  }),
} as const;

commerceModels.Booking.index({
  "allocations.resourceId": 1,
  "allocations.startAt": 1,
  "allocations.endAt": 1,
  status: 1,
});
commerceModels.CancellationPolicy.index({
  "scope.type": 1,
  "scope.id": 1,
  status: 1,
  updatedAt: -1,
});
commerceModels.PricingQuote.index({ expiresAt: 1 }, { expireAfterSeconds: 86_400 });
commerceModels.BookingHold.index({ expiresAt: 1 }, { expireAfterSeconds: 86_400 });
commerceModels.WaitlistEntry.index({
  branchId: 1,
  "request.resourceIds": 1,
  "request.startsAt": 1,
  status: 1,
  createdAt: 1,
});
commerceModels.WaitlistEntry.index(
  { customerUserId: 1, offeringId: 1, "request.startsAt": 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "waiting" } },
);
commerceModels.Booking.index({ customerUserId: 1, createdAt: -1 });
commerceModels.Booking.index({ branchId: 1, status: 1, "allocations.startAt": 1 });
commerceModels.AccessPass.index({ bookingId: 1, "participant.key": 1, status: 1 });
commerceModels.Wallet.index({ "owner.type": 1, "owner.id": 1, currency: 1 }, { unique: true });
commerceModels.LedgerTransaction.index(
  { "reference.type": 1, "reference.id": 1, "reference.operation": 1 },
  { unique: true },
);
commerceModels.Payment.index({ payerUserId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
commerceModels.Payment.index({ status: 1, expiresAt: 1 });
commerceModels.Refund.index({ paymentId: 1, status: 1 });
commerceModels.Refund.index(
  { paymentId: 1, "provider.idempotencyKey": 1 },
  { unique: true, sparse: true },
);
commerceModels.Invoice.index({ "source.type": 1, "source.id": 1 }, { unique: true });
commerceModels.Invoice.index({ "recipient.userId": 1, issuedAt: -1 });
commerceModels.IdempotencyRecord.index({ userId: 1, operation: 1, key: 1 }, { unique: true });
commerceModels.IdempotencyRecord.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

commerceModels.LedgerTransaction.path("entries").validate((entries: unknown[]) => {
  const rows = Array.isArray(entries)
    ? (entries as Array<{ side?: string; amountMinor?: string }>)
    : [];
  const total = (side: string) =>
    rows
      .filter((row) => row.side === side)
      .reduce((sum, row) => sum + BigInt(row.amountMinor ?? "0"), 0n);
  return rows.length >= 2 && total("debit") === total("credit");
}, "Ledger transaction must be balanced");
