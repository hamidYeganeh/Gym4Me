import type { ApiMeta } from "../../core/contracts";

export type LocalizedText = Record<string, string>;
export type ApiEntity = Record<string, unknown>;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: ApiMeta;
  pagination: PaginationMeta;
}

export interface OrganizationProfileInput {
  legal_name: string;
  trade_name?: string;
  type?: "club_business" | "corporate" | "coach_business" | "other";
  registration_number?: string;
  tax_id?: string;
  description?: LocalizedText;
  contact?: ApiEntity;
  address?: ApiEntity;
  logo?: ApiEntity;
}

export interface OrganizationInput {
  profile: OrganizationProfileInput;
  settings?: ApiEntity;
  custom_data?: ApiEntity;
}

export interface OrganizationPatch {
  profile?: Partial<OrganizationProfileInput>;
  settings?: ApiEntity;
  custom_data?: ApiEntity;
}

export interface ClubInput {
  organization_id: string;
  profile: {
    name: string;
    slug: string;
    description?: LocalizedText;
    logo?: ApiEntity;
    cover?: ApiEntity;
    contact?: ApiEntity;
    policies?: ApiEntity;
  };
  sports?: ApiEntity[];
  amenities?: ApiEntity[];
  custom_data?: ApiEntity;
}

export interface ClubPatch {
  profile?: Partial<ClubInput["profile"]>;
  sports?: ApiEntity[];
  amenities?: ApiEntity[];
  custom_data?: ApiEntity;
}

export interface BranchInput {
  profile: {
    name: string;
    slug: string;
    description?: LocalizedText;
    gender_policy?: "all" | "women" | "men" | "scheduled";
    contact?: ApiEntity;
    address?: ApiEntity;
    images?: ApiEntity[];
  };
  location: { latitude: number; longitude: number };
  custom_data?: ApiEntity;
}

export interface BranchPatch {
  profile?: Partial<BranchInput["profile"]>;
  location?: BranchInput["location"];
  custom_data?: ApiEntity;
}

export interface OrganizationInvitationInput {
  mobile: string;
  role_id: string;
  scope_type: "organization" | "branch";
  scope_id: string;
  employment?: {
    title?: string;
    employee_code?: string;
    branch_ids?: string[];
  };
  expires_in_days?: number;
}

export interface StatusUpdateInput {
  status: "draft" | "pending_verification" | "active" | "suspended" | "rejected" | "archived";
  reason?: string;
}

export interface ClubVerificationInput {
  status: "verified" | "rejected" | "needs_correction";
  reason?: string;
}
