import type {
  KycDocumentType,
  KycRequestKind,
  KycRequestStatus,
  KycStatus,
  ListQuery,
  ListQueryFilter,
} from "../types";

export type AdminKycUserSummary = {
  id: string;
  phone?: string;
  name?: { first?: string | null; last?: string | null };
  code?: string | null;
  kycStatus?: KycStatus;
};

export type AdminKycRequest = {
  id: string;
  /** @deprecated Prefer `id` — kept for older payloads. */
  _id?: string;
  userId: AdminKycUserSummary | string;
  kind: KycRequestKind;
  status: KycRequestStatus;
  documentType?: KycDocumentType | null;
  nationalId?: string | null;
  birthDate?: string | null;
  fileMimeType?: string | null;
  hasDocument?: boolean;
  documentUrl?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

export type AdminKycSortBy =
  | "createdAt"
  | "updatedAt"
  | "reviewedAt"
  | "birthDate"
  | "status"
  | "kind";

export type ListAdminKycQuery = ListQuery<AdminKycSortBy> & {
  status?: ListQueryFilter<KycRequestStatus>;
  kind?: KycRequestKind;
};

export type ReviewKycInput = {
  action: "approve" | "reject";
  rejectionReason?: string;
};
