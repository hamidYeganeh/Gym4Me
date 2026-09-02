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
  MembershipCheckoutInitiation,
  MembershipCheckoutPreview,
  MembershipCheckoutResult,
  MembershipRenewalPreview,
  MembershipRenewalResult,
  InitiateMembershipCheckoutInput,
  InitiatePlatformSubscriptionCheckoutInput,
  PlatformPlansResponse,
  PlatformEntitlementSummary,
  PlatformSubscription,
  PlatformSubscriptionCheckoutInitiation,
  PlatformSubscriptionCheckoutPreview,
  PlatformSubscriptionCheckoutResult,
  PlatformSubscriptionsResponse,
  PublicMembershipPlanSummariesResponse,
  PreviewMembershipRenewalInput,
  PreviewMembershipCheckoutInput,
  PreviewPlatformSubscriptionCheckoutInput,
  RenewMembershipInput,
  SelfPurchaseMembershipInput,
  SellMembershipInput,
  SubscribePlatformInput,
  SchedulePlatformPlanChangeInput,
  TransferMembershipInput,
  VerifyMembershipCheckoutInput,
  VerifyPlatformSubscriptionCheckoutInput,
} from "./memberships.dto";

const asObject = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? (value as Record<string, any>) : {};
const asId = (value: unknown) => String(asObject(value)._id ?? asObject(value).id ?? value ?? "");
const toman = (minor: unknown) =>
  Number(BigInt(String(minor ?? "0")) / BigInt(10));

function currentUserId(client: ApiClient): string {
  const id = client.getSession()?.user?.id;
  if (!id) throw new Error("An authenticated user is required for membership purchase.");
  return id;
}

function normalizePlan(value: unknown, branchId: string): ClubMembershipPlan {
  const item = asObject(value);
  const profile = asObject(item.profile);
  const price = asObject(Array.isArray(item.pricing) ? item.pricing[0] : null);
  const type = String(profile.type ?? "duration");
  const kind: ClubMembershipPlan["kind"] =
    type === "entries" ? "entries" : type === "duration" ? "duration" : "sessions";
  return {
    id: asId(item),
    clubId: branchId,
    name: String(profile.name ?? "عضویت باشگاه"),
    description: String(asObject(profile.description).fa ?? ""),
    kind,
    pricing: {
      amount: toman(price.amountMinor),
      currency: "IRT",
    },
    durationDays: Number(price.durationDays ?? 0) || undefined,
    entriesTotal: Number(asObject(item.benefits).entryLimit ?? 0) || undefined,
    status: String(item.status ?? "active"),
    publishStatus: String(item.status ?? "active"),
    createdAt: String(item.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date(0).toISOString()),
  };
}

function normalizeContract(value: unknown): ClubMembership {
  const item = asObject(value);
  const product = asObject(item.product);
  const profile = asObject(product.profile);
  const snapshot = asObject(asObject(item.customData).priceSnapshot);
  const scope = asObject(asObject(item.customData).scopeSnapshot);
  const branchId = String((scope.branchIds ?? [])[0] ?? "");
  const status = String(item.status ?? "active");
  return {
    id: asId(item),
    clubId: branchId,
    planId: asId(item.productId),
    holder: { userId: asId(item.purchaserUserId) },
    status: (status === "pending_payment" ? "frozen" : status) as ClubMembership["status"],
    credit: {
      remainingEntries:
        asObject(item.balances).entriesRemaining == null
          ? undefined
          : Number(asObject(item.balances).entriesRemaining),
      expiresAt: asObject(item.validity).endsAt
        ? String(asObject(item.validity).endsAt)
        : undefined,
    },
    createdAt: String(item.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date(0).toISOString()),
    clubName: "باشگاه",
    planName: String(profile.name ?? "عضویت"),
    entriesTotal: Number(asObject(product.benefits).entryLimit ?? 0) || undefined,
    durationDays: Number(snapshot.durationDays ?? 0) || undefined,
    pricing: { amount: toman(snapshot.amountMinor), currency: "IRT" },
  };
}

