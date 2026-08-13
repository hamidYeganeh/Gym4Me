import type { Paginated } from "../types";

export type AuditLogItem = {
  id: string;
  action: string;
  actorId: string | null;
  targetUserId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ListAuditLogsQuery = {
  page?: number;
  page_size?: number;
  action?: string;
  actorId?: string;
  targetUserId?: string;
};

export type StartImpersonationInput = {
  targetUserId: string;
  reason: string;
};

export type ImpersonationSession = {
  id: string;
  adminId: string;
  targetUserId: string;
  reason: string;
  status: string;
  startedAt: string;
  endedAt?: string | null;
  note?: string;
};

/** `start` additionally returns a short-lived access token for the target user. */
export type StartImpersonationResult = ImpersonationSession & {
  accessToken: string;
  expiresInSeconds: number;
};

export type AuditLogsPage = Paginated<AuditLogItem>;
