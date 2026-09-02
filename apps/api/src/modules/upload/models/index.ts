import { audit, createSchema, customData, mixed, objectId, status } from "../../../database/mongoose.js";

export const uploadModels = {
  Asset: createSchema({
    ownerUserId: { type: objectId, ref: "User", required: true, index: true },
    organizationId: { type: objectId, ref: "Organization", index: true },
    profile: mixed,
    storage: mixed,
    access: mixed,
    status,
    customData,
    ...audit,
  }),
} as const;

uploadModels.Asset.index({ ownerUserId: 1, status: 1, createdAt: -1 });
uploadModels.Asset.index({ organizationId: 1, status: 1, createdAt: -1 });
