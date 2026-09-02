import { audit, createSchema, mixed, objectId, status } from "../../../database/mongoose.js";

export const financeModels = {
  CommissionRule: createSchema({
    scope: { type: { type: String, required: true }, id: { type: objectId, required: true } },
    profile: mixed,
    appliesTo: mixed,
    calculation: mixed,
    priority: { type: Number, default: 0 },
    validity: mixed,
    status,
    ...audit,
  }),
  TaxRule: createSchema({
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    scope: mixed,
    profile: mixed,
    calculation: mixed,
    validity: mixed,
    priority: { type: Number, default: 0 },
    status,
    ...audit,
  }),
  Settlement: createSchema({
    beneficiary: mixed,
    period: mixed,
    totals: mixed,
    items: [mixed],
    status: { type: String, default: "pending" },
    ...audit,
  }),
} as const;

financeModels.CommissionRule.index({ "scope.type": 1, "scope.id": 1, status: 1, priority: -1 });
financeModels.TaxRule.index({ organizationId: 1, "scope.type": 1, "scope.id": 1, status: 1 });
financeModels.Settlement.index({
  "beneficiary.type": 1,
  "beneficiary.id": 1,
  "period.startsAt": -1,
});
