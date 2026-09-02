import type { ApiEntity, PaginationParams } from "../organizations/types";
export type { ApiEntity };
export type ReviewSubjectType = "club" | "branch" | "coach" | "offering";
export type ReviewStatus = "pending" | "active" | "rejected" | "hidden";
export interface ReviewListParams extends PaginationParams {
  subject_type?: ReviewSubjectType;
  subject_id?: string;
  status?: ReviewStatus;
}
export interface ReviewInput {
  booking_id: string;
  subject: { type: ReviewSubjectType; id: string };
  rating: { overall: number; dimensions: Record<string, number> };
  content: { title?: string; body: string };
}
export interface ReviewListResult {
  items: ApiEntity[];
  pagination: { page: number; limit: number; total: number; pages: number };
  summary?: { average: number; count: number };
}
