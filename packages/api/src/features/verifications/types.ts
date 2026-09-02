import type { ApiEntity, PaginationParams } from "../organizations/types";
export type { ApiEntity };
export interface VerificationDocumentInput {
  id: string;
  type: string;
  title: string;
  file: { url: string; mime_type: string; size_bytes: number };
  metadata?: ApiEntity;
}
export interface VerificationSubmitInput {
  type?: string;
  documents: VerificationDocumentInput[];
  custom_data?: ApiEntity;
}
export interface VerificationListParams extends PaginationParams {
  status?: "pending" | "verified" | "rejected" | "needs_correction" | "archived";
}
