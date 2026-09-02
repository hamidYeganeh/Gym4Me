import { audit, createSchema, customData, mixed, objectId, status } from "../../../database/mongoose.js";

export const advertisingModels = {
  AdAccount: createSchema({ owner: mixed, billing: mixed, status, ...audit }),
  AdPlacement: createSchema({
    code: { type: String, required: true, unique: true },
    profile: { type: mixed, default: () => ({}) },
    pricing: { type: mixed, default: () => ({}) },
    rules: { type: mixed, default: () => ({}) },
    status,
    ...audit,
  }),
  AdCampaign: createSchema({
    accountId: { type: objectId, ref: "AdAccount", required: true, index: true },
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    profile: { type: mixed, default: () => ({}) },
    placementIds: [objectId],
    targeting: { type: mixed, default: () => ({}) },
    budget: { type: mixed, default: () => ({}) },
    schedule: { type: mixed, default: () => ({}) },
    creatives: [mixed],
    metrics: { type: mixed, default: () => ({}) },
    review: { type: mixed, default: () => ({}) },
    status,
    customData,
    ...audit,
  }),
  AdMetricEvent: createSchema(
    {
      campaignId: { type: objectId, ref: "AdCampaign", required: true },
      eventId: { type: String, required: true },
      type: { type: String, required: true },
      context: { type: mixed, default: () => ({}) },
      costMinor: { type: Number, default: 0 },
      occurredAt: { type: Date, required: true },
    },
    { timestamps: false },
  ),
} as const;

advertisingModels.AdAccount.index({ "owner.organizationId": 1 }, { unique: true, sparse: true });
advertisingModels.AdCampaign.index({ organizationId: 1, status: 1, createdAt: -1 });
advertisingModels.AdCampaign.index({ placementIds: 1, status: 1, "schedule.startsAt": 1 });
advertisingModels.AdMetricEvent.index({ campaignId: 1, eventId: 1 }, { unique: true });
advertisingModels.AdMetricEvent.index({ campaignId: 1, occurredAt: -1 });
