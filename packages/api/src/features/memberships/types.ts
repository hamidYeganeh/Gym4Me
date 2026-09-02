import type { ApiEntity, PaginationParams } from "../organizations/types";
export type { ApiEntity };
export interface MembershipProductInput {
  profile: {
    name: string;
    description?: Record<string, string>;
    type: "duration" | "entries" | "unlimited" | "sport" | "family" | "corporate";
  };
  scope: {
    club_ids: string[];
    branch_ids: string[];
    mode: "single_branch" | "multi_branch" | "organization_wide";
  };
  benefits: {
    sports?: string[];
    entry_limit?: number;
    unlimited?: boolean;
    included_services?: ApiEntity[];
  };
  pricing: Array<{
    id: string;
    title: Record<string, string>;
    amount_minor: string;
    currency?: string;
    duration_days: number;
  }>;
  rules?: {
    allow_family?: boolean;
    maximum_beneficiaries?: number;
    transferable?: boolean;
    booking_advance_days?: number;
  };
  status?: "draft" | "active";
  custom_data?: ApiEntity;
}
export type MembershipProductPatch = Partial<MembershipProductInput>;
export interface MembershipListParams extends PaginationParams {}
export type AdminMembershipResource =
  "products" | "contracts" | "corporate_accounts" | "corporate_contracts";
export interface AdminMembershipListParams extends MembershipListParams {
  organization_id?: string;
  status?: string;
}
export interface CorporateAccountInput {
  profile: {
    name: string;
    registration_number?: string;
    contact?: ApiEntity;
  };
  billing?: ApiEntity;
  custom_data?: ApiEntity;
  status?: "draft" | "active";
}
export type CorporateAccountPatch = Partial<CorporateAccountInput> & {
  status?: "draft" | "active" | "suspended" | "archived";
};
export interface CorporateMemberInput {
  user_id: string;
  profile?: { employee_code?: string; department?: string; title?: string };
  eligibility?: { starts_at?: string | Date; ends_at?: string | Date };
  custom_data?: ApiEntity;
  status?: "active" | "suspended";
}
export type CorporateMemberPatch = Partial<Omit<CorporateMemberInput, "user_id">>;
export interface CorporateContractInput {
  corporate_account_id: string;
  membership_product_id: string;
  scope: {
    club_ids: string[];
    branch_ids: string[];
    mode: "multi_branch" | "organization_wide";
  };
  benefits: ApiEntity[];
  budget: {
    amount_minor: string;
    currency?: string;
    period: "monthly" | "quarterly" | "annual" | "contract";
  };
  validity: { starts_at: string | Date; ends_at: string | Date };
  status?: "draft" | "active";
}
export type CorporateContractPatch = Partial<
  Omit<CorporateContractInput, "corporate_account_id" | "membership_product_id">
> & { status?: "draft" | "active" | "suspended" | "ended" | "archived" };
