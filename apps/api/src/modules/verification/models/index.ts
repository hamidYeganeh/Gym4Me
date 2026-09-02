import { audit, createSchema, customData, mixed, objectId } from "../../../database/mongoose.js";
import { CASE_STATUSES, VERIFICATION_SUBJECTS } from "../enums/index.js";

export const verificationModels = {
  VerificationCase: createSchema({
    subject: {
      type: { type: String, enum: VERIFICATION_SUBJECTS, required: true },
      id: { type: objectId, required: true },
      organizationId: { type: objectId, ref: "Organization", index: true },
      ownerUserId: { type: objectId, ref: "User", required: true, index: true },
    },
    type: { type: String, required: true },
    documents: [mixed],
    review: { type: mixed, default: () => ({ history: [] }) },
    status: { type: String, enum: CASE_STATUSES, default: "pending", index: true },
    customData,
    ...audit,
  }),
} as const;

verificationModels.VerificationCase.index({ "subject.type": 1, "subject.id": 1, createdAt: -1 });
verificationModels.VerificationCase.index({ status: 1, createdAt: 1 });
