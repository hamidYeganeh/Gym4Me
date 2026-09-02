import type { ApiMeta } from "../../core/contracts";
import type { ApiClient } from "../../core/client";
import type {
  ApiEntity,
  BranchInput,
  BranchPatch,
  ClubInput,
  ClubPatch,
  ClubVerificationInput,
  OrganizationInput,
  OrganizationInvitationInput,
  OrganizationPatch,
  PaginatedResult,
  PaginationMeta,
  PaginationParams,
  StatusUpdateInput,
} from "./types";

const segment = encodeURIComponent;

async function list<T>(
  client: ApiClient,
  path: string,
  params: PaginationParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<T>> {
  const response = await client.get<T[]>(path, {
    query: { page: params.page, limit: params.limit },
    ...(signal ? { signal } : {}),
  });
  const meta = response.meta as ApiMeta & { pagination?: PaginationMeta };
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return {
    items: response.data,
    meta: response.meta,
    pagination: meta.pagination ?? {
      page,
      limit,
      total: response.data.length,
      pages: response.data.length ? 1 : 0,
    },
  };
}

export const organizationsApi = {
  list: <T = ApiEntity>(client: ApiClient, params: PaginationParams = {}, signal?: AbortSignal) =>
    list<T>(client, "/organizations", params, signal),

  async get<T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return (
      await client.get<T>(
        `/organizations/${segment(organizationId)}`,
        signal ? { signal } : undefined,
      )
    ).data;
  },

  async create<T = ApiEntity>(client: ApiClient, input: OrganizationInput): Promise<T> {
    return (await client.post<T, OrganizationInput>("/organizations", input)).data;
  },

  async update<T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    input: OrganizationPatch,
  ): Promise<T> {
    return (
      await client.patch<T, OrganizationPatch>(`/organizations/${segment(organizationId)}`, input)
    ).data;
  },

  async submit<T = ApiEntity>(client: ApiClient, organizationId: string): Promise<T> {
    return (await client.post<T>(`/organizations/${segment(organizationId)}/submit`)).data;
  },

  async archive<T = ApiEntity>(client: ApiClient, organizationId: string): Promise<T> {
    return (await client.delete<T>(`/organizations/${segment(organizationId)}`)).data;
  },

  listClubs: <T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, `/organizations/${segment(organizationId)}/clubs`, params, signal),

  async getClub<T = ApiEntity>(
    client: ApiClient,
    clubId: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return (await client.get<T>(`/clubs/${segment(clubId)}`, signal ? { signal } : undefined)).data;
  },

  async createClub<T = ApiEntity>(client: ApiClient, input: ClubInput): Promise<T> {
    return (await client.post<T, ClubInput>("/clubs", input)).data;
  },

  async updateClub<T = ApiEntity>(client: ApiClient, clubId: string, input: ClubPatch): Promise<T> {
    return (await client.patch<T, ClubPatch>(`/clubs/${segment(clubId)}`, input)).data;
  },

  listBranches: <T = ApiEntity>(
    client: ApiClient,
    clubId: string,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, `/clubs/${segment(clubId)}/branches`, params, signal),

  async getBranch<T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return (await client.get<T>(`/branches/${segment(branchId)}`, signal ? { signal } : undefined))
      .data;
  },

  async createBranch<T = ApiEntity>(
    client: ApiClient,
    clubId: string,
    input: BranchInput,
  ): Promise<T> {
    return (await client.post<T, BranchInput>(`/clubs/${segment(clubId)}/branches`, input)).data;
  },

  async updateBranch<T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    input: BranchPatch,
  ): Promise<T> {
    return (await client.patch<T, BranchPatch>(`/branches/${segment(branchId)}`, input)).data;
  },

  async members<T = ApiEntity[]>(
    client: ApiClient,
    organizationId: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return (
      await client.get<T>(
        `/organizations/${segment(organizationId)}/members`,
        signal ? { signal } : undefined,
      )
    ).data;
  },

  async invitations<T = ApiEntity[]>(
    client: ApiClient,
    organizationId: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return (
      await client.get<T>(
        `/organizations/${segment(organizationId)}/invitations`,
        signal ? { signal } : undefined,
      )
    ).data;
  },

  async staffRoles<T = ApiEntity[]>(
    client: ApiClient,
    organizationId: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return (
      await client.get<T>(
        `/organizations/${segment(organizationId)}/staff-roles`,
        signal ? { signal } : undefined,
      )
    ).data;
  },

  async invite<T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    input: OrganizationInvitationInput,
  ): Promise<T> {
    return (
      await client.post<T, OrganizationInvitationInput>(
        `/organizations/${segment(organizationId)}/invitations`,
        input,
      )
    ).data;
  },

  async revokeInvitation<T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    invitationId: string,
  ): Promise<T> {
    return (
      await client.delete<T>(
        `/organizations/${segment(organizationId)}/invitations/${segment(invitationId)}`,
      )
    ).data;
  },

  async updateMemberStatus<T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    memberId: string,
    status: "active" | "suspended" | "ended",
  ): Promise<T> {
    return (
      await client.patch<T, { status: string }>(
        `/organizations/${segment(organizationId)}/members/${segment(memberId)}/status`,
        { status },
      )
    ).data;
  },

  async setWorkingHours<T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    days: ApiEntity[],
  ): Promise<T> {
    return (
      await client.put<T, { days: ApiEntity[] }>(`/branches/${segment(branchId)}/working-hours`, {
        days,
      })
    ).data;
  },

  async addHoliday<T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    input: ApiEntity,
  ): Promise<T> {
    return (await client.post<T, ApiEntity>(`/branches/${segment(branchId)}/holidays`, input)).data;
  },

  async removeHoliday<T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    holidayId: string,
  ): Promise<T> {
    return (await client.delete<T>(`/branches/${segment(branchId)}/holidays/${segment(holidayId)}`))
      .data;
  },

  adminOrganizations: <T = ApiEntity>(
    client: ApiClient,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, "/admin/organizations", params, signal),

  adminClubs: <T = ApiEntity>(
    client: ApiClient,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, "/admin/clubs", params, signal),

  adminBranches: <T = ApiEntity>(
    client: ApiClient,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, "/admin/branches", params, signal),

  async updateOrganizationStatus<T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    input: StatusUpdateInput,
  ): Promise<T> {
    return (
      await client.patch<T, StatusUpdateInput>(
        `/admin/organizations/${segment(organizationId)}/status`,
        input,
      )
    ).data;
  },

  async updateBranchStatus<T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    input: StatusUpdateInput,
  ): Promise<T> {
    return (
      await client.patch<T, StatusUpdateInput>(`/admin/branches/${segment(branchId)}/status`, input)
    ).data;
  },

  async verifyClub<T = ApiEntity>(
    client: ApiClient,
    clubId: string,
    input: ClubVerificationInput,
  ): Promise<T> {
    return (
      await client.patch<T, ClubVerificationInput>(
        `/admin/clubs/${segment(clubId)}/verification`,
        input,
      )
    ).data;
  },
};
