import { describe, expect, it } from "vitest";
import {
  coachOfferingSchema,
  coachPatchSchema,
  coachSearchSchema,
  coachingMessageSchema,
  coachingRequestSchema,
} from "../src/modules/coach/schemas/coach.schemas.js";
import { roleSchema } from "../src/modules/account/schemas/admin-account.schemas.js";
import { checkoutSchema } from "../src/modules/commerce/schemas/commerce.schemas.js";
import { offeringCreateSchema } from "../src/modules/supply/schemas/supply.schemas.js";
import { catalogBranchSearchSchema } from "../src/modules/supply/schemas/supply.schemas.js";
import {
  sportTermCreateSchema,
  sportTermPatchSchema,
} from "../src/modules/meta/schemas/meta.schemas.js";
import {
  corporateContractSchema,
  corporateContractRenewSchema,
  corporateBudgetResetSchema,
  corporateEnrollmentEndSchema,
  corporateEnrollmentSchema,
  corporateMemberSchema,
  productCreateSchema,
  purchaseSchema,
} from "../src/modules/membership/schemas/membership.schemas.js";
import {
  ledgerReversalSchema,
  manualRefundSchema,
  rulePatchSchema,
  ruleSchema,
  settlementCreateSchema,
  taxRulePatchSchema,
  taxRuleSchema,
} from "../src/modules/finance/schemas/finance.schemas.js";
import {
  campaignCreateSchema,
  metricEventSchema,
  placementSchema,
} from "../src/modules/advertising/schemas/advertising.schemas.js";
import {
  reviewCreateSchema,
  reviewModerationSchema,
} from "../src/modules/review/schemas/review.schemas.js";
import {
  coachVerificationSubmitSchema,
  verificationReviewSchema,
} from "../src/modules/verification/schemas/verification.schemas.js";
import {
  announcementCreateSchema,
  deviceRegistrationSchema,
  preferenceSchema,
} from "../src/modules/notification/schemas/notification.schemas.js";

