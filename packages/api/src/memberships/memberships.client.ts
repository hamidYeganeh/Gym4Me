import type { ApiClient } from "../client";
import { accountMembershipsEndpoints as ep } from "./memberships.endpoint";
import type {
  CancelMembershipInput,
  CancelPlatformSubscriptionInput,
  ClubMembership,
  ClubMembershipPlan,
  ConsumeMembershipCreditInput,
  ListClubMembershipsQuery,
  ListMyMembershipsQuery,
  ImportMembershipsInput,
  ImportMembershipsResult,
  MembershipsPage,
  MembershipPlansPage,
  PlatformPlansResponse,
  PlatformSubscription,
  PlatformSubscriptionsResponse,
  SelfPurchaseMembershipInput,
  SellMembershipInput,
  SubscribePlatformInput,
  TransferMembershipInput,
} from "./memberships.dto";

export function createAccountMembershipsApi(client: ApiClient) {
  return {
    listMine(query: ListMyMembershipsQuery = {}) {
      return client.request<MembershipsPage>(ep.mine, { query });
    },

    getMine(id: string) {
      return client.request<ClubMembership>(ep.mineById(id));
    },

    purchase(input: SelfPurchaseMembershipInput) {
      return client.request<ClubMembership>(ep.purchase, {
        method: "POST",
        body: input,
      });
    },

    /** Public plan catalog (no auth) — used before purchase. */
    listPublicClubPlans(
      clubId: string,
      query: { page?: number; page_size?: number } = {},
    ) {
      return client.request<MembershipPlansPage>(ep.discoveryPlans(clubId), {
        query,
      });
    },

    getPublicClubPlan(clubId: string, planId: string) {
      return client.request<ClubMembershipPlan>(
        ep.discoveryPlan(clubId, planId),
      );
    },

    listPublicPlatformPlans() {
      return client.request<PlatformPlansResponse>(ep.discoveryPlatformPlans);
    },

    listClubPlans(
      clubId: string,
      query: { page?: number; page_size?: number } = {},
    ) {
      return client.request<MembershipPlansPage>(ep.clubPlans(clubId), {
        query,
      });
    },

    getClubPlan(clubId: string, planId: string) {
      return client.request<ClubMembershipPlan>(ep.clubPlan(clubId, planId));
    },

    listClubMemberships(clubId: string, query: ListClubMembershipsQuery = {}) {
      return client.request<MembershipsPage>(ep.clubMemberships(clubId), {
        query,
      });
    },

    getClubMembership(clubId: string, membershipId: string) {
      return client.request<ClubMembership>(
        ep.clubMembership(clubId, membershipId),
      );
    },

    sell(clubId: string, input: SellMembershipInput) {
      return client.request<ClubMembership>(ep.sell(clubId), {
        method: "POST",
        body: input,
      });
    },

    import(clubId: string, input: ImportMembershipsInput) {
      return client.request<ImportMembershipsResult>(ep.import(clubId), {
        method: "POST",
        body: input,
      });
    },

    freeze(
      clubId: string,
      membershipId: string,
      input: { unfreezeAt?: string; reason?: string } = {},
    ) {
      return client.request<ClubMembership>(ep.freeze(clubId, membershipId), {
        method: "POST",
        body: input,
      });
    },

    unfreeze(clubId: string, membershipId: string) {
      return client.request<ClubMembership>(ep.unfreeze(clubId, membershipId), {
        method: "POST",
        body: {},
      });
    },

    transfer(
      clubId: string,
      membershipId: string,
      input: TransferMembershipInput,
    ) {
      return client.request<ClubMembership>(ep.transfer(clubId, membershipId), {
        method: "POST",
        body: input,
      });
    },

    cancel(
      clubId: string,
      membershipId: string,
      input: CancelMembershipInput = {},
    ) {
      return client.request<ClubMembership>(ep.cancel(clubId, membershipId), {
        method: "POST",
        body: input,
      });
    },

    consume(
      clubId: string,
      membershipId: string,
      input: ConsumeMembershipCreditInput = {},
    ) {
      return client.request<ClubMembership>(ep.consume(clubId, membershipId), {
        method: "POST",
        body: input,
      });
    },

    // ── Platform SaaS subscriptions ─────────────────────────────────────────

    listPlatformPlans() {
      return client.request<PlatformPlansResponse>(ep.platformPlans);
    },

    listPlatformSubscriptions() {
      return client.request<PlatformSubscriptionsResponse>(
        ep.platformSubscriptions,
      );
    },

    subscribePlatform(input: SubscribePlatformInput) {
      return client.request<PlatformSubscription>(ep.platformSubscriptions, {
        method: "POST",
        body: input,
      });
    },

    cancelPlatformSubscription(
      subscriptionId: string,
      input: CancelPlatformSubscriptionInput = {},
    ) {
      return client.request<PlatformSubscription>(
        ep.cancelPlatformSubscription(subscriptionId),
        { method: "POST", body: input },
      );
    },
  };
}

export type AccountMembershipsApi = ReturnType<
  typeof createAccountMembershipsApi
>;
