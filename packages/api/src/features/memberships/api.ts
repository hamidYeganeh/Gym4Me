import type { ApiClient } from "../../core/client";
import type {
  ApiEntity,
  MembershipListParams,
  MembershipProductInput,
  MembershipProductPatch,
  CorporateAccountInput,
  CorporateAccountPatch,
  CorporateMemberInput,
  CorporateMemberPatch,
  CorporateContractInput,
  CorporateContractPatch,
  AdminMembershipListParams,
  AdminMembershipResource,
} from "./types";
const e = encodeURIComponent;
async function list(c: ApiClient, path: string, p: MembershipListParams = {}, s?: AbortSignal) {
  const r = await c.get<ApiEntity[]>(path, { query: p as any, ...(s ? { signal: s } : {}) });
  return { items: r.data, meta: r.meta, pagination: (r.meta as any).pagination };
}
export const membershipsApi = {
  catalog: (c: ApiClient, org: string, p: MembershipListParams = {}, s?: AbortSignal) =>
    list(c, `/catalog/organizations/${e(org)}/memberships`, p, s),
  managed: (c: ApiClient, org: string, p: MembershipListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(org)}/memberships/products`, p, s),
  contracts: (c: ApiClient, org: string, p: MembershipListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(org)}/memberships/contracts`, p, s),
  mine: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/memberships/me", s ? { signal: s } : undefined)).data,
  eligible: async (c: ApiClient, offeringId: string, branchId: string, s?: AbortSignal) =>
    (
      await c.get<ApiEntity[]>("/memberships/eligible", {
        query: { offering_id: offeringId, branch_id: branchId },
        ...(s ? { signal: s } : {}),
      })
    ).data,
  create: async (c: ApiClient, org: string, input: MembershipProductInput) =>
    (await c.post<ApiEntity>(`/organizations/${e(org)}/memberships/products`, input)).data,
  update: async (c: ApiClient, org: string, id: string, input: MembershipProductPatch) =>
    (await c.patch<ApiEntity>(`/organizations/${e(org)}/memberships/products/${e(id)}`, input))
      .data,
  purchase: async (
    c: ApiClient,
    id: string,
    input: {
      price_id: string;
      beneficiaries: Array<{ user_id: string; relationship?: string }>;
      idempotency_key: string;
      payment_method?: "wallet" | "sandbox_gateway";
    },
  ) => (await c.post<ApiEntity>(`/memberships/products/${e(id)}/purchase`, input)).data,
  corporateAccounts: (c: ApiClient, org: string, p: MembershipListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(org)}/memberships/corporate-accounts`, p, s),
  createCorporateAccount: async (c: ApiClient, org: string, input: CorporateAccountInput) =>
    (await c.post<ApiEntity>(`/organizations/${e(org)}/memberships/corporate-accounts`, input))
      .data,
  updateCorporateAccount: async (
    c: ApiClient,
    org: string,
    id: string,
    input: CorporateAccountPatch,
  ) =>
    (
      await c.patch<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-accounts/${e(id)}`,
        input,
      )
    ).data,
  corporateMembers: (
    c: ApiClient,
    org: string,
    accountId: string,
    p: MembershipListParams = {},
    s?: AbortSignal,
  ) =>
    list(
      c,
      `/organizations/${e(org)}/memberships/corporate-accounts/${e(accountId)}/members`,
      p,
      s,
    ),
  addCorporateMember: async (
    c: ApiClient,
    org: string,
    accountId: string,
    input: CorporateMemberInput,
  ) =>
    (
      await c.post<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-accounts/${e(accountId)}/members`,
        input,
      )
    ).data,
  updateCorporateMember: async (
    c: ApiClient,
    org: string,
    accountId: string,
    memberId: string,
    input: CorporateMemberPatch,
  ) =>
    (
      await c.patch<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-accounts/${e(accountId)}/members/${e(memberId)}`,
        input,
      )
    ).data,
  corporateContracts: (c: ApiClient, org: string, p: MembershipListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(org)}/memberships/corporate-contracts`, p, s),
  createCorporateContract: async (c: ApiClient, org: string, input: CorporateContractInput) =>
    (await c.post<ApiEntity>(`/organizations/${e(org)}/memberships/corporate-contracts`, input))
      .data,
  updateCorporateContract: async (
    c: ApiClient,
    org: string,
    id: string,
    input: CorporateContractPatch,
  ) =>
    (
      await c.patch<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-contracts/${e(id)}`,
        input,
      )
    ).data,
  enrollCorporateMember: async (
    c: ApiClient,
    org: string,
    contractId: string,
    input: { corporate_member_id: string; idempotency_key: string },
  ) =>
    (
      await c.post<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-contracts/${e(contractId)}/enrollments`,
        input,
      )
    ).data,
  corporateEnrollments: (
    c: ApiClient,
    org: string,
    contractId: string,
    p: MembershipListParams = {},
    s?: AbortSignal,
  ) =>
    list(
      c,
      `/organizations/${e(org)}/memberships/corporate-contracts/${e(contractId)}/enrollments`,
      p,
      s,
    ),
  endCorporateEnrollment: async (
    c: ApiClient,
    org: string,
    contractId: string,
    enrollmentId: string,
    reason: string,
  ) =>
    (
      await c.post<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-contracts/${e(contractId)}/enrollments/${e(enrollmentId)}/end`,
        { reason },
      )
    ).data,
  renewCorporateContract: async (
    c: ApiClient,
    org: string,
    contractId: string,
    input: {
      ends_at: string | Date;
      budget_amount_minor?: string;
      extend_active_enrollments?: boolean;
    },
  ) =>
    (
      await c.post<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-contracts/${e(contractId)}/renew`,
        input,
      )
    ).data,
  resetCorporateBudget: async (
    c: ApiClient,
    org: string,
    contractId: string,
    input: { amount_minor?: string; reason: string },
  ) =>
    (
      await c.post<ApiEntity>(
        `/organizations/${e(org)}/memberships/corporate-contracts/${e(contractId)}/reset-budget`,
        input,
      )
    ).data,
  adminList: (
    c: ApiClient,
    resource: AdminMembershipResource,
    p: AdminMembershipListParams = {},
    s?: AbortSignal,
  ) => list(c, `/admin/memberships/${e(resource)}`, p, s),
  adminStatus: async (
    c: ApiClient,
    resource: AdminMembershipResource,
    id: string,
    status: "draft" | "active" | "suspended" | "ended" | "archived" | "cancelled",
    reason: string,
  ) =>
    (
      await c.patch<ApiEntity>(`/admin/memberships/${e(resource)}/${e(id)}/status`, {
        status,
        reason,
      })
    ).data,
};
