import { audit, createSchema, mixed, objectId } from "../../../database/mongoose.js";
import { REVIEW_STATUSES, REVIEW_SUBJECTS } from "../enums/index.js";

export const reviewModels = {
  Review: createSchema({
    authorUserId: { type: objectId, ref: "User", required: true, index: true },
    subject: {
      type: { type: String, enum: REVIEW_SUBJECTS, required: true },
      id: { type: objectId, required: true },
      organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    },
    bookingId: { type: objectId, ref: "Booking", required: true, index: true },
    rating: { type: mixed, required: true },
    content: { type: mixed, default: () => ({}) },
    moderation: { type: mixed, default: () => ({ reports: [] }) },
    reply: { type: mixed, default: () => ({}) },
    status: { type: String, enum: REVIEW_STATUSES, default: "pending", index: true },
    ...audit,
  }),
} as const;

reviewModels.Review.index(
  { authorUserId: 1, bookingId: 1, "subject.type": 1 },
  { unique: true },
);
reviewModels.Review.index({ "subject.type": 1, "subject.id": 1, status: 1, createdAt: -1 });
