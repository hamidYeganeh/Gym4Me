import { audit, createSchema, customData, mixed, objectId, status } from "../../../database/mongoose.js";
import { COACHING_STATUSES, MESSAGE_STATUSES } from "../enums/index.js";

export const coachModels = {
  CoachProfile: createSchema({
    userId: { type: objectId, ref: "User", required: true, unique: true },
    professional: { type: mixed, default: () => ({}) },
    specialties: [{ type: objectId, ref: "TaxonomyTerm" }],
    serviceModes: [String],
    services: [mixed],
    locations: [mixed],
    availabilitySummary: { type: mixed, default: () => ({}) },
    verification: {
      status: { type: String, default: "unverified", index: true },
      documents: [mixed],
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: objectId,
      reason: String,
    },
    customData,
    status,
    ...audit,
  }),
  CoachingRelationship: createSchema({
    coachProfileId: { type: objectId, ref: "CoachProfile", required: true, index: true },
    coachUserId: { type: objectId, ref: "User", required: true, index: true },
    athleteUserId: { type: objectId, ref: "User", required: true, index: true },
    profile: { type: mixed, default: () => ({}) },
    coaching: { type: mixed, default: () => ({}) },
    lifecycle: { type: mixed, default: () => ({}) },
    status: { type: String, enum: COACHING_STATUSES, default: "requested", index: true },
    customData,
    ...audit,
  }),
  CoachingMessage: createSchema({
    relationshipId: { type: objectId, ref: "CoachingRelationship", required: true, index: true },
    senderUserId: { type: objectId, ref: "User", required: true },
    content: { text: { type: String, required: true }, attachments: [mixed] },
    delivery: { type: mixed, default: () => ({}) },
    status: { type: String, enum: MESSAGE_STATUSES, default: "sent", index: true },
    ...audit,
  }),
} as const;

coachModels.CoachProfile.index({ status: 1, "verification.status": 1 });
coachModels.CoachProfile.index({
  "professional.displayName": "text",
  "professional.bio.fa": "text",
});
coachModels.CoachingRelationship.index({ coachProfileId: 1, athleteUserId: 1 }, { unique: true });
coachModels.CoachingMessage.index({ relationshipId: 1, createdAt: -1 });
