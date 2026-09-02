import { audit, createSchema, customData, mixed, objectId, status } from "../../../database/mongoose.js";

export const membershipModels = {
  MembershipProduct: createSchema({
    organizationId: objectId,
    profile: mixed,
    scope: mixed,
    benefits: mixed,
    pricing: [mixed],
    rules: mixed,
    status,
    customData,
    ...audit,
  }),
  MembershipContract: createSchema({
    productId: objectId,
    purchaserUserId: objectId,
    beneficiaries: [mixed],
    validity: mixed,
    balances: mixed,
    status,
    customData,
    ...audit,
  }),
  MembershipUsage: createSchema({
    contractId: objectId,
    beneficiaryUserId: objectId,
    bookingId: objectId,
    usage: mixed,
    status,
    ...audit,
  }),
  CorporateAccount: createSchema({
    organizationId: objectId,
    profile: mixed,
    billing: mixed,
    status,
    customData,
    ...audit,
  }),
  CorporateMember: createSchema({
    corporateAccountId: { type: objectId, ref: "CorporateAccount", required: true },
    userId: { type: objectId, ref: "User", required: true },
    profile: mixed,
    eligibility: mixed,
    status,
    customData,
    ...audit,
  }),
  CorporateContract: createSchema({
    corporateAccountId: objectId,
    providerOrganizationId: objectId,
    productId: { type: objectId, ref: "MembershipProduct", required: true },
    scope: mixed,
    benefits: [mixed],
    budget: mixed,
    validity: mixed,
    status,
    ...audit,
  }),
  PlatformPlan: createSchema({
    persona: String,
    profile: mixed,
    prices: [mixed],
    entitlements: [mixed],
    status,
    customData,
    ...audit,
  }),
  PlatformSubscription: createSchema({
    subscriber: mixed,
    planId: objectId,
    billing: mixed,
    validity: mixed,
    entitlementUsage: mixed,
    status,
    ...audit,
  }),
} as const;

membershipModels.MembershipUsage.index(
  { bookingId: 1, contractId: 1 },
  { unique: true, sparse: true },
);
membershipModels.MembershipContract.index({
  "beneficiaries.userId": 1,
  status: 1,
  "validity.endsAt": 1,
});
membershipModels.MembershipContract.index(
  { purchaserUserId: 1, "customData.idempotencyKey": 1 },
  { unique: true, sparse: true },
);
membershipModels.MembershipContract.index(
  { "customData.corporateContractId": 1, "customData.corporateMemberId": 1 },
  { unique: true, sparse: true },
);
membershipModels.CorporateMember.index({ corporateAccountId: 1, userId: 1 }, { unique: true });
membershipModels.CorporateMember.index({ corporateAccountId: 1, status: 1 });
membershipModels.CorporateContract.index({
  providerOrganizationId: 1,
  corporateAccountId: 1,
  status: 1,
  "validity.endsAt": -1,
});
