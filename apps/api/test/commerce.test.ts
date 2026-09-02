import mongoose from "mongoose";
import { commerceModels } from "../src/modules/commerce/models/index.js";
import { describe, expect, it, vi } from "vitest";
import { CancellationPolicyService } from "../src/modules/commerce/cancellation-policy.service.js";
import {
  accessPassIssueSchema,
  cancellationPolicySchema,
  checkInSchema,
  householdMemberSchema,
  mockPaymentDecisionSchema,
  quoteSchema,
  selfRescheduleBookingSchema,
  staffBookingSchema,
  staffCancelBookingSchema,
  topUpSchema,
  waitlistEntrySchema,
} from "../src/modules/commerce/schemas/commerce.schemas.js";

describe("commerce contracts", () => {
  it("accepts weekly, group and household booking quotes", () => {
    const quote = quoteSchema.parse({
      offering_id: "507f1f77bcf86cd799439011",
      branch_id: "507f191e810c19729de860ea",
      starts_at: "2026-09-07T08:00:00.000Z",
      participants: [
        { kind: "self" },
        { kind: "household_member", reference_id: "member-1" },
        { kind: "guest", profile: { full_name: "مهمان نمونه" } },
      ],
      recurrence: { frequency: "weekly", interval: 2, occurrences: 6 },
    });
    expect(quote.participants).toHaveLength(3);
    expect(quote.recurrence?.occurrences).toBe(6);
  });

  it("rejects unidentified guests and excessive recurrences", () => {
    expect(() =>
      quoteSchema.parse({
        offering_id: "507f1f77bcf86cd799439011",
        branch_id: "507f191e810c19729de860ea",
        starts_at: new Date(),
        participants: [{ kind: "guest" }],
      }),
    ).toThrow();
    expect(() =>
      quoteSchema.parse({
        offering_id: "507f1f77bcf86cd799439011",
        branch_id: "507f191e810c19729de860ea",
        starts_at: new Date(),
        participants: [{ kind: "self" }],
        recurrence: { frequency: "weekly", interval: 1, occurrences: 53 },
      }),
    ).toThrow();
  });

  it("validates household members and minimum wallet top-up", () => {
    expect(
      householdMemberSchema.parse({ profile: { full_name: "سارا یوسفی", relation: "فرزند" } })
        .profile.relation,
    ).toBe("فرزند");
    expect(() => topUpSchema.parse({ amount_minor: "9999", currency: "IRR" })).toThrow();
    expect(topUpSchema.parse({ amount_minor: "10000", currency: "IRR" }).currency).toBe("IRR");
  });

  it("validates dynamic cancellation tiers and mock decisions", () => {
    const policy = cancellationPolicySchema.parse({
      profile: { name: "قانون باشگاه" },
      rules: [
        { minimum_hours_before: 72, penalty: { type: "percentage", value: 40 } },
        { minimum_hours_before: 48, penalty: { type: "percentage", value: 60 } },
      ],
      fallback_penalty: { type: "percentage", value: 100 },
      status: "active",
    });
    expect(policy.rules[0]?.penalty).toEqual({ type: "percentage", value: 40 });
    expect(mockPaymentDecisionSchema.parse({ decision: "approve" }).decision).toBe("approve");
    expect(mockPaymentDecisionSchema.parse({ decision: "cancel" }).decision).toBe("cancel");
    expect(() => mockPaymentDecisionSchema.parse({ decision: "reject" })).toThrow();
    expect(() =>
      cancellationPolicySchema.parse({
        profile: { name: "قانون تکراری" },
        rules: [
          { minimum_hours_before: 72, penalty: { type: "percentage", value: 40 } },
          { minimum_hours_before: 72, penalty: { type: "percentage", value: 60 } },
        ],
      }),
    ).toThrow();
  });

  it("validates reception, waitlist, access and override contracts", () => {
    const staff = staffBookingSchema.parse({
      customer_user_id: "507f1f77bcf86cd799439011",
      offering_id: "507f191e810c19729de860ea",
      starts_at: "2026-09-08T08:00:00Z",
      participants: [{ kind: "self" }],
      payment_mode: "pay_at_club",
    });
    expect(staff.payment_mode).toBe("pay_at_club");
    expect(
      waitlistEntrySchema.parse({
        offering_id: "507f191e810c19729de860ea",
        branch_id: "507f1f77bcf86cd799439011",
        starts_at: "2026-09-08T08:00:00Z",
        participants: 2,
      }).participants,
    ).toBe(2);
    expect(
      accessPassIssueSchema.parse({ participant_indexes: [0, 2] }).participant_indexes,
    ).toEqual([0, 2]);
    expect(checkInSchema.parse({ token: "a".repeat(32) }).token).toHaveLength(32);
    expect(() =>
      staffCancelBookingSchema.parse({ reason: "مدیر بخشود", policy_mode: "custom" }),
    ).toThrow();
    expect(
      staffCancelBookingSchema.parse({ reason: "مدیر بخشود", policy_mode: "waive" }).policy_mode,
    ).toBe("waive");
  });

  it("requires a real future date contract for self rescheduling", () => {
    expect(
      selfRescheduleBookingSchema.parse({ starts_at: "2026-09-08T08:00:00Z" }).reason,
    ).toBe("تغییر زمان توسط ورزشکار");
    expect(() => selfRescheduleBookingSchema.parse({ starts_at: "not-a-date" })).toThrow();
  });

  it("requires secure single-use access-pass fields", async () => {
    const modelName = "CommerceAccessPassContractTest";
    const AccessPass =
      mongoose.models[modelName] ?? mongoose.model(modelName, commerceModels.AccessPass.clone());
    const valid = new AccessPass({
      bookingId: new mongoose.Types.ObjectId(),
      participant: { key: "self:0", kind: "self" },
      branchId: new mongoose.Types.ObjectId(),
      tokenHash: "hash",
      validity: { startsAt: new Date(), endsAt: new Date(Date.now() + 60_000) },
      status: "issued",
    });
    await expect(valid.validate()).resolves.toBeUndefined();
    await expect(
      new AccessPass({
        bookingId: new mongoose.Types.ObjectId(),
        participant: { key: "self:0" },
        branchId: new mongoose.Types.ObjectId(),
        validity: { startsAt: new Date(), endsAt: new Date() },
      }).validate(),
    ).rejects.toThrow();
  });

  it("selects club policy tiers and calculates penalty snapshots", async () => {
    const branch = { _id: new mongoose.Types.ObjectId(), clubId: new mongoose.Types.ObjectId() };
    const club = { _id: branch.clubId, organizationId: new mongoose.Types.ObjectId() };
    const policy = {
      _id: new mongoose.Types.ObjectId(),
      scope: { type: "club", id: club._id },
      profile: { name: "قانون پلکانی" },
      version: 3,
      rules: [
        {
          id: "72h",
          minimumMinutesBeforeStart: 72 * 60,
          penalty: { type: "percentage", percentageBps: 4000 },
          status: "active",
        },
        {
          id: "48h",
          minimumMinutesBeforeStart: 48 * 60,
          penalty: { type: "percentage", percentageBps: 6000 },
          status: "active",
        },
      ],
      fallbackPenalty: { type: "percentage", percentageBps: 10000 },
    };
    const query = (value: unknown) => ({ session: () => ({ lean: async () => value }) });
    const models = {
      Branch: { findById: vi.fn(() => query(branch)) },
      Club: { findById: vi.fn(() => query(club)) },
      CancellationPolicy: { findOne: vi.fn(() => ({ sort: () => query(policy) })) },
    };
    const service = new CancellationPolicyService(models as any, {} as any, {} as any);
    const at = new Date("2026-09-01T00:00:00.000Z");
    const booking = {
      branchId: branch._id,
      allocations: [{ startAt: new Date("2026-09-03T12:00:00.000Z") }],
      pricing: { totalMinor: "100000", currency: "IRR" },
    };
    const result = await service.calculate(booking, at);
    expect(result.remainingMinutes).toBe(60 * 60);
    expect(result.penaltyMinor).toBe("60000");
    expect(result.refundableMinor).toBe("40000");
    expect(result.policy?.matchedRuleId).toBe("48h");
  });

  it("enforces balanced immutable ledger documents", async () => {
    const modelName = "CommerceLedgerContractTest";
    const Ledger =
      mongoose.models[modelName] ??
      mongoose.model(modelName, commerceModels.LedgerTransaction.clone());
    const accountA = new mongoose.Types.ObjectId();
    const accountB = new mongoose.Types.ObjectId();
    const referenceId = new mongoose.Types.ObjectId();
    const valid = new Ledger({
      reference: { type: "payment", id: referenceId, operation: "test" },
      entries: [
        { accountId: accountA, side: "debit", amountMinor: "50000", currency: "IRR" },
        { accountId: accountB, side: "credit", amountMinor: "50000", currency: "IRR" },
      ],
      status: "posted",
    });
    const invalid = new Ledger({
      reference: { type: "payment", id: referenceId, operation: "test-2" },
      entries: [
        { accountId: accountA, side: "debit", amountMinor: "50000", currency: "IRR" },
        { accountId: accountB, side: "credit", amountMinor: "40000", currency: "IRR" },
      ],
      status: "posted",
    });
    await expect(valid.validate()).resolves.toBeUndefined();
    await expect(invalid.validate()).rejects.toThrow("Ledger transaction must be balanced");
  });
});
