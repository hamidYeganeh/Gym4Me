import { z } from "zod";
import { VERIFICATION_DECISIONS } from "../../../common/enums/index.js";
import { CASE_STATUSES, DOCUMENT_REVIEW_STATUSES } from "../enums/index.js";

export const objectId = z.string().regex(/^[0-9a-f]{24}$/i, "شناسه نامعتبر است.");
const document = z.object({
  id: z.string().trim().min(1).max(80),
  type: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(160),
  file: z.object({
    url: z.string().url(),
    mime_type: z.string().trim().max(120),
    size_bytes: z.number().int().min(1).max(20_000_000),
  }),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export const coachVerificationSubmitSchema = z.object({
  type: z.string().trim().min(2).max(80).default("professional_identity"),
  documents: z.array(document).min(1).max(20),
  custom_data: z.record(z.string(), z.unknown()).default({}),
});
export const clubVerificationSubmitSchema = coachVerificationSubmitSchema.extend({
  club_id: objectId,
});
export const verificationListSchema = z.object({
  status: z.enum(CASE_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const verificationReviewSchema = z.object({
  decision: z.enum(VERIFICATION_DECISIONS),
  note: z.string().trim().min(2).max(2000),
  document_results: z
    .array(
      z.object({
        document_id: z.string().trim().min(1).max(80),
        status: z.enum(DOCUMENT_REVIEW_STATUSES),
        note: z.string().trim().max(500).optional(),
      }),
    )
    .max(20)
    .default([]),
});
