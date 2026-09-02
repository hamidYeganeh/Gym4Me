export const PRODUCT_TYPES = [
  "duration",
  "entries",
  "unlimited",
  "sport",
  "family",
  "corporate",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_SCOPE_MODES = [
  "single_branch",
  "multi_branch",
  "organization_wide",
] as const;
export type ProductScopeMode = (typeof PRODUCT_SCOPE_MODES)[number];

export const CORPORATE_SCOPE_MODES = ["multi_branch", "organization_wide"] as const;
export type CorporateScopeMode = (typeof CORPORATE_SCOPE_MODES)[number];

export const BUDGET_PERIODS = ["monthly", "quarterly", "annual", "contract"] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

export const PRODUCT_STATUSES = ["draft", "active"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const CONTRACT_STATUSES = [
  "draft",
  "pending_payment",
  "active",
  "suspended",
  "ended",
  "archived",
  "cancelled",
] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export const CONTRACT_PATCH_STATUSES = [
  "draft",
  "active",
  "suspended",
  "ended",
  "archived",
] as const;
export const CORPORATE_MEMBER_ACTIVE_STATUSES = ["active", "suspended"] as const;

export const CORPORATE_MEMBER_STATUSES = ["active", "suspended", "ended"] as const;
export type CorporateMemberStatus = (typeof CORPORATE_MEMBER_STATUSES)[number];
