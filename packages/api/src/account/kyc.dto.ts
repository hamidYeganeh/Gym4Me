import type {
  KycDocumentType,
  KycRequestKind,
  KycRequestStatus,
  KycStatus,
} from "../types";

export type KycDocumentRequest = {
  id: string;
  kind: KycRequestKind;
  status: KycRequestStatus;
  documentType: KycDocumentType | null;
  rejectionReason: string | null;
  createdAt: string;
};

export type KycStatusResponse = {
  kycStatus: KycStatus;
  kycVerifiedAt: string | null;
  identity: {
    status: KycRequestStatus | "not_submitted";
    rejectionReason?: string | null;
  };
  documents: KycDocumentRequest[];
};

export type SubmitIdentityInput = {
  nationalId: string;
  /** ISO date string or Date-serializable value accepted by API. */
  birthDate: string;
};
