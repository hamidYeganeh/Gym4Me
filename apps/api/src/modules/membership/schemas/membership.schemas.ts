import { z } from "zod";
import {
  BUDGET_PERIODS,
  CONTRACT_PATCH_STATUSES,
  CONTRACT_STATUSES,
  CORPORATE_MEMBER_ACTIVE_STATUSES,
  CORPORATE_MEMBER_STATUSES,
  CORPORATE_SCOPE_MODES,
  PRODUCT_SCOPE_MODES,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
} from "../enums/index.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const localized = z.record(z.string(), z.string());
const json = z.record(z.string(), z.unknown());
const productBaseSchema = z.object({
  profile: z.object({
    name: z.string().min(2).max(160),
    description: localized.optional(),
    type: z.enum(PRODUCT_TYPES),
  }),
  scope: z.object({
    club_ids: z.array(objectId).default([]),
    branch_ids: z.array(objectId).default([]),
    mode: z.enum(PRODUCT_SCOPE_MODES).default("single_branch"),
  }),
  benefits: z.object({
    sports: z.array(z.string()).default([]),
    entry_limit: z.number().int().min(1).optional(),
    unlimited: z.boolean().default(false),
    included_services: z.array(json).default([]),
  }),
  pricing: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: localized,
        amount_minor: z.string().regex(/^\d+$/),
        currency: z.string().length(3).default("IRR"),
        duration_days: z.number().int().min(1).max(3660),
      }),
    )
    .min(1),
  rules: z
    .object({
      allow_family: z.boolean().default(false),
      maximum_beneficiaries: z.number().int().min(1).max(1000).default(1),
      transferable: z.boolean().default(false),
      booking_advance_days: z.number().int().min(1).max(365).optional(),
    })
    .default({ allow_family: false, maximum_beneficiaries: 1, transferable: false }),
  custom_data: json.optional(),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
});
export const productCreateSchema = productBaseSchema.superRefine((value, context) => {
  if (value.scope.mode !== "organization_wide" && !value.scope.branch_ids.length)
    context.addIssue({
      code: "custom",
      path: ["scope", "branch_ids"],
      message: "برای عضویت تک‌شعبه یا چندشعبه، انتخاب شعبه الزامی است",
    });
  if (value.scope.mode === "single_branch" && value.scope.branch_ids.length !== 1)
    context.addIssue({
      code: "custom",
      path: ["scope", "branch_ids"],
      message: "عضویت تک‌شعبه باید دقیقاً یک شعبه داشته باشد",
    });
});
export const productPatchSchema = productBaseSchema.partial();
export const purchaseSchema = z.object({
  price_id: z.string(),
  beneficiaries: z
    .array(z.object({ user_id: objectId, relationship: z.string().max(40).optional() }))
    .min(1)
    .max(100),
  idempotency_key: z.string().min(8).max(200),
  payment_method: z.enum(["wallet", "sandbox_gateway"]).default("sandbox_gateway"),
});
export const usageSchema = z.object({
  beneficiary_user_id: objectId,
  booking_id: objectId.optional(),
  amount: z.number().int().min(1).default(1),
  idempotency_key: z.string().min(8),
});
export const eligibleMembershipSchema = z.object({
  offering_id: objectId,
  branch_id: objectId,
});
export const corporateAccountSchema = z.object({
  profile: z.object({
    name: z.string().min(2),
    registration_number: z.string().optional(),
    contact: json.optional(),
  }),
  billing: json.optional(),
  custom_data: json.optional(),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
});
export const corporateAccountPatchSchema = corporateAccountSchema.partial();
const corporateScopeSchema = z.object({
  club_ids: z.array(objectId).default([]),
  branch_ids: z.array(objectId).default([]),
  mode: z.enum(CORPORATE_SCOPE_MODES),
});
const corporateBudgetSchema = z.object({
  amount_minor: z.string().regex(/^\d+$/),
  currency: z.string().length(3).default("IRR"),
  period: z.enum(BUDGET_PERIODS),
});
const corporateValiditySchema = z.object({
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date(),
});
export const corporateContractSchema = z
  .object({
    corporate_account_id: objectId,
    membership_product_id: objectId,
    scope: corporateScopeSchema,
    benefits: z.array(json).min(1),
    budget: corporateBudgetSchema,
    validity: corporateValiditySchema,
    status: z.enum(PRODUCT_STATUSES).default("draft"),
  })
  .superRefine((value, context) => {
    if (value.validity.ends_at <= value.validity.starts_at)
      context.addIssue({
        code: "custom",
        path: ["validity", "ends_at"],
        message: "پایان قرارداد باید بعد از شروع آن باشد",
      });
    if (value.scope.mode === "multi_branch" && !value.scope.branch_ids.length)
      context.addIssue({
        code: "custom",
        path: ["scope", "branch_ids"],
        message: "برای قرارداد چندشعبه‌ای حداقل یک شعبه انتخاب کنید",
      });
  });
export const corporateContractPatchSchema = z.object({
  scope: corporateScopeSchema.optional(),
  benefits: z.array(json).min(1).optional(),
  budget: corporateBudgetSchema.optional(),
  validity: corporateValiditySchema.optional(),
  status: z.enum(CONTRACT_PATCH_STATUSES).optional(),
});
export const corporateMemberSchema = z.object({
  user_id: objectId,
  profile: z
    .object({
      employee_code: z.string().min(1).max(80).optional(),
      department: z.string().max(120).optional(),
      title: z.string().max(120).optional(),
    })
    .default({}),
  eligibility: z
    .object({
      starts_at: z.coerce.date().optional(),
      ends_at: z.coerce.date().optional(),
    })
    .default({}),
  custom_data: json.optional(),
  status: z.enum(CORPORATE_MEMBER_ACTIVE_STATUSES).default("active"),
});
export const corporateMemberPatchSchema = corporateMemberSchema
  .omit({ user_id: true, status: true })
  .partial()
  .extend({ status: z.enum(CORPORATE_MEMBER_STATUSES).optional() });
export const corporateEnrollmentSchema = z.object({
  corporate_member_id: objectId,
  idempotency_key: z.string().min(8).max(200),
});
export const corporateEnrollmentEndSchema = z.object({
  reason: z.string().trim().min(2).max(500),
});
export const corporateContractRenewSchema = z.object({
  ends_at: z.coerce.date(),
  budget_amount_minor: z.string().regex(/^\d+$/).optional(),
  extend_active_enrollments: z.boolean().default(true),
});
export const corporateBudgetResetSchema = z.object({
  amount_minor: z.string().regex(/^\d+$/).optional(),
  reason: z.string().trim().min(2).max(500),
});
export const adminMembershipListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  organization_id: objectId.optional(),
  status: z.string().optional(),
});
export const adminMembershipStatusSchema = z.object({
  status: z.enum(CONTRACT_STATUSES),
  reason: z.string().trim().min(2).max(500),
});
