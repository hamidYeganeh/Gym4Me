import type { PaginatedResult, PaginationParams } from "../organizations/types";
export interface AuditLog {
  _id: string;
  actor: Record<string, unknown>;
  action: string;
  entity: { type?: string; id?: string; organizationId?: string };
  changes?: Record<string, unknown>;
  request?: Record<string, unknown>;
  occurredAt: string;
}
export interface AuditParams extends PaginationParams {
  action?: string;
  entity_type?: string;
  organization_id?: string;
}
export type AuditList = PaginatedResult<AuditLog>;
