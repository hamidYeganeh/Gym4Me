import { z } from "zod";
import { ACTIVE_INACTIVE_STATUSES } from "../../../common/enums/index.js";
import {
  CANCEL_POLICY_MODES,
  HOUSEHOLD_GENDERS,
  MOCK_PAYMENT_DECISIONS,
  PARTICIPANT_KINDS,
  PAYMENT_METHODS,
  POLICY_STATUSES,
  STAFF_PAYMENT_MODES,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "شناسه معتبر نیست");
const participant = z
  .object({
    kind: z.enum(PARTICIPANT_KINDS),
    reference_id: z.string().max(100).optional(),
    profile: z
      .object({
        full_name: z.string().trim().min(2).max(160),
        mobile: z.string().max(20).optional(),
        relation: z.string().max(80).optional(),
      })
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.kind !== "self" && !value.reference_id && !value.profile?.full_name)
      context.addIssue({ code: "custom", message: "اطلاعات شرکت‌کننده کامل نیست" });
  });
export const quoteSchema = z.object({
  offering_id: objectId,
  branch_id: objectId,
  starts_at: z.coerce.date(),
  participants: z.array(participant).min(1).max(100),
  recurrence: z
    .object({
      frequency: z.literal("weekly"),
      interval: z.number().int().min(1).max(12).default(1),
      occurrences: z.number().int().min(2).max(52),
    })
    .optional(),
  promotion_code: z.string().trim().max(50).optional(),
});
export const holdSchema = z.object({ quote_id: objectId });
export const checkoutSchema = z
  .object({
    hold_token: z.string().min(32).max(200),
    payment_method: z.enum(PAYMENT_METHODS),
    membership_contract_id: objectId.optional(),
  })
  .superRefine((value, context) => {
    if (value.payment_method === "membership" && !value.membership_contract_id)
      context.addIssue({
        code: "custom",
        path: ["membership_contract_id"],
        message: "انتخاب عضویت الزامی است",
      });
  });
export const cancelBookingSchema = z.object({ reason: z.string().trim().min(2).max(500) });
export const selfRescheduleBookingSchema = z.object({
  starts_at: z.coerce.date(),
  reason: z.string().trim().min(2).max(500).default("تغییر زمان توسط ورزشکار"),
});
export const householdSchema = z.object({
  profile: z.object({ name: z.string().trim().min(2).max(120) }).optional(),
});
export const householdMemberSchema = z.object({
  user_id: objectId.optional(),
  profile: z.object({
    full_name: z.string().trim().min(2).max(160),
    relation: z.string().trim().max(80).optional(),
    birth_date: z.coerce.date().optional(),
    gender: z.enum(HOUSEHOLD_GENDERS).optional(),
    mobile: z.string().max(20).optional(),
  }),
});
export const topUpSchema = z.object({
  amount_minor: z
    .string()
    .regex(/^[1-9]\d*$/)
    .refine((value) => BigInt(value) >= 10_000n, "حداقل شارژ ۱۰٬۰۰۰ ریال است"),
  currency: z.string().length(3).default("IRR"),
});
export const bookingListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const percentagePenalty = z.object({
  type: z.literal("percentage"),
  value: z.number().min(0).max(100),
});
const fixedPenalty = z.object({
  type: z.literal("fixed"),
  amount_minor: z.string().regex(/^\d+$/),
});
const noPenalty = z.object({ type: z.literal("none") });
export const cancellationPolicySchema = z.object({
  profile: z.object({
    name: z.string().trim().min(2).max(160),
    description: z.string().trim().max(1000).optional(),
  }),
  rules: z
    .array(
      z.object({
        minimum_hours_before: z.number().min(0).max(8760),
        penalty: z.discriminatedUnion("type", [percentagePenalty, fixedPenalty]),
        status: z.enum(ACTIVE_INACTIVE_STATUSES).default("active"),
      }),
    )
    .max(30)
    .superRefine((rules, context) => {
      const thresholds = rules.map((rule) => rule.minimum_hours_before);
      if (new Set(thresholds).size !== thresholds.length)
        context.addIssue({ code: "custom", message: "آستانه زمانی قوانین نباید تکراری باشد" });
    }),
  fallback_penalty: z
    .discriminatedUnion("type", [percentagePenalty, fixedPenalty, noPenalty])
    .default({ type: "none" }),
  settings: z
    .object({
      refund_destination: z.literal("wallet").default("wallet"),
      apply_to_pending_payment: z.boolean().default(false),
    })
    .default({ refund_destination: "wallet", apply_to_pending_payment: false }),
  custom_data: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(POLICY_STATUSES).default("draft"),
});
export const mockPaymentDecisionSchema = z.object({
  decision: z.enum(MOCK_PAYMENT_DECISIONS),
});

export const waitlistEntrySchema = z.object({
  offering_id: objectId,
  branch_id: objectId,
  starts_at: z.coerce.date(),
  participants: z.number().int().min(1).max(100),
});
export const accessPassIssueSchema = z.object({
  participant_indexes: z.array(z.number().int().min(0).max(99)).max(100).optional(),
});
export const checkInSchema = z.object({ token: z.string().min(32).max(300) });
export const checkOutSchema = z.object({ note: z.string().trim().max(500).optional() });
export const staffBookingSchema = z.object({
  customer_user_id: objectId,
  offering_id: objectId,
  starts_at: z.coerce.date(),
  participants: z.array(participant).min(1).max(100),
  payment_mode: z.enum(STAFF_PAYMENT_MODES).default("pay_at_club"),
  note: z.string().trim().max(1000).optional(),
});
export const rescheduleBookingSchema = z.object({
  starts_at: z.coerce.date(),
  reason: z.string().trim().min(2).max(500),
});
export const staffCancelBookingSchema = z
  .object({
    reason: z.string().trim().min(2).max(500),
    policy_mode: z.enum(CANCEL_POLICY_MODES).default("apply"),
    custom_penalty: z.discriminatedUnion("type", [percentagePenalty, fixedPenalty]).optional(),
  })
  .superRefine((value, context) => {
    if (value.policy_mode === "custom" && !value.custom_penalty)
      context.addIssue({
        code: "custom",
        path: ["custom_penalty"],
        message: "جریمه سفارشی الزامی است",
      });
  });
