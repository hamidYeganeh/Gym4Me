import { z } from "zod";
import { CALCULATION_TYPES } from "../../../common/enums/index.js";
import { PRICE_MODES, RULE_STATUSES, TAX_SCOPES } from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const localized = z.record(z.string(), z.string());
export const ruleSchema = z.object({
  profile: z.object({ name: z.string().min(2), description: localized.optional() }),
  applies_to: z
    .object({
      booking_types: z.array(z.string()).default([]),
      offering_ids: z.array(objectId).default([]),
    })
    .default({ booking_types: [], offering_ids: [] }),
  calculation: z.object({
    type: z.enum(CALCULATION_TYPES),
    percentage_bps: z.number().int().min(0).max(10000).optional(),
    amount_minor: z.string().regex(/^\d+$/).optional(),
    currency: z.string().length(3).default("IRR"),
  }),
  priority: z.number().int().default(0),
  validity: z
    .object({ starts_at: z.coerce.date().optional(), ends_at: z.coerce.date().optional() })
    .optional(),
  status: z.enum(RULE_STATUSES).default("draft"),
});
export const rulePatchSchema = z
  .object({
    profile: z.object({ name: z.string().min(2), description: localized.optional() }).optional(),
    applies_to: z
      .object({
        booking_types: z.array(z.string()).optional(),
        offering_ids: z.array(objectId).optional(),
      })
      .optional(),
    calculation: z
      .object({
        type: z.enum(CALCULATION_TYPES),
        percentage_bps: z.number().int().min(0).max(10000).optional(),
        amount_minor: z.string().regex(/^\d+$/).optional(),
        currency: z.string().length(3).optional(),
      })
      .optional(),
    priority: z.number().int().optional(),
    validity: z
      .object({ starts_at: z.coerce.date().optional(), ends_at: z.coerce.date().optional() })
      .optional(),
    status: z.enum(RULE_STATUSES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "حداقل یک تغییر لازم است" });
const taxRuleBase = z.object({
  scope: z.object({ type: z.enum(TAX_SCOPES), id: objectId }),
  profile: z.object({ name: z.string().min(2).max(160), description: localized.optional() }),
  calculation: z.object({
    type: z.enum(CALCULATION_TYPES),
    percentage_bps: z.number().int().min(0).max(10000).optional(),
    amount_minor: z.string().regex(/^\d+$/).optional(),
    currency: z.string().length(3).default("IRR"),
    price_mode: z.enum(PRICE_MODES).default("inherit"),
  }),
  validity: z
    .object({ starts_at: z.coerce.date().optional(), ends_at: z.coerce.date().optional() })
    .optional(),
  priority: z.number().int().default(0),
  status: z.enum(RULE_STATUSES).default("draft"),
});
export const taxRuleSchema = taxRuleBase.superRefine((value, context) => {
  if (value.calculation.type === "percentage" && value.calculation.percentage_bps === undefined)
    context.addIssue({
      code: "custom",
      path: ["calculation", "percentage_bps"],
      message: "نرخ مالیات الزامی است",
    });
  if (value.calculation.type === "fixed" && value.calculation.amount_minor === undefined)
    context.addIssue({
      code: "custom",
      path: ["calculation", "amount_minor"],
      message: "مبلغ مالیات الزامی است",
    });
});
export const taxRulePatchSchema = z
  .object({
    profile: z
      .object({ name: z.string().min(2).max(160), description: localized.optional() })
      .optional(),
    calculation: z
      .object({
        type: z.enum(CALCULATION_TYPES),
        percentage_bps: z.number().int().min(0).max(10000).optional(),
        amount_minor: z.string().regex(/^\d+$/).optional(),
        currency: z.string().length(3).optional(),
        price_mode: z.enum(PRICE_MODES).optional(),
      })
      .optional(),
    validity: z
      .object({ starts_at: z.coerce.date().optional(), ends_at: z.coerce.date().optional() })
      .optional(),
    priority: z.number().int().optional(),
    status: z.enum(RULE_STATUSES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "حداقل یک تغییر لازم است" });
export const settlementCreateSchema = z
  .object({
    starts_at: z.coerce.date(),
    ends_at: z.coerce.date(),
    currency: z.string().length(3).default("IRR"),
  })
  .refine((x) => x.ends_at > x.starts_at, { message: "پایان دوره باید پس از شروع باشد" });
export const payoutSchema = z.object({
  reference: z.string().min(2).max(200),
  note: z.string().max(1000).optional(),
});
export const manualRefundSchema = z.object({
  payment_id: objectId,
  amount_minor: z
    .string()
    .regex(/^\d+$/)
    .refine((value) => BigInt(value) > 0n),
  reason: z.string().min(3).max(1000),
  idempotency_key: z.string().uuid(),
});
export const ledgerReversalSchema = z.object({
  reason: z.string().min(3).max(1000),
  idempotency_key: z.string().uuid(),
});
export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});
export const reportSchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .transform((value) => ({
    from: value.from ?? new Date(Date.now() - 30 * 86_400_000),
    to: value.to ?? new Date(),
  }))
  .refine((value) => value.to > value.from, "بازه گزارش معتبر نیست");