describe("coach, membership and settlement contracts", () => {
  it("validates the admin-managed three-level sport catalog", () => {
    expect(
      sportTermCreateSchema.parse({
        code: "martial_arts",
        level: "category",
        label_fa: "ورزش‌های رزمی",
      }).level,
    ).toBe("category");
    expect(
      sportTermCreateSchema.parse({
        code: "sanda",
        level: "branch",
        parent_id: "507f1f77bcf86cd799439011",
        label_fa: "ساندا",
      }).parent_id,
    ).toHaveLength(24);
    expect(() => sportTermPatchSchema.parse({})).toThrow();
    expect(catalogBranchSearchSchema.parse({ sport: "karate" }).sport).toBe("karate");
  });
  it("accepts a grouped coach profile and directory filters", () => {
    expect(
      coachPatchSchema.parse({
        professional: { display_name: "مربی نمونه", experience_years: 8 },
        service_modes: ["online"],
      }).professional?.display_name,
    ).toBe("مربی نمونه");
    expect(coachSearchSchema.parse({ service_mode: "online", page: "2" }).page).toBe(2);
  });
  it("validates multi-branch family membership and purchase idempotency", () => {
    const id = "507f1f77bcf86cd799439011";
    const product = productCreateSchema.parse({
      profile: { name: "خانواده همه شعب", type: "family" },
      scope: { club_ids: [], branch_ids: [id], mode: "multi_branch" },
      benefits: { sports: [], unlimited: true, included_services: [] },
      pricing: [
        { id: "annual", title: { fa: "سالانه" }, amount_minor: "12000000", duration_days: 365 },
      ],
      rules: { allow_family: true, maximum_beneficiaries: 5, transferable: false },
      status: "active",
    });
    expect(product.rules.maximum_beneficiaries).toBe(5);
    const purchase = purchaseSchema.parse({
        price_id: "annual",
        beneficiaries: [{ user_id: id }],
        idempotency_key: "purchase-0001",
      });
    expect(purchase.beneficiaries).toHaveLength(1);
    expect(purchase.payment_method).toBe("sandbox_gateway");
    expect(() => purchaseSchema.parse({ ...purchase, payment_method: "zarinpal" })).toThrow();
  });
  it("validates a budgeted corporate contract, member and enrollment command", () => {
    const id = "507f1f77bcf86cd799439011";
    const contract = corporateContractSchema.parse({
      corporate_account_id: id,
      membership_product_id: id,
      scope: { club_ids: [], branch_ids: [id], mode: "multi_branch" },
      benefits: [{ type: "membership" }],
      budget: { amount_minor: "50000000", period: "contract" },
      validity: { starts_at: "2026-01-01", ends_at: "2027-01-01" },
      status: "active",
    });
    expect(contract.scope.branch_ids).toEqual([id]);
    expect(
      corporateMemberSchema.parse({ user_id: id, profile: { employee_code: "EMP-10" } }).status,
    ).toBe("active");
    expect(
      corporateEnrollmentSchema.parse({ corporate_member_id: id, idempotency_key: "enroll-0001" })
        .corporate_member_id,
    ).toBe(id);
    expect(() =>
      corporateContractSchema.parse({
        ...contract,
        corporate_account_id: id,
        membership_product_id: id,
        validity: { starts_at: "2027-01-01", ends_at: "2026-01-01" },
      }),
    ).toThrow();
    expect(
      corporateContractRenewSchema.parse({
        ends_at: "2028-01-01",
        budget_amount_minor: "70000000",
        extend_active_enrollments: true,
      }).extend_active_enrollments,
    ).toBe(true);
    expect(corporateBudgetResetSchema.parse({ reason: "شروع دوره ماهانه" }).reason).toContain(
      "دوره",
    );
    expect(corporateEnrollmentEndSchema.parse({ reason: "خروج از قرارداد" }).reason).toContain(
      "قرارداد",
    );
  });
  it("validates commission bps and a bounded settlement period", () => {
    expect(
      ruleSchema.parse({
        profile: { name: "کمیسیون پایه" },
        calculation: { type: "percentage", percentage_bps: 850 },
        status: "active",
      }).calculation.percentage_bps,
    ).toBe(850);
    expect(
      settlementCreateSchema.parse({ starts_at: "2026-01-01", ends_at: "2026-02-01" }).currency,
    ).toBe("IRR");
    expect(rulePatchSchema.parse({ status: "archived" }).status).toBe("archived");
    expect(() => rulePatchSchema.parse({})).toThrow();
    expect(
      manualRefundSchema.parse({
        payment_id: "507f1f77bcf86cd799439011",
        amount_minor: "10000",
        reason: "اصلاح پرداخت رزرو",
        idempotency_key: "d7ef77c2-a36f-4aac-bbd1-ec861a599af0",
      }).amount_minor,
    ).toBe("10000");
    expect(
      ledgerReversalSchema.parse({
        reason: "اصلاح سند اشتباه",
        idempotency_key: "5ea8e3cc-7bf7-41c8-8a4e-adc093793f2e",
      }).reason,
    ).toContain("سند");
    expect(
      taxRuleSchema.parse({
        scope: { type: "organization", id: "507f1f77bcf86cd799439011" },
        profile: { name: "مالیات ارزش افزوده" },
        calculation: { type: "percentage", percentage_bps: 1000, price_mode: "exclusive" },
        status: "active",
      }).calculation.percentage_bps,
    ).toBe(1000);
    expect(taxRulePatchSchema.parse({ status: "archived" }).status).toBe("archived");
  });
  it("models a coach service as a reservable offering with an explicit revenue share", () => {
    const id = "507f1f77bcf86cd799439011";
    expect(
      coachOfferingSchema.parse({
        branch_id: id,
        resource_id: id,
        profile: { name: "تمرین خصوصی", slug: "private-training" },
        pricing: { base_amount: 2_000_000 },
        booking_settings: { duration_minutes: 60 },
        coach_percentage_bps: 7000,
      }).coach_percentage_bps,
    ).toBe(7000);
    const offering = offeringCreateSchema.parse({
      organization_id: id,
      branch_ids: [id],
      profile: { name: "تمرین خصوصی", slug: "private-training", type: "private_coaching" },
      provider: { type: "coach", coach_profile_id: id, coach_user_id: id },
      revenue_share: { coach_percentage_bps: 7000 },
      resource_requirements: [{ resource_id: id, quantity: 1 }],
      pricing: { base_amount: 2_000_000, currency: "IRR" },
      booking_settings: { duration_minutes: 60 },
      capacity: { maximum: 1 },
      status: "active",
    });
    expect(offering.provider?.type).toBe("coach");
    expect(offering.revenue_share?.coach_percentage_bps).toBe(7000);
  });
  it("requires an explicit contract when booking with a membership", () => {
    const id = "507f1f77bcf86cd799439011";
    expect(
      checkoutSchema.parse({
        hold_token: "a".repeat(40),
        payment_method: "membership",
        membership_contract_id: id,
      }).membership_contract_id,
    ).toBe(id);
    expect(() =>
      checkoutSchema.parse({ hold_token: "a".repeat(40), payment_method: "membership" }),
    ).toThrow();
  });
  it("validates coaching requests/messages and scoped custom roles", () => {
    const id = "507f1f77bcf86cd799439011";
    expect(
      coachingRequestSchema.parse({ coach_profile_id: id, profile: { goal: "آمادگی مسابقه" } })
        .profile.goal,
    ).toBe("آمادگی مسابقه");
    expect(coachingMessageSchema.parse({ text: "گزارش تمرین امروز" }).text).toContain("تمرین");
    expect(
      roleSchema.parse({
        code: "club_student_manager",
        name: "مدیر ارتباط با شاگردان",
        scope_type: "organization",
        permissions: ["organization.staff.manage"],
      }).scope_type,
    ).toBe("organization");
  });
  it("validates advertising schedule, budgets, placements and signed tracking input", () => {
    const id = "507f1f77bcf86cd799439011";
    expect(
      placementSchema.parse({
        code: "mobile.home.featured",
        profile: { title: "خانه موبایل", surface: "mobile" },
        pricing: { model: "cpc", amount_minor: 1000, currency: "IRR" },
      }).code,
    ).toBe("mobile.home.featured");
    const campaign = campaignCreateSchema.parse({
      profile: { name: "جذب ورزشکار", objective: "traffic" },
      placement_ids: [id],
      targeting: { cities: ["تهران"], sport_ids: [], branch_ids: [], audience_roles: ["athlete"] },
      budget: { total_minor: 10_000_000, daily_minor: 1_000_000, currency: "IRR" },
      schedule: { starts_at: "2026-01-01", ends_at: "2026-02-01" },
      creatives: [{ id: "main", title: "پیشنهاد ویژه", destination_url: "https://gym4.me" }],
    });
    expect(campaign.budget.daily_minor).toBeLessThan(campaign.budget.total_minor);
    expect(
      metricEventSchema.parse({ tracking_token: "x".repeat(80), type: "click", context: {} }).type,
    ).toBe("click");
  });
  it("accepts only bounded verified-booking reviews and explicit moderation decisions", () => {
    const id = "507f1f77bcf86cd799439011";
    expect(
      reviewCreateSchema.parse({
        booking_id: id,
        subject: { type: "club", id },
        rating: { overall: 5, dimensions: { cleanliness: 4 } },
        content: { body: "تجربه بسیار خوبی بود." },
      }).rating.overall,
    ).toBe(5);
    expect(
      reviewModerationSchema.parse({ decision: "approve", note: "محتوا معتبر است" }).decision,
    ).toBe("approve");
  });
  it("validates document-based verification submission and per-document review", () => {
    const submitted = coachVerificationSubmitSchema.parse({
      documents: [
        {
          id: "license",
          type: "coach_license",
          title: "کارت مربی‌گری",
          file: {
            url: "https://files.gym4.me/license.pdf",
            mime_type: "application/pdf",
            size_bytes: 1200,
          },
        },
      ],
    });
    expect(submitted.documents).toHaveLength(1);
    expect(
      verificationReviewSchema.parse({
        decision: "verified",
        note: "مدرک معتبر است",
        document_results: [{ document_id: "license", status: "accepted" }],
      }).decision,
    ).toBe("verified");
  });
  it("validates advanced club discovery filters", () => {
    const query = catalogBranchSearchSchema.parse({
      amenities: "parking,pool",
      min_rating: "4",
      min_price: "1000",
      max_price: "5000",
      open_now: "true",
    });
    expect(query.min_rating).toBe(4);
    expect(query.open_now).toBe(true);
  });
  it("validates targeted announcements and user-controlled notification topics", () => {
    const id = "507f1f77bcf86cd799439011";
    expect(
      announcementCreateSchema.parse({
        profile: { title: "تغییر ساعت استخر", message: "ساعت سانس فردا تغییر کرده است." },
        audience: { type: "branch_members", branch_ids: [id] },
        channels: ["in_app", "sms", "push"],
      }).status,
    ).toBe("draft");
    expect(
      preferenceSchema.parse({
        topics: {
          transactional: "enabled",
          reminders: "enabled",
          announcements: "enabled",
          marketing: "disabled",
        },
      }).topics?.marketing,
    ).toBe("disabled");
    expect(() =>
      announcementCreateSchema.parse({
        profile: { title: "اطلاعیه", message: "متن اطلاعیه" },
        audience: { type: "branch_members", branch_ids: [] },
      }),
    ).toThrow();
    expect(
      deviceRegistrationSchema.parse({
        installation_id: "device-installation-001",
        platform: "android",
        push: { token: "fcm-token-value", provider: "fcm" },
        app: { version: "1.0.0" },
      }).push.provider,
    ).toBe("fcm");
  });
});
