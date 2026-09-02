export const RULE_STATUSES = ["draft", "active", "archived"] as const;
export type RuleStatus = (typeof RULE_STATUSES)[number];

export const TAX_SCOPES = ["organization", "branch", "offering"] as const;
export type TaxScope = (typeof TAX_SCOPES)[number];

export const PRICE_MODES = ["inherit", "inclusive", "exclusive"] as const;
export type PriceMode = (typeof PRICE_MODES)[number];

export const SETTLEMENT_STATUSES = ["pending", "ready", "paid", "failed"] as const;
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number];