export function createAccountMembershipsApi(client: ApiClient) {
  return {
    async listMine(query: ListMyMembershipsQuery = {}) {
      const rows = await client.request<unknown[]>(ep.mine, { query });
      const result = rows.map(normalizeContract);
      return {
        result,
        pagination: { page: 1, page_size: result.length, count: result.length, total: result.length, prev: null, next: null },
      } as MembershipsPage;
    },

    getMine(id: string) {
      return client.request<ClubMembership>(ep.mineById(id));
    },

    async purchase(input: SelfPurchaseMembershipInput) {
      const plan = await this.getPublicClubPlan(input.clubId, input.planId);
      const raw = await client.request<unknown>(`/memberships/products/${input.planId}/purchase`, {
        method: "POST",
        body: {
          price_id: (plan as any).__priceId ?? "default",
          beneficiaries: [{ user_id: currentUserId(client) }],
          idempotency_key: input.idempotencyKey ?? crypto.randomUUID(),
          payment_method: plan.pricing.amount > 0 ? "sandbox_gateway" : "wallet",
        },
      });
      return normalizeContract(asObject(raw).contract ?? raw);
    },

    async previewCheckout(input: PreviewMembershipCheckoutInput) {
      const plan = await this.getPublicClubPlan(input.clubId, input.planId);
      return {
        mode: input.membershipId ? "renewal" : "purchase",
        fingerprint: `${plan.id}:${plan.updatedAt}:${plan.pricing.amount}`,
        consentVersion: input.membershipId ? "membership-renewal-v1" : "membership-checkout-v1",
        plan: { id: plan.id, name: plan.name, kind: plan.kind },
        price: { gross: plan.pricing.amount, discount: 0, tax: 0, payable: plan.pricing.amount, currency: "IRT" },
        currentCredit: {},
        resultingCredit: { expiresAt: plan.durationDays ? new Date(Date.now() + plan.durationDays * 86_400_000).toISOString() : undefined, remainingEntries: plan.entriesTotal },
      } as MembershipCheckoutPreview;
    },

    async initiateCheckout(input: InitiateMembershipCheckoutInput) {
      const plan = await this.getPublicClubPlan(input.clubId, input.planId);
      const raw = asObject(await client.request<unknown>(`/memberships/products/${input.planId}/purchase`, {
        method: "POST",
        body: {
          price_id: (plan as any).__priceId ?? "default",
          beneficiaries: [{ user_id: currentUserId(client) }],
          idempotency_key: input.idempotencyKey,
          payment_method: plan.pricing.amount > 0 ? "sandbox_gateway" : "wallet",
        },
      }));
      const paymentId = String(asObject(raw.nextAction).paymentId ?? asId(raw.payment));
      return {
        checkoutId: paymentId || asId(raw.contract),
        mode: input.membershipId ? "renewal" : "purchase",
        fingerprint: input.previewFingerprint,
        consentVersion: input.consentVersion,
        price: { gross: plan.pricing.amount, discount: 0, tax: 0, payable: plan.pricing.amount, currency: "IRT" },
        resultingCredit: { expiresAt: plan.durationDays ? new Date(Date.now() + plan.durationDays * 86_400_000).toISOString() : undefined, remainingEntries: plan.entriesTotal },
        authority: paymentId,
        redirectUrl: paymentId
          ? `/athlete/payment/test?paymentId=${encodeURIComponent(paymentId)}&returnPath=${encodeURIComponent("/athlete/memberships")}`
          : "/athlete/memberships",
        expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
        idempotent: false,
      } as MembershipCheckoutInitiation;
    },

    async verifyCheckout(
      checkoutId: string,
      input: VerifyMembershipCheckoutInput,
    ) {
      void input;
      return { checkoutId, status: "completed", idempotent: true } as MembershipCheckoutResult;
    },

    previewMyRenewal(membershipId: string) {
      return client.request<MembershipRenewalPreview>(
        ep.mineRenewalPreview(membershipId),
        { method: "POST", body: {} },
      );
    },

    /** Public plan catalog (no auth) — used before purchase. */
    async listPublicClubPlans(
      clubId: string,
      query: { page?: number; page_size?: number } = {},
    ) {
      const branch = asObject(await client.request<unknown>(`/catalog/branches/${clubId}`, { public: true }));
      const organizationId = asId(asObject(branch.club).organizationId);
      if (!organizationId)
        return { result: [], pagination: { page: 1, page_size: 0, count: 0, total: 0, prev: null, next: null } } as MembershipPlansPage;
      const page = await client.request<any>(`/catalog/organizations/${organizationId}/memberships`, { query, public: true });
      const rows = Array.isArray(page?.result) ? page.result : [];
      const result = rows.map((item: unknown) => {
        const plan = normalizePlan(item, clubId) as ClubMembershipPlan & { __priceId?: string };
        plan.__priceId = String(asObject((asObject(item).pricing ?? [])[0]).id ?? "default");
        return plan;
      });
      return { ...page, result } as MembershipPlansPage;
    },

    async getPublicClubPlan(clubId: string, planId: string) {
      const page = await this.listPublicClubPlans(clubId, { page_size: 100 });
      const plan = page.result.find((item) => item.id === planId);
      if (!plan) throw new Error("Membership plan was not found.");
      return plan;
    },

    listPublicPlanSummaries(clubIds: string[]) {
      return client.request<PublicMembershipPlanSummariesResponse>(
        ep.discoveryPlanSummaries,
        { query: { clubIds }, public: true },
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

    previewRenewal(
      clubId: string,
      membershipId: string,
      input: PreviewMembershipRenewalInput = {},
    ) {
      return client.request<MembershipRenewalPreview>(
        ep.renewalPreview(clubId, membershipId),
        { method: "POST", body: input },
      );
    },

    renew(
      clubId: string,
      membershipId: string,
      input: RenewMembershipInput,
    ) {
      return client.request<MembershipRenewalResult>(
        ep.renew(clubId, membershipId),
        { method: "POST", body: input },
      );
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

    getPlatformEntitlements(clubId?: string) {
      return client.request<PlatformEntitlementSummary>(
        ep.platformEntitlements,
        { query: clubId ? { clubId } : undefined },
      );
    },

    subscribePlatform(input: SubscribePlatformInput) {
      return client.request<PlatformSubscription>(ep.platformSubscriptions, {
        method: "POST",
        body: input,
      });
    },

    previewPlatformSubscriptionCheckout(
      input: PreviewPlatformSubscriptionCheckoutInput,
    ) {
      return client.request<PlatformSubscriptionCheckoutPreview>(
        ep.platformSubscriptionCheckoutPreview,
        { method: "POST", body: input },
      );
    },

    initiatePlatformSubscriptionCheckout(
      input: InitiatePlatformSubscriptionCheckoutInput,
    ) {
      return client.request<PlatformSubscriptionCheckoutInitiation>(
        ep.platformSubscriptionCheckoutInitiate,
        { method: "POST", body: input },
      );
    },

    verifyPlatformSubscriptionCheckout(
      checkoutId: string,
      input: VerifyPlatformSubscriptionCheckoutInput,
    ) {
      return client.request<PlatformSubscriptionCheckoutResult>(
        ep.platformSubscriptionCheckoutVerify(checkoutId),
        { method: "POST", body: input },
      );
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

    schedulePlatformPlanChange(
      subscriptionId: string,
      input: SchedulePlatformPlanChangeInput,
    ) {
      return client.request<PlatformSubscription>(
        ep.schedulePlatformPlanChange(subscriptionId),
        { method: "POST", body: input },
      );
    },
  };
}

export type AccountMembershipsApi = ReturnType<
  typeof createAccountMembershipsApi
>;
